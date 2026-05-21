import type { AlbumInfo } from "../../types/session";

type ModalAlbumHeaderProps = {
  album: AlbumInfo | undefined;
};

export function ModalAlbumHeader({ album }: ModalAlbumHeaderProps) {
  if (!album) {
    return <div className="barrzz-hook-modal-header-album" />;
  }

  return (
    <div className="barrzz-hook-modal-header-album">
      {album.coverArtUrl ? (
        <img
          className="barrzz-hook-modal-header-art"
          src={album.coverArtUrl}
          alt=""
        />
      ) : (
        <div className="barrzz-hook-modal-header-art barrzz-hook-modal-header-art--placeholder" />
      )}
      <div className="barrzz-hook-modal-header-text">
        <h2 className="barrzz-hook-modal-header-title">{album.title}</h2>
        <p className="barrzz-hook-modal-header-artist">{album.artist}</p>
      </div>
    </div>
  );
}
