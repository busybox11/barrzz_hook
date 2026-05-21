import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getAlbumInfo } from "../../lib/sessionData";
import { closeSessionModal, useModalStore } from "../../lib/modalStore";
import { AlbumPanel } from "./AlbumPanel";
import { ModalAlbumHeader } from "./ModalAlbumHeader";
import { SessionList } from "./SessionList";
import "./session-modal.css";

export function SessionModalHost() {
  const { isOpen, sessions, albumId } = useModalStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isOpen && sessions.length > 0) {
      setSelectedSessionId(sessions[0].sessionId);
    }
  }, [isOpen, sessions]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSessionModal();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedSession =
    sessions.find((session) => session.sessionId === selectedSessionId) ?? null;
  const album = albumId ? getAlbumInfo(albumId) : undefined;

  return createPortal(
    <div
      className="barrzz-hook-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeSessionModal();
      }}
    >
      <div className="barrzz-hook-modal" role="dialog" aria-modal="true">
        <header className="barrzz-hook-modal-header">
          <ModalAlbumHeader album={album} />
          <button
            type="button"
            className="barrzz-hook-modal-close"
            onClick={closeSessionModal}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>
        <div className="barrzz-hook-modal-body">
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelect={setSelectedSessionId}
          />
          <AlbumPanel session={selectedSession} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
