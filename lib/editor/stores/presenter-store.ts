import type { StoreApi } from "zustand"
import { createStore } from "zustand/vanilla"

import type { PresentationFile } from "@/lib/editor/presentation"

import type { ChromeState } from "./chrome-store"
import { selectActiveIndex, type DeckState } from "./deck-store"

export type PresenterState = {
  deck: PresentationFile | null
  index: number
  returnFocus: HTMLElement | null
  start: (trigger?: HTMLElement) => void
  stop: () => void
  go: (delta: number) => void
  goTo: (index: number) => void
}

export function createPresenterStore({
  deck,
  chrome,
}: {
  deck: StoreApi<DeckState>
  chrome: StoreApi<ChromeState>
}) {
  return createStore<PresenterState>()((set, get) => {
    const goTo = (index: number) => {
      const count = get().deck?.slides.length ?? 1
      set({ index: Math.max(0, Math.min(count - 1, index)) })
    }

    return {
      deck: null,
      index: 0,
      returnFocus: null,

      start: (trigger) => {
        if (get().deck) return
        const state = deck.getState()
        const snapshot = state.getPresentation()
        chrome.getState().setEditingId(null)
        set({
          deck: snapshot,
          index: selectActiveIndex(state),
          returnFocus: trigger ?? null,
        })
      },

      stop: () => set({ deck: null, returnFocus: null }),

      go: (delta) => goTo(get().index + delta),
      goTo,
    }
  })
}
