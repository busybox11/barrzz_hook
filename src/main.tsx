import { getReactInstance } from "./lib/inject";
import "./lib/intercept";

function handleRarityRowMounted(element: HTMLElement) {
  queueMicrotask(() => {
    const fiber = getReactInstance(element);
    if (!fiber) {
      console.warn("Could not find React Fiber for element:", element);
      return;
    }

    const currentProps = fiber.memoizedProps;
    if (currentProps) {
      console.log("Component Props:", currentProps);

      // Monkey-patch an onClick handler if it exists
      if (currentProps.onClick) {
        const originalOnClick = currentProps.onClick;
        currentProps.onClick = function (...args: any[]) {
          console.log(".rarity-row clicked! Intercepted args:", args);
          return originalOnClick.apply(this, args);
        };
      }
    }

    let updateQueue = fiber.memoizedState;
    while (updateQueue) {
      if (updateQueue.queue?.dispatch) {
        const originalDispatch = updateQueue.queue.dispatch;
        updateQueue.queue.dispatch = function (...args: any[]) {
          console.log("State change intercepted inside .rarity-row:", args);
          // You can modify args[0] here to change state values before React processes them!
          return originalDispatch.apply(this, args);
        };
      }
      updateQueue = updateQueue.next;
    }

    element.style.border = "2px dashed #8b5cf6";
  });
}

function startDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        if (node.matches(".rarity-row")) {
          handleRarityRowMounted(node);
        }

        const nestedRows = node.querySelectorAll(".rarity-row");
        nestedRows.forEach((row) => handleRarityRowMounted(row as HTMLElement));
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log(
    "Userscript: MutationObserver active, listening for .rarity-row...",
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startDOMObserver);
} else {
  startDOMObserver();
}
