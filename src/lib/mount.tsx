import { createRoot, type Root } from "react-dom/client";
import { HookButton } from "../components/HookButton";
import { SessionModalHost } from "../components/SessionModal/SessionModal";
import type { OtherSession } from "../types/session";

let modalRoot: Root | null = null;
const hookRoots = new WeakMap<HTMLElement, Root>();

export function ensureModalHost() {
  if (modalRoot) return;

  const container = document.createElement("div");
  container.id = "barrzz-hook-modal-root";
  document.body.appendChild(container);
  modalRoot = createRoot(container);
  modalRoot.render(<SessionModalHost />);
}

export function mountHookButton(
  container: HTMLElement,
  albumId: string,
  sessions: OtherSession[],
) {
  ensureModalHost();

  let root = hookRoots.get(container);
  if (!root) {
    root = createRoot(container);
    hookRoots.set(container, root);
  }

  root.render(
    <HookButton
      albumId={albumId}
      sessionCount={sessions.length}
      sessions={sessions}
    />,
  );
}
