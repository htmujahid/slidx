"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ROOT_NODE, useEditor } from "@craftjs/core"

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
import type { StoredSlide } from "@/lib/storage/types"
import { toast } from "@/components/ui/toast"
import { useStorage } from "@/components/storage-provider"

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
  resizeSlides: (size: SlideSize, mode: ResizeMode) => void
  getPresentation: () => PresentationFile
  loadPresentation: (title: string, slides: string[]) => void
  newPresentation: () => void
  resetPresentation: () => void
}

const SlidesContext = React.createContext<SlidesContextValue | null>(null)

const SYNC_DELAY_MS = 250
const SAVE_DELAY_MS = 800

type SavedState = {
  title: string
  order: string
  json: Map<string, string>
  persisted: boolean
}

function SlidesProvider({
  presentationId,
  children,
}: {
  presentationId: string
  children: React.ReactNode
}) {
  const service = useStorage()
  const router = useRouter()
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
      const size = slideSizeOf(
        query.node(ROOT_NODE).get().data.props as Partial<SlideSize>
      )
      insertAfter(
        slides[slides.length - 1].id,
        resizeSlideJson(json, size, "scale")
      )
    },
    [insertAfter, slides, query]
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

  const resizeSlides = React.useCallback(
    (size: SlideSize, mode: ResizeMode) => {
      const currentJson = query.serialize()
      const next = slides.map((slide) => ({
        ...slide,
        json: resizeSlideJson(
          slide.id === activeIdRef.current ? currentJson : slide.json,
          size,
          mode
        ),
        version: slide.version + 1,
      }))
      setSlides(next)
      const active = next.find((slide) => slide.id === activeIdRef.current)
      if (active) actions.deserialize(active.json)
      actions.history.clear()
    },
    [actions, query, slides]
  )

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

  const newPresentation = React.useCallback(() => {
    if (service.kind === "cloud") {
      router.push("/editor/new")
      return
    }
    loadPresentation(DEFAULT_TITLE, [BLANK_SLIDE_JSON])
  }, [service, router, loadPresentation])

  const resetPresentation = React.useCallback(
    () => loadPresentation(DEFAULT_TITLE, [INITIAL_SLIDE_JSON]),
    [loadPresentation]
  )

  const [hydrated, setHydrated] = React.useState(false)
  const hydrationStartedRef = React.useRef(false)
  const savedRef = React.useRef<SavedState | null>(null)
  const latestRef = React.useRef({ slides, title })
  const savingRef = React.useRef<Promise<void>>(Promise.resolve())
  const failureRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (hydrationStartedRef.current) return
    hydrationStartedRef.current = true
    service
      .get(presentationId)
      .catch(() => null)
      .then((stored) => {
        if (stored === null && service.kind === "cloud") {
          router.replace("/dashboard")
          return
        }
        const initial: StoredSlide[] = stored?.slides.length
          ? stored.slides
          : [{ id: createSlideId(), json: INITIAL_SLIDE_JSON }]
        const nextTitle = stored?.title ?? DEFAULT_TITLE

        actions.deserialize(initial[0].json)
        actions.history.clear()
        const normalized = query.serialize()
        const next = initial.map((slide, index) => ({
          id: slide.id,
          json: index === 0 ? normalized : slide.json,
          version: 0,
        }))
        savedRef.current = {
          title: nextTitle,
          order: next.map((slide) => slide.id).join(),
          json: new Map(next.map((slide) => [slide.id, slide.json])),
          persisted: Boolean(stored),
        }
        activeIdRef.current = next[0].id
        setSlides(next)
        setActiveId(next[0].id)
        setTitle(nextTitle)
        setHydrated(true)
      })
  }, [service, presentationId, router, actions, query])

  const saveNow = React.useCallback(() => {
    savingRef.current = savingRef.current.then(async () => {
      const saved = savedRef.current
      if (!saved) return
      let activeJson: string | null = null
      try {
        activeJson = query.serialize()
      } catch {
        activeJson = null
      }
      const { slides: current, title: currentTitle } = latestRef.current
      const all = current.map((slide) =>
        slide.id === activeIdRef.current && activeJson !== null
          ? { ...slide, json: activeJson }
          : slide
      )
      const order = all.map((slide) => slide.id)
      const dirty = all.filter(
        (slide) => saved.json.get(slide.id) !== slide.json
      )
      if (
        !dirty.length &&
        saved.title === currentTitle &&
        saved.order === order.join()
      ) {
        return
      }
      const changed = (saved.persisted ? dirty : all).map(({ id, json }) => ({
        id,
        json,
      }))
      try {
        await service.save(presentationId, {
          title: currentTitle,
          order,
          changed,
        })
        savedRef.current = {
          title: currentTitle,
          order: order.join(),
          json: new Map(all.map((slide) => [slide.id, slide.json])),
          persisted: true,
        }
        failureRef.current = null
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Changes were not saved."
        if (failureRef.current !== message) {
          failureRef.current = message
          toast.add({
            type: "error",
            title: "Could not save",
            description: message,
          })
        }
      }
    })
    return savingRef.current
  }, [query, service, presentationId])

  React.useEffect(() => {
    latestRef.current = { slides, title }
  }, [slides, title])

  React.useEffect(() => {
    if (!hydrated) return
    const timer = setTimeout(saveNow, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [hydrated, slides, title, saveNow])

  React.useEffect(() => {
    if (!hydrated) return
    const flush = () => {
      if (document.visibilityState === "hidden") void saveNow()
    }
    document.addEventListener("visibilitychange", flush)
    window.addEventListener("pagehide", flush)
    return () => {
      document.removeEventListener("visibilitychange", flush)
      window.removeEventListener("pagehide", flush)
      void saveNow()
    }
  }, [hydrated, saveNow])

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
      resizeSlides,
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
      resizeSlides,
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
