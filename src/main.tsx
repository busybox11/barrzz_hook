import { getReactFiber } from "./lib/inject";
import { AlbumsEventsRqResponse, setupFetchHook } from "./lib/intercept";

let myAlbums: string[] = [];
let mySessionId: string | null = null;
const sessionsByAlbum: Map<string, Array<AlbumsEventsRqResponse>> = new Map();

let albumsEvents: AlbumsEventsRqResponse = [];
setupFetchHook({
  onAlbumEventsRq: (rq, date) => {
    albumsEvents = rq;
    onDateKnown(date);
  },
})();

function onDateKnown(date: string) {
  console.log("Date known:", date);
  const sessionDataString = localStorage.getItem(`rapodoku_${date}`);
  if (!sessionDataString) return;
  let sessionData: {
    placements: Array<{
      id: string;
      name: string;
      artist: {
        id: string;
        name: string;
        picture_url: string;
      };
      cover_art_url: string;
      release_date_components: {
        year: number;
        month: number;
        day: number;
      };
    }>;
    errors: number;
    errorLog: Array<{
      cellIdx: number;
      albumName: string;
      albumCover: string;
      reasons: string[];
    }>;
    completed: boolean;
    failed: boolean;
    startReported: boolean;
    sessionId: string;
  };

  try {
    sessionData = JSON.parse(sessionDataString);

    mySessionId = sessionData.sessionId;
    myAlbums = sessionData.placements.map((placement) => placement.id);

    matchSessionIdToAlbums();
  } catch (e) {
    console.error("Failed to parse sessionDataString:", e);
    return;
  }
}

function getAlbumsForSessionId(sessionId: string) {
  return albumsEvents
    .filter((event) => event.session_id === sessionId)
    .map((event) => event);
}

function getSessionIdsForAlbum(album: string) {
  return albumsEvents
    .filter((event) => event.album_id === album)
    .map((event) => event.session_id);
}

function matchSessionIdToAlbums() {
  if (!myAlbums.length) return;
  if (!mySessionId) return;

  for (const album of myAlbums) {
    const sessionIds = getSessionIdsForAlbum(album).filter(
      (sessionId) => sessionId !== mySessionId,
    );
    if (!sessionIds.length) continue;

    const otherSessionsData = sessionIds.map((sessionId) =>
      getAlbumsForSessionId(sessionId),
    );
    sessionsByAlbum.set(album, otherSessionsData);
  }
  console.log("Sessions per album:", sessionsByAlbum);
}

function handleRarityItemHook(element: HTMLElement) {
  queueMicrotask(() => {
    // get album id from element fiber props key
    const fiber = getReactFiber(element);

    const albumId = fiber?.key;
    if (!albumId) return;

    // don't render hook elem if album is not in sessionsPerAlbum
    const otherSessionsData = sessionsByAlbum.get(albumId as string);
    if (!otherSessionsData) return;

    // render hook elem
    const hookElement = document.createElement("div");
    hookElement.className = "album-others-hook-elem";

    const plural = otherSessionsData.length > 1 ? "s" : "";
    hookElement.innerHTML = `${otherSessionsData.length} autre${plural}`;

    const pctElem = element.querySelector(".rarity-pct-block");
    if (!pctElem) return;

    pctElem.before(hookElement);
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

        const nestedRows = node.querySelectorAll(".rarity-row");
        nestedRows.forEach((row) => handleRarityItemHook(row as HTMLElement));
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
