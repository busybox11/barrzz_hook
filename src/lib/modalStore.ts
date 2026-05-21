import { useSyncExternalStore } from "react";
import type { OtherSession } from "../types/session";

type ModalState = {
  isOpen: boolean;
  albumId: string | null;
  sessions: OtherSession[];
};

let state: ModalState = {
  isOpen: false,
  albumId: null,
  sessions: [],
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function openSessionModal(albumId: string, sessions: OtherSession[]) {
  state = { isOpen: true, albumId, sessions };
  emit();
}

export function closeSessionModal() {
  if (!state.isOpen) return;
  state = { ...state, isOpen: false };
  emit();
}

export function useModalStore() {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => state,
    () => state,
  );
}
