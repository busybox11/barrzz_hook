import type { AlbumsEventsRqResponse, AlbumsEventsRqResponseItem } from "./intercept";
import type { AlbumInfo, OtherSession, RapodokuSessionData } from "../types/session";

let myAlbums: string[] = [];
let mySessionId: string | null = null;
let albumsEvents: AlbumsEventsRqResponse = [];
const myAlbumsById = new Map<string, AlbumInfo>();
const sessionsByAlbum = new Map<string, OtherSession[]>();

function isSameAlbumGuess(
  a: AlbumsEventsRqResponseItem,
  b: AlbumsEventsRqResponseItem,
) {
  return (
    a.cell_idx === b.cell_idx &&
    a.album_id === b.album_id &&
    a.event_type === b.event_type
  );
}

function dedupeSessionAlbums(events: AlbumsEventsRqResponseItem[]) {
  const deduped: AlbumsEventsRqResponseItem[] = [];

  for (const event of events) {
    const duplicateIndex = deduped.findIndex((existing) =>
      isSameAlbumGuess(existing, event),
    );
    if (duplicateIndex === -1) {
      deduped.push(event);
      continue;
    }

    if (
      event.event_type === "error" &&
      deduped[duplicateIndex].event_type !== "error"
    ) {
      deduped[duplicateIndex] = event;
    }
  }

  return deduped.sort((a, b) => b.cell_idx - a.cell_idx);
}

function getAlbumsForSessionId(sessionId: string) {
  return dedupeSessionAlbums(
    albumsEvents.filter((event) => event.session_id === sessionId),
  );
}

function getSessionIdsForAlbum(album: string) {
  return albumsEvents
    .filter((event) => event.album_id === album)
    .map((event) => event.session_id);
}

function getCommonAlbumCount(sessionId: string) {
  const otherAlbumIds = new Set(
    getAlbumsForSessionId(sessionId).map((album) => album.album_id),
  );
  return myAlbums.filter((albumId) => otherAlbumIds.has(albumId)).length;
}

function matchSessionIdToAlbums() {
  if (!myAlbums.length || !mySessionId) return;

  sessionsByAlbum.clear();

  for (const album of myAlbums) {
    const sessionIds = getSessionIdsForAlbum(album).filter(
      (sessionId) => sessionId !== mySessionId,
    );
    if (!sessionIds.length) continue;

    const otherSessions = sessionIds.map((sessionId) => ({
      sessionId,
      albums: getAlbumsForSessionId(sessionId),
      commonAlbumCount: getCommonAlbumCount(sessionId),
    }));

    sessionsByAlbum.set(album, otherSessions);
  }
}

export function setAlbumsEvents(events: AlbumsEventsRqResponse) {
  albumsEvents = events;
}

export function getAlbumInfo(albumId: string): AlbumInfo | undefined {
  const fromStorage = myAlbumsById.get(albumId);
  if (fromStorage) return fromStorage;

  const fromEvents = albumsEvents.find((event) => event.album_id === albumId);
  if (!fromEvents) return undefined;

  return {
    id: albumId,
    title: fromEvents.album_name,
    artist: fromEvents.artist_name,
    coverArtUrl: null,
  };
}

export function loadSessionFromStorage(date: string) {
  const sessionDataString = localStorage.getItem(`rapodoku_${date}`);
  if (!sessionDataString) return;

  try {
    const sessionData = JSON.parse(sessionDataString) as RapodokuSessionData;
    mySessionId = sessionData.sessionId;
    myAlbumsById.clear();
    for (const placement of sessionData.placements) {
      myAlbumsById.set(placement.id, {
        id: placement.id,
        title: placement.name,
        artist: placement.artist.name,
        coverArtUrl: placement.cover_art_url,
      });
    }
    myAlbums = sessionData.placements.map((placement) => placement.id);
    matchSessionIdToAlbums();
  } catch (e) {
    console.error("Failed to parse sessionDataString:", e);
  }
}

export function getMyAlbumIds(): ReadonlySet<string> {
  return new Set(myAlbums);
}

export function getOtherSessionsForAlbum(albumId: string): OtherSession[] | undefined {
  return sessionsByAlbum.get(albumId);
}
