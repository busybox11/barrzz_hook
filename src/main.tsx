import { getReactFiber } from "./lib/inject";
import { setupFetchHook } from "./lib/intercept";
import { mountHookButton } from "./lib/mount";
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
  document.addEventListener("DOMContentLoaded", startDOMObserver);
} else {
  startDOMObserver();
}
