import { getMyAlbumIds } from "../../lib/sessionData";
import type { OtherSession } from "../../types/session";

type AlbumPanelProps = {
  session: OtherSession | null;
};

export function AlbumPanel({ session }: AlbumPanelProps) {
  const myAlbumIds = getMyAlbumIds();

  if (!session) {
    return (
      <section className="barrzz-hook-album-panel">
        <p className="barrzz-hook-panel-label">Albums</p>
        <p className="barrzz-hook-empty">Aucune session sélectionnée</p>
      </section>
    );
  }

  return (
    <section className="barrzz-hook-album-panel">
      <ul className="barrzz-hook-album-list">
        {session.albums.map((album) => {
          const isHighlighted = myAlbumIds.has(album.album_id);
          const isError = album.event_type === "error";
          const className = [
            "barrzz-hook-album-item",
            isHighlighted && "is-highlighted",
            isError && "is-error",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={`${session.sessionId}-${album.cell_idx}-${album.album_id}-${album.event_type}`}
              className={className}
            >
              <span className="barrzz-hook-album-name">{album.album_name}</span>
              <span className="barrzz-hook-album-artist">
                {album.artist_name}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
