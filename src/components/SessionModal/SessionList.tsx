import type { OtherSession } from "../../types/session";

type SessionListProps = {
  sessions: OtherSession[];
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
};

export function SessionList({
  sessions,
  selectedSessionId,
  onSelect,
}: SessionListProps) {
  return (
    <aside className="barrzz-hook-session-list">
      <p className="barrzz-hook-panel-label">Autres utilisateurs</p>
      <ul>
        {sessions.map((session, index) => {
          const isSelected = session.sessionId === selectedSessionId;
          const commonLabel =
            session.commonAlbumCount === 1 ? "album commun" : "albums communs";

          return (
            <li key={session.sessionId}>
              <button
                type="button"
                className={`barrzz-hook-session-item${isSelected ? " is-selected" : ""}`}
                onClick={() => onSelect(session.sessionId)}
              >
                <span className="barrzz-hook-session-title">
                  match #{index + 1}
                </span>
                <span className="barrzz-hook-session-meta">
                  {session.commonAlbumCount} {commonLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
