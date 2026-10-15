import { ROOT_NODE, type useEditor } from "@craftjs/core"
import type { StoreApi } from "zustand"

import { DEFAULT_TITLE, type PresentationFile } from "@/lib/editor/presentation"
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
import {
  selectPresentation,
  type DeckState,
} from "@/lib/editor/stores/deck-store"
import type { StoredPresentation } from "@/lib/storage/types"

export type CraftHandle = Pick<
  ReturnType<typeof useEditor>,
  "actions" | "query"
>

// Deck operations that keep the Craft canvas and the deck store in sync.
// The store holds the data; the canvas holds the live active slide.
export function createDeckActions(
  deck: StoreApi<DeckState>,
  { actions, query }: CraftHandle
) {
  const { setState, getState } = deck

  const isReady = () => getState().status === "ready"

  // Until hydrate() has run, the canvas and the store disagree.
  const whenReady =
    <A extends unknown[]>(fn: (...args: A) => void) =>
    (...args: A) => {
      if (isReady()) fn(...args)
    }

  const show = (json: string) => {
    actions.deserialize(json)
    actions.history.clear()
  }

  const snapshot = (): SlideData[] => {
    const { slides, activeId } = getState()
    if (!isReady()) return slides
    const live = query.serialize()
    return slides.map((slide) =>
      slide.id === activeId ? { ...slide, json: live } : slide
    )
  }

  const activate = (slide: SlideData) => {
    setState({ activeId: slide.id })
    show(slide.json)
  }

  const insertAfter = (afterId: string, json: string) => {
    const created: SlideData = { id: createSlideId(), json }
    const next = snapshot()
    next.splice(next.findIndex((slide) => slide.id === afterId) + 1, 0, created)
    setState({ slides: next })
    activate(created)
  }

  const addSlideFrom = whenReady((json: string) => {
    const size = slideSizeOf(
      query.node(ROOT_NODE).get().data.props as Partial<SlideSize>
    )
    const { slides } = getState()
    insertAfter(
      slides[slides.length - 1].id,
      resizeSlideJson(json, size, "scale")
    )
  })

  const load = whenReady((title: string, jsons: string[]) => {
    const slides = jsons.map((json) => ({ id: createSlideId(), json }))
    show(slides[0].json)
    setState({ slides, activeId: slides[0].id, title })
  })

  return {
    hydrate: (stored: StoredPresentation | null) => {
      const initial = stored?.slides.length
        ? stored.slides
        : [{ id: createSlideId(), json: INITIAL_SLIDE_JSON }]
      show(initial[0].json)
      const normalized = query.serialize()
      const slides = initial.map((slide, index) => ({
        id: slide.id,
        json: index === 0 ? normalized : slide.json,
      }))
      setState({
        slides,
        activeId: slides[0].id,
        title: stored?.title ?? DEFAULT_TITLE,
        status: "ready",
      })
    },

    // The slides with the live canvas folded into the active one.
    snapshot,

    getPresentation: (): PresentationFile =>
      selectPresentation({ title: getState().title, slides: snapshot() }),

    syncActive: whenReady(() =>
      getState().writeJson(getState().activeId, query.serialize())
    ),

    select: whenReady((id: string) => {
      const { activeId, slides, writeJson } = getState()
      if (id === activeId) return
      const target = slides.find((slide) => slide.id === id)
      if (!target) return
      writeJson(activeId, query.serialize())
      activate(target)
    }),

    addSlide: () => addSlideFrom(BLANK_SLIDE_JSON),
    addSlideFrom,

    duplicateSlide: whenReady((id?: string) => {
      const targetId = id ?? getState().activeId
      const source = snapshot().find((slide) => slide.id === targetId)
      if (source) insertAfter(targetId, source.json)
    }),

    deleteSlide: whenReady((id?: string) => {
      const { slides, activeId } = getState()
      const targetId = id ?? activeId
      const index = slides.findIndex((slide) => slide.id === targetId)
      if (slides.length <= 1 || index < 0) return
      const remaining = slides.filter((slide) => slide.id !== targetId)
      setState({ slides: remaining })
      if (targetId === activeId) {
        activate(remaining[Math.min(index, remaining.length - 1)])
      }
    }),

    resizeSlides: whenReady((size: SlideSize, mode: ResizeMode) => {
      const next = snapshot().map((slide) => ({
        ...slide,
        json: resizeSlideJson(slide.json, size, mode),
      }))
      setState({ slides: next })
      const active = next.find((slide) => slide.id === getState().activeId)
      if (active) actions.deserialize(active.json)
      actions.history.clear()
    }),

    // Pure data changes, exposed here so callers have one place to look.
    setTitle: (title: string) => getState().setTitle(title),
    moveSlide: (id: string, index: number) => getState().moveSlide(id, index),

    load,
    reset: () => load(DEFAULT_TITLE, [INITIAL_SLIDE_JSON]),
  }
}

export type DeckActions = ReturnType<typeof createDeckActions>
