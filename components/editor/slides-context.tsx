"use client"

import * as React from "react"
import { useEditor } from "@craftjs/core"

import {
  DEFAULT_TITLE,
  parsePresentation,
  PRESENTATION_VERSION,
  type PresentationFile,
} from "@/lib/editor/presentation"
import {
  BLANK_SLIDE_JSON,
  createSlideId,
  INITIAL_SLIDE_JSON,
  type SlideData,
} from "@/lib/editor/slides"
import { clearDraft, readDraft, writeDraft } from "@/lib/editor/storage"

type SlidesContextValue = {
  title: string
  setTitle: (title: string) => void
  slides: SlideData[]
  activeId: string
  activeIndex: number
  selectSlide: (id: string) => void
  addSlide: () => void
  addSlideFrom: (json: string) => void
  duplicateSlide: (id: string) => void
  deleteSlide: (id: string) => void
  moveSlide: (id: string, index: number) => void
  getPresentation: () => PresentationFile
  loadPresentation: (title: string, slides: string[]) => void
  newPresentation: () => void
  resetPresentation: () => void
}

const SlidesContext = React.createContext<SlidesContextValue | null>(null)

const SYNC_DELAY_MS = 250

function SlidesProvider({ children }: { children: React.ReactNode }) {
  const { actions, query, nodes } = useEditor((state) => ({
    nodes: state.nodes,
  }))
  const [slides, setSlides] = React.useState<SlideData[]>(() => [
    { id: createSlideId(), json: INITIAL_SLIDE_JSON, version: 0 },
  ])
  const [title, setTitle] = React.useState(DEFAULT_TITLE)
  const [activeId, setActiveId] = React.useState(() => slides[0].id)
  const activeIdRef = React.useRef(activeId)

  const writeJson = React.useCallback((id: string, json: string) => {
    setSlides((current) =>
      current.map((slide) =>
        slide.id === id && slide.json !== json
          ? { ...slide, json, version: slide.version + 1 }
          : slide
      )
    )
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      writeJson(activeIdRef.current, query.serialize())
    }, SYNC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [nodes, query, writeJson])

  const activate = React.useCallback(
    (slide: SlideData) => {
      activeIdRef.current = slide.id
      setActiveId(slide.id)
      actions.deserialize(slide.json)
      actions.history.clear()
    },
    [actions]
  )

  const selectSlide = React.useCallback(
    (id: string) => {
      if (id === activeIdRef.current) return
      const target = slides.find((slide) => slide.id === id)
      if (!target) return
      writeJson(activeIdRef.current, query.serialize())
      activate(target)
    },
    [slides, query, writeJson, activate]
  )

  const insertAfter = React.useCallback(
    (afterId: string, json: string) => {
      const created: SlideData = { id: createSlideId(), json, version: 0 }
      const currentJson = query.serialize()
      setSlides((current) => {
        const index = current.findIndex((slide) => slide.id === afterId)
        const next = current.map((slide) =>
          slide.id === activeIdRef.current
            ? { ...slide, json: currentJson, version: slide.version + 1 }
            : slide
        )
        next.splice(index + 1, 0, created)
        return next
      })
      activate(created)
    },
    [query, activate]
  )

  const addSlideFrom = React.useCallback(
    (json: string) => {
      insertAfter(slides[slides.length - 1].id, json)
    },
    [insertAfter, slides]
  )

  const addSlide = React.useCallback(
    () => addSlideFrom(BLANK_SLIDE_JSON),
    [addSlideFrom]
  )

  const duplicateSlide = React.useCallback(
    (id: string) => {
      const source = slides.find((slide) => slide.id === id)
      if (!source) return
      const json = id === activeIdRef.current ? query.serialize() : source.json
      insertAfter(id, json)
    },
    [insertAfter, slides, query]
  )

  const deleteSlide = React.useCallback(
    (id: string) => {
      if (slides.length <= 1) return
      const index = slides.findIndex((slide) => slide.id === id)
      const remaining = slides.filter((slide) => slide.id !== id)
      setSlides(remaining)
      if (id === activeIdRef.current) {
        activate(remaining[Math.min(index, remaining.length - 1)])
      }
    },
    [slides, activate]
  )

  const moveSlide = React.useCallback((id: string, targetIndex: number) => {
    setSlides((current) => {
      const from = current.findIndex((slide) => slide.id === id)
      if (from < 0 || !Number.isFinite(targetIndex)) return current
      const to = Math.max(
        0,
        Math.min(current.length - 1, Math.trunc(targetIndex))
      )
      if (from === to) return current
      const next = [...current]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const getPresentation = React.useCallback((): PresentationFile => {
    const currentJson = query.serialize()
    return {
      app: "visx",
      version: PRESENTATION_VERSION,
      title,
      slides: slides.map((slide) => ({
        json: slide.id === activeIdRef.current ? currentJson : slide.json,
      })),
    }
  }, [query, slides, title])

  const loadPresentation = React.useCallback(
    (nextTitle: string, jsons: string[]) => {
      const next = jsons.map((json) => ({
        id: createSlideId(),
        json,
        version: 0,
      }))
      actions.deserialize(next[0].json)
      actions.history.clear()
      activeIdRef.current = next[0].id
      setSlides(next)
      setActiveId(next[0].id)
      setTitle(nextTitle)
    },
    [actions]
  )

  const newPresentation = React.useCallback(
    () => loadPresentation(DEFAULT_TITLE, [BLANK_SLIDE_JSON]),
    [loadPresentation]
  )

  const resetPresentation = React.useCallback(() => {
    clearDraft().catch(() => {})
    loadPresentation(DEFAULT_TITLE, [INITIAL_SLIDE_JSON])
  }, [loadPresentation])

  const [hydrated, setHydrated] = React.useState(false)
  const hydrationStartedRef = React.useRef(false)

  React.useEffect(() => {
    if (hydrationStartedRef.current) return
    hydrationStartedRef.current = true
    readDraft()
      .then((text) => {
        if (!text) return
        const draft = parsePresentation(text)
        loadPresentation(draft.title, draft.slides)
      })
      .catch(() => {})
      .finally(() => setHydrated(true))
  }, [loadPresentation])

  React.useEffect(() => {
    if (!hydrated) return
    const timer = setTimeout(() => {
      writeDraft(JSON.stringify(getPresentation())).catch(() => {})
    }, SYNC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [hydrated, getPresentation])

  const value = React.useMemo<SlidesContextValue>(
    () => ({
      title,
      setTitle,
      slides,
      activeId,
      activeIndex: Math.max(
        slides.findIndex((slide) => slide.id === activeId),
        0
      ),
      selectSlide,
      addSlide,
      addSlideFrom,
      duplicateSlide,
      deleteSlide,
      moveSlide,
      getPresentation,
      loadPresentation,
      newPresentation,
      resetPresentation,
    }),
    [
      title,
      slides,
      activeId,
      selectSlide,
      addSlide,
      addSlideFrom,
      duplicateSlide,
      deleteSlide,
      moveSlide,
      getPresentation,
      loadPresentation,
      newPresentation,
      resetPresentation,
    ]
  )

  return (
    <SlidesContext.Provider value={value}>
      {children}
      {!hydrated && <div className="fixed inset-0 z-50 bg-background" />}
    </SlidesContext.Provider>
  )
}

function useSlides() {
  const context = React.useContext(SlidesContext)
  if (!context) {
    throw new Error("useSlides must be used within SlidesProvider.")
  }
  return context
}

export { SlidesProvider, useSlides }
