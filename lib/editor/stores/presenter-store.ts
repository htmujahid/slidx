import type { StoreApi } from "zustand"
import { createStore } from "zustand/vanilla"

import { createFullscreen } from "@/lib/editor/fullscreen"
import type { PresentationFile } from "@/lib/editor/presentation"

import type { ChromeState } from "./chrome-store"
import { selectActiveIndex, type DeckState } from "./deck-store"

export type PresenterState = {
  deck: PresentationFile | null
  index: number
  fullscreen: boolean
  returnFocus: HTMLElement | null
  start: (trigger?: HTMLElement) => void
  stop: () => void
  go: (delta: number) => void
  goTo: (index: number) => void
  enterFullscreen: () => void
  attach: () => () => void
}

export function createPresenterStore({
  deck,
  chrome,
}: {
  deck: StoreApi<DeckState>
  chrome: StoreApi<ChromeState>
}) {
  return createStore<PresenterState>()((set, get) => {
    const fullscreen = createFullscreen({
      isWanted: () => get().deck !== null,
      onChange: (isFullscreen) => set({ fullscreen: isFullscreen }),
      onExternalExit: () => set({ deck: null }),
    })

    const goTo = (index: number) => {
      const count = get().deck?.slides.length ?? 1
      set({ index: Math.max(0, Math.min(count - 1, index)) })
    }

    return {
      deck: null,
      index: 0,
      fullscreen: false,
      returnFocus: null,

      start: (trigger) => {
        if (get().deck) return
        const state = deck.getState()
        const snapshot = state.getPresentation()
        chrome.getState().setEditingId(null)
        set({
          deck: snapshot,
          index: selectActiveIndex(state),
          returnFocus:
            trigger ??
            (document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null),
        })
        fullscreen.enter()
      },

      stop: () => {
        set({ deck: null })
        fullscreen.exit()
      },

      go: (delta) => goTo(get().index + delta),
      goTo,
      enterFullscreen: fullscreen.enter,
      attach: fullscreen.attach,
    }
  })
}
