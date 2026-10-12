"use client"

import * as React from "react"

import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/lib/editor/constants"

export type EditorDialog = "rename" | "new" | "reset" | null

export type AnimationPreview = {
  /** `play` runs on its own clock; `scrub` is held at `time`. */
  mode: "off" | "play" | "scrub"
  run: number
  time: number
  /** `performance.now()` when playback began. */
  startedAt: number
}

const NO_PREVIEW: AnimationPreview = {
  mode: "off",
  run: 0,
  time: 0,
  startedAt: 0,
}

const clampZoom = (zoom: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))

type EditorLayoutContextValue = {
  propertiesOpen: boolean
  setPropertiesOpen: (open: boolean) => void
  toggleProperties: () => void
  dialog: EditorDialog
  setDialog: (dialog: EditorDialog) => void
  editingId: string | null
  setEditingId: (id: string | null) => void
  canvasScale: number
  setCanvasScale: (scale: number) => void
  zoom: number
  zoomBy: (factor: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  timelineOpen: boolean
  setTimelineOpen: (open: boolean) => void
  toggleTimeline: () => void
  animationPreview: AnimationPreview
  /** Runs the slide's animations once, ending after `durationMs`. */
  playAnimationPreview: (durationMs: number) => void
  /** Holds every animation at `ms` into the slide. */
  scrubAnimationPreview: (ms: number) => void
  stopAnimationPreview: () => void
}

const EditorLayoutContext =
  React.createContext<EditorLayoutContextValue | null>(null)

function EditorLayoutProvider({ children }: { children: React.ReactNode }) {
  const [propertiesOpen, setPropertiesOpen] = React.useState(true)
  const [canvasScale, setCanvasScale] = React.useState(1)
  const [dialog, setDialog] = React.useState<EditorDialog>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [zoom, setZoom] = React.useState(1)
  const zoomBy = React.useCallback(
    (factor: number) => setZoom((current) => clampZoom(current * factor)),
    []
  )
  const zoomIn = React.useCallback(() => zoomBy(ZOOM_STEP), [zoomBy])
  const zoomOut = React.useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy])
  const zoomReset = React.useCallback(() => setZoom(1), [])
  const [timelineOpen, setTimelineOpen] = React.useState(false)
  const [animationPreview, setAnimationPreview] =
    React.useState<AnimationPreview>(NO_PREVIEW)
  const previewTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const stopAnimationPreview = React.useCallback(() => {
    clearTimeout(previewTimer.current)
    setAnimationPreview((current) =>
      current.mode === "off" ? current : { ...current, mode: "off" }
    )
  }, [])
  const playAnimationPreview = React.useCallback((durationMs: number) => {
    clearTimeout(previewTimer.current)
    setAnimationPreview((current) => ({
      mode: "play",
      run: current.run + 1,
      time: 0,
      startedAt: performance.now(),
    }))
    previewTimer.current = setTimeout(
      () => setAnimationPreview((current) => ({ ...current, mode: "off" })),
      durationMs
    )
  }, [])
  const scrubAnimationPreview = React.useCallback((ms: number) => {
    clearTimeout(previewTimer.current)
    setAnimationPreview((current) => ({
      ...current,
      mode: "scrub",
      time: ms,
    }))
  }, [])
  React.useEffect(() => () => clearTimeout(previewTimer.current), [])
  const value = React.useMemo(
    () => ({
      propertiesOpen,
      setPropertiesOpen,
      toggleProperties: () => setPropertiesOpen((open) => !open),
      dialog,
      setDialog,
      editingId,
      setEditingId,
      canvasScale,
      setCanvasScale,
      zoom,
      zoomBy,
      zoomIn,
      zoomOut,
      zoomReset,
      timelineOpen,
      setTimelineOpen,
      toggleTimeline: () => setTimelineOpen((open) => !open),
      animationPreview,
      playAnimationPreview,
      scrubAnimationPreview,
      stopAnimationPreview,
    }),
    [
      propertiesOpen,
      dialog,
      editingId,
      canvasScale,
      zoom,
      zoomBy,
      zoomIn,
      zoomOut,
      zoomReset,
      timelineOpen,
      animationPreview,
      playAnimationPreview,
      scrubAnimationPreview,
      stopAnimationPreview,
    ]
  )
  return (
    <EditorLayoutContext.Provider value={value}>
      {children}
    </EditorLayoutContext.Provider>
  )
}

function useOptionalEditorLayout() {
  return React.useContext(EditorLayoutContext)
}

function useEditorLayout() {
  const context = React.useContext(EditorLayoutContext)
  if (!context) {
    throw new Error("useEditorLayout must be used within EditorLayoutProvider.")
  }
  return context
}

export { EditorLayoutProvider, useEditorLayout, useOptionalEditorLayout }
