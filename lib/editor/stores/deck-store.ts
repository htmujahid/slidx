import { createStore } from "zustand/vanilla"

import {
  DEFAULT_TITLE,
  PRESENTATION_VERSION,
  type PresentationFile,
} from "@/lib/editor/presentation"
import {
  createSlideId,
  INITIAL_SLIDE_JSON,
  type SlideData,
} from "@/lib/editor/slides"

export type DeckState = {
  presentationId: string
  status: "hydrating" | "ready"
  title: string
  slides: SlideData[]
  activeId: string
  setTitle: (title: string) => void
  writeJson: (id: string, json: string) => void
  moveSlide: (id: string, index: number) => void
}

export const selectActiveIndex = ({ slides, activeId }: DeckState) =>
  Math.max(
    slides.findIndex((slide) => slide.id === activeId),
    0
  )

export const selectPresentation = ({
  title,
  slides,
}: Pick<DeckState, "title" | "slides">): PresentationFile => ({
  app: "visx",
  version: PRESENTATION_VERSION,
  title,
  slides: slides.map(({ json }) => ({ json })),
})

// Plain deck data. Anything that has to touch the Craft canvas lives in
// lib/editor/deck-actions.ts.
export function createDeckStore({
  presentationId,
}: {
  presentationId: string
}) {
  return createStore<DeckState>()((set) => {
    const first = { id: createSlideId(), json: INITIAL_SLIDE_JSON }

    return {
      presentationId,
      status: "hydrating",
      title: DEFAULT_TITLE,
      slides: [first],
      activeId: first.id,

      setTitle: (title) => set({ title }),

      writeJson: (id, json) =>
        set((state) =>
          state.slides.some((slide) => slide.id === id && slide.json !== json)
            ? {
                slides: state.slides.map((slide) =>
                  slide.id === id ? { ...slide, json } : slide
                ),
              }
            : state
        ),

      moveSlide: (id, targetIndex) =>
        set((state) => {
          const from = state.slides.findIndex((slide) => slide.id === id)
          if (from < 0 || !Number.isFinite(targetIndex)) return state
          const to = Math.max(
            0,
            Math.min(state.slides.length - 1, Math.trunc(targetIndex))
          )
          if (from === to) return state
          const slides = [...state.slides]
          const [moved] = slides.splice(from, 1)
          slides.splice(to, 0, moved)
          return { slides }
        }),
    }
  })
}
