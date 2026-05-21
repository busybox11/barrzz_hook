import { openSessionModal } from "../lib/modalStore";
import type { OtherSession } from "../types/session";
import "./hook-button.css";

type HookButtonProps = {
  albumId: string;
  sessionCount: number;
  sessions: OtherSession[];
};

export function HookButton({
  albumId,
  sessionCount,
  sessions,
}: HookButtonProps) {
  const plural = sessionCount > 1 ? "s" : "";

  return (
    <button
      type="button"
      className="barrzz-hook-button"
      onClick={() => openSessionModal(albumId, sessions)}
    >
      {sessionCount} autre{plural}
    </button>
  );
}
