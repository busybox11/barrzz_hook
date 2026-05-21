import type { AlbumsEventsRqResponseItem } from "../lib/intercept";

export type AlbumInfo = {
  id: string;
  title: string;
  artist: string;
  coverArtUrl: string | null;
};

export type OtherSession = {
  sessionId: string;
  albums: AlbumsEventsRqResponseItem[];
  commonAlbumCount: number;
};

export type RapodokuSessionData = {
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
