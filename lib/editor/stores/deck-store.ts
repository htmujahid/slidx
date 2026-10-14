import { ROOT_NODE, type useEditor } from "@craftjs/core"
import { createStore } from "zustand/vanilla"

import {
  DEFAULT_TITLE,
  PRESENTATION_VERSION,
  type PresentationFile,
} from "@/lib/editor/presentation"
import {
  resizeSlideJson,
  slideSizeOf,
  type ResizeMode,
  type SlideSize,
} from "@/lib/editor/slide-size"
import {
  BLANK_SLIDE_JSON,
  createSlideId,
  INITIAL_SLIDE_JSON,
  type SlideData,
} from "@/lib/editor/slides"
import type { StoredPresentation } from "@/lib/storage/types"

export type CraftHandle = Pick<
  ReturnType<typeof useEditor>,
  "actions" | "query"
>
export type CraftRef = {
  current: CraftHandle | null
  bind: (handle: CraftHandle | null) => void
}

export function createCraftRef(): CraftRef {
  const ref: CraftRef = {
    current: null,
    bind: (handle) => {
      ref.current = handle
    },
  }
  return ref
}
export type DeckState = {
  presentationId: string
  status: "hydrating" | "ready"
  title: string
  slides: SlideData[]
  activeId: string
  setTitle: (title: string) => void
  hydrate: (stored: StoredPresentation | null) => void
  syncActive: (json: string) => void
  snapshot: () => SlideData[]
  select: (id: string) => void
  addSlide: () => void
  addSlideFrom: (json: string) => void
  duplicateSlide: () => void
  deleteSlide: () => void
  moveSlide: (id: string, index: number) => void
  resizeSlides: (size: SlideSize, mode: ResizeMode) => void
  getPresentation: () => PresentationFile
  load: (title: string, jsons: string[]) => void
  reset: () => void
}

export const selectActiveIndex = ({ slides, activeId }: DeckState) =>
  Math.max(
    slides.findIndex((slide) => slide.id === activeId),
    0
  )

export function createDeckStore({
  presentationId,
  craft,
}: {
  presentationId: string
  craft: CraftRef
}) {
  const editor = () => {
    if (!craft.current) throw new Error("The slide editor is not ready.")
    return craft.current
  }

  return createStore<DeckState>()((set, get) => {
    const first = { id: createSlideId(), json: INITIAL_SLIDE_JSON }

    const snapshot = () => {
      const live = editor().query.serialize()
      const { slides, activeId } = get()
      return slides.map((slide) =>
        slide.id === activeId ? { ...slide, json: live } : slide
      )
    }

    const writeJson = (id: string, json: string) =>
      set((state) =>
        state.slides.some((slide) => slide.id === id && slide.json !== json)
          ? {
              slides: state.slides.map((slide) =>
                slide.id === id ? { ...slide, json } : slide
              ),
            }
          : state
      )

    const activate = (slide: SlideData) => {
      const { actions } = editor()
      set({ activeId: slide.id })
      actions.deserialize(slide.json)
      actions.history.clear()
    }

    const insertAfter = (afterId: string, json: string) => {
      const created: SlideData = { id: createSlideId(), json }
      const next = snapshot()
      next.splice(
        next.findIndex((slide) => slide.id === afterId) + 1,
        0,
        created
      )
      set({ slides: next })
      activate(created)
    }

    const addSlideFrom = (json: string) => {
      const size = slideSizeOf(
        editor().query.node(ROOT_NODE).get().data.props as Partial<SlideSize>
      )
      const { slides } = get()
      insertAfter(
        slides[slides.length - 1].id,
        resizeSlideJson(json, size, "scale")
      )
    }

    const load = (title: string, jsons: string[]) => {
      const { actions } = editor()
      const slides = jsons.map((json) => ({
        id: createSlideId(),
        json,
      }))
      actions.deserialize(slides[0].json)
      actions.history.clear()
      set({ slides, activeId: slides[0].id, title })
    }

    return {
      presentationId,
      status: "hydrating",
      title: DEFAULT_TITLE,
      slides: [first],
      activeId: first.id,

      setTitle: (title) => set({ title }),

      hydrate: (stored) => {
        const { actions, query } = editor()
        const initial = stored?.slides.length
          ? stored.slides
          : [{ id: createSlideId(), json: INITIAL_SLIDE_JSON }]
        actions.deserialize(initial[0].json)
        actions.history.clear()
        const normalized = query.serialize()
        const slides = initial.map((slide, index) => ({
          id: slide.id,
          json: index === 0 ? normalized : slide.json,
        }))
        set({
          slides,
          activeId: slides[0].id,
          title: stored?.title ?? DEFAULT_TITLE,
          status: "ready",
        })
      },

      snapshot,

      syncActive: (json) => {
        if (get().status === "ready") writeJson(get().activeId, json)
      },

      select: (id) => {
        const { activeId, slides } = get()
        if (id === activeId) return
        const target = slides.find((slide) => slide.id === id)
        if (!target) return
        writeJson(activeId, editor().query.serialize())
        activate(target)
      },

      addSlide: () => addSlideFrom(BLANK_SLIDE_JSON),
      addSlideFrom,

      duplicateSlide: () => {
        const { activeId } = get()
        const active = snapshot().find((slide) => slide.id === activeId)
        if (active) insertAfter(activeId, active.json)
      },

      deleteSlide: () => {
        const { slides, activeId } = get()
        if (slides.length <= 1) return
        const index = slides.findIndex((slide) => slide.id === activeId)
        const remaining = slides.filter((slide) => slide.id !== activeId)
        set({ slides: remaining })
        activate(remaining[Math.min(index, remaining.length - 1)])
      },

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

      resizeSlides: (size, mode) => {
        const { actions } = editor()
        const next = snapshot().map((slide) => ({
          ...slide,
          json: resizeSlideJson(slide.json, size, mode),
        }))
        set({ slides: next })
        const active = next.find((slide) => slide.id === get().activeId)
        if (active) actions.deserialize(active.json)
        actions.history.clear()
      },

      getPresentation: () => {
        return {
          app: "visx",
          version: PRESENTATION_VERSION,
          title: get().title,
          slides: snapshot().map(({ json }) => ({ json })),
        }
      },

      load,
      reset: () => load(DEFAULT_TITLE, [INITIAL_SLIDE_JSON]),
    }
  })
}
