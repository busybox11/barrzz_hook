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
  cell_idx: number;
  event_type: "placement" | "error";
};
export type AlbumsEventsRqResponse = AlbumsEventsRqResponseItem[];

const INTERCEPT_URL_MATCH =
  /:\/\/[^\/]*\.supabase\.co\/rest\/v1\/album_events\b/;

function addEventTypeToSelect(url: string): string {
  const parsed = new URL(url);
  const select = parsed.searchParams.get("select");
  if (!select) return url;

  const fields = select.split(",").map((field) => field.trim());
  const extraFields = ["event_type", "cell_idx"].filter(
    (field) => !fields.includes(field),
  );
  if (!extraFields.length) return url;

  parsed.searchParams.set("select", [...fields, ...extraFields].join(","));
  return parsed.toString();
}

function rewriteFetchArgs(
  args: Parameters<typeof originalFetch>,
  rewrittenUrl: string,
): Parameters<typeof originalFetch> {
  if (typeof args[0] === "string") {
    return args[0] === rewrittenUrl ? args : [rewrittenUrl, args[1]];
  }

  const request = args[0] as Request;
  return request.url === rewrittenUrl
    ? args
    : [new Request(rewrittenUrl, request), args[1]];
}

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
      let url =
        typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url;

      if (typeof url === "string" && INTERCEPT_URL_MATCH.test(url)) {
        url = addEventTypeToSelect(url);
        args = rewriteFetchArgs(args, url);
        console.log("Intercepting fetch to album_events:", url, args[1]);
      }

      const response = await originalFetch(...args);

      if (typeof url === "string" && INTERCEPT_URL_MATCH.test(url)) {
        console.log("Response from album_events:", response);
        const rqClone = response.clone();

        const rqCloneBody = (await rqClone.json()) as AlbumsEventsRqResponse;
        console.log("Response body:", rqCloneBody);

        const date = new URL(url).searchParams
          .get("puzzle_date")
          ?.replace("eq.", "");
        if (!date) return response;
        onAlbumEventsRq(rqCloneBody, date as string);

        return response;
      }

      return response;
    };
  };
}
