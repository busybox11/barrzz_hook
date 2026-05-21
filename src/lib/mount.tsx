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

export function unmountHookButton(container: HTMLElement) {
  const root = hookRoots.get(container);
  if (root) {
    root.unmount();
    hookRoots.delete(container);
  }
  if (container.isConnected) {
    container.remove();
  }
}

export function unmountAllHookButtons() {
  document
    .querySelectorAll(".album-others-hook-elem")
    .forEach((el) => unmountHookButton(el as HTMLElement));

  document.querySelectorAll('.rarity-row[data-barrzz-hook-mounted="true"]').forEach((el) => {
    delete (el as HTMLElement).dataset.barrzzHookMounted;
  });
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
