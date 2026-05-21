import { getReactFiber } from "./lib/inject";
import { setupFetchHook } from "./lib/intercept";
import { mountHookButton, unmountAllHookButtons, unmountHookButton } from "./lib/mount";
import { closeSessionModal } from "./lib/modalStore";
import {
  getOtherSessionsForAlbum,
  loadSessionFromStorage,
  setAlbumsEvents,
} from "./lib/sessionData";

setupFetchHook({
  onAlbumEventsRq: (events, date) => {
    setAlbumsEvents(events);
    loadSessionFromStorage(date);
  },
})();

function cleanupRemovedHookContainers(node: Node) {
  if (!(node instanceof HTMLElement)) return;

  const containers: HTMLElement[] = [];
  if (node.classList.contains("album-others-hook-elem")) {
    containers.push(node);
  }
  node.querySelectorAll(".album-others-hook-elem").forEach((el) => {
    containers.push(el as HTMLElement);
  });
  containers.forEach(unmountHookButton);
}

function onPageNavigation() {
  unmountAllHookButtons();
  closeSessionModal();
}

function installNavigationListener() {
  const notify = () => onPageNavigation();

  window.addEventListener("popstate", notify);

  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history);
    history[method] = (...args) => {
      const result = original(...args);
      notify();
      return result;
    };
  }
}

function handleRarityItemHook(element: HTMLElement) {
  if (element.dataset.barrzzHookMounted === "true") return;

  queueMicrotask(() => {
    const fiber = getReactFiber(element);
    const albumId = fiber?.key;
    if (!albumId || typeof albumId !== "string") return;

    const otherSessions = getOtherSessionsForAlbum(albumId);
    if (!otherSessions?.length) return;

    const pctElem = element.querySelector(".rarity-pct-block");
    if (!pctElem) return;

    const hookContainer = document.createElement("div");
    hookContainer.className = "album-others-hook-elem";
    pctElem.before(hookContainer);

    element.dataset.barrzzHookMounted = "true";
    mountHookButton(hookContainer, albumId, otherSessions);
  });
}

function startDOMObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.removedNodes.forEach(cleanupRemovedHookContainers);

      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        if (node.matches(".rarity-row")) {
          handleRarityItemHook(node);
        }

        node
          .querySelectorAll(".rarity-row")
          .forEach((row) => handleRarityItemHook(row as HTMLElement));
      });
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    startDOMObserver();
    installNavigationListener();
  });
} else {
  startDOMObserver();
  installNavigationListener();
}
