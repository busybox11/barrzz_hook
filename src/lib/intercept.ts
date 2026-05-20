import { unsafeWindow } from "$";

const { fetch: originalFetch } = unsafeWindow;

type AlbumsEventsRqExpectedParams = {
  select: string;
  puzzle_date: string;
  event_type: string;
  limit: number;
};

export type AlbumsEventsRqResponseItem = {
  album_id: string;
  album_name: string;
  artist_name: string;
  artist_id: string;
  session_id: string;
};
export type AlbumsEventsRqResponse = AlbumsEventsRqResponseItem[];

const INTERCEPT_URL_MATCH =
  /:\/\/[^\/]*\.supabase\.co\/rest\/v1\/album_events\b/;

export function setupFetchHook({
  onAlbumEventsRq,
}: {
  onAlbumEventsRq: (
    rq: AlbumsEventsRqResponse,
    date: AlbumsEventsRqExpectedParams["puzzle_date"],
  ) => void;
}) {
  return () => {
    unsafeWindow.fetch = async (...args: Parameters<typeof originalFetch>) => {
      const url =
        typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url;

      if (typeof url === "string" && INTERCEPT_URL_MATCH.test(url)) {
        console.log("Intercepting fetch to album_events:", url, args[1]);
      }

      const response = await originalFetch(...args);

      if (typeof url === "string" && INTERCEPT_URL_MATCH.test(url)) {
        console.log("Response from album_events:", response);
        const rqClone = response.clone();

        const rqCloneBody = (await rqClone.json()) as AlbumsEventsRqResponse;
        console.log("Response body:", rqCloneBody);

        const urlParams = new URLSearchParams(args[0] as string);
        const date = urlParams.get("puzzle_date")?.replace("eq.", "");
        if (!date) return response;
        onAlbumEventsRq(rqCloneBody, date as string);

        return response;
      }

      return response;
    };
  };
}
