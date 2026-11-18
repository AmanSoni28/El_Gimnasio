"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny external stores. They keep cross-cutting UI state (intro phase,
 * active section, modal) out of React context so updating one never
 * re-renders the whole page tree, only the components that subscribe.
 */
export type Store<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: Store<T>, serverValue?: T): T {
  return useSyncExternalStore(store.subscribe, store.get, () => serverValue ?? store.get());
}

/** pending → (intro → revealing →) done */
export type IntroPhase = "pending" | "intro" | "revealing" | "done";
export const introPhase = createStore<IntroPhase>("pending");

/** Nav item the current section belongs to (several sections can share one). */
export const activeSection = createStore<string>("home");

export type SectionMeta = { index: number; total: number; title: string };
export const sectionMeta = createStore<SectionMeta>({ index: 1, total: 9, title: "Inicio" });

export type ModalState = { open: boolean; program?: string; mode?: "join" | "visit" };
export const joinModal = createStore<ModalState>({ open: false });

export const toastStore = createStore<string | null>(null);

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function showToast(message: string) {
  toastStore.set(message);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastStore.set(null), 3800);
}

export function openJoin(opts: Omit<ModalState, "open"> = {}) {
  joinModal.set({ open: true, mode: "join", ...opts });
}
