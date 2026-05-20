import { unsafeWindow } from "$";

const { fetch: originalFetch } = unsafeWindow;

/*
type AlbumsEventsRqExpectedParams = {
  select: string;
  puzzle_date: string;
  event_type: string;
  limit: number;
};
*/

type AlbumsEventsRqResponseItem = {
  album_id: string;
  album_name: string;
  artist_name: string;
  artist_id: string;
};
type AlbumsEventsRqResponse = AlbumsEventsRqResponseItem[];

const INTERCEPT_URL_MATCH =
  /:\/\/[^\/]*\.supabase\.co\/rest\/v1\/album_events\b/;

unsafeWindow.fetch = async (...args: Parameters<typeof originalFetch>) => {
  const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url;

  if (typeof url === "string" && INTERCEPT_URL_MATCH.test(url)) {
    console.log("Intercepting fetch to album_events:", url, args[1]);
  }

  const response = await originalFetch(...args);

  if (typeof url === "string" && INTERCEPT_URL_MATCH.test(url)) {
    console.log("Response from album_events:", response);
    const rqClone = response.clone();

    const rqCloneBody = (await rqClone.json()) as AlbumsEventsRqResponse;
    console.log("Response body:", rqCloneBody);

    return response;
  }

  return response;
};
