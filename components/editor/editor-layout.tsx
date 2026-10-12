"use client"

import * as React from "react"

import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/lib/editor/constants"

export type EditorDialog = "rename" | "new" | "reset" | "size" | null

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

/** What a zoom of 1 means: the whole slide in view, or the slide's full width. */
export type FitMode = "view" | "width"

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
  fitMode: FitMode
  /** Fits the slide to the canvas area and resets zoom. */
  fit: (mode: FitMode) => void
  zoomBy: (factor: number) => void
  /** Zooms so the slide is drawn at `scale` times its own size (1 is 100%). */
  zoomToScale: (scale: number) => void
  /** Whether `zoomToScale(scale)` is within the zoom limits. */
  canZoomToScale: (scale: number) => boolean
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  timelineOpen: boolean
  setTimelineOpen: (open: boolean) => void
  toggleTimeline: () => void
  /** The element whose keyframes the dialog is editing. */
  keyframeTarget: string | null
  setKeyframeTarget: (id: string | null) => void
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
  // `canvasScale` is what the slide is drawn at; zoom is relative to the fit.
  const zoomFor = React.useCallback(
    (scale: number) => (scale * zoom) / (canvasScale || 1),
    [zoom, canvasScale]
  )
  const zoomToScale = React.useCallback(
    (scale: number) => setZoom(clampZoom(zoomFor(scale))),
    [zoomFor]
  )
  const canZoomToScale = React.useCallback(
    (scale: number) => {
      const target = zoomFor(scale)
      return target >= ZOOM_MIN && target <= ZOOM_MAX
    },
    [zoomFor]
  )
  const zoomIn = React.useCallback(() => zoomBy(ZOOM_STEP), [zoomBy])
  const zoomOut = React.useCallback(() => zoomBy(1 / ZOOM_STEP), [zoomBy])
  const [fitMode, setFitMode] = React.useState<FitMode>("view")
  const fit = React.useCallback((mode: FitMode) => {
    setFitMode(mode)
    setZoom(1)
  }, [])
  const zoomReset = React.useCallback(() => fit("view"), [fit])
  const [timelineOpen, setTimelineOpen] = React.useState(false)
  const [keyframeTarget, setKeyframeTarget] = React.useState<string | null>(
    null
  )
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
      fitMode,
      fit,
      zoomBy,
      zoomToScale,
      canZoomToScale,
      zoomIn,
      zoomOut,
      zoomReset,
      timelineOpen,
      setTimelineOpen,
      toggleTimeline: () => setTimelineOpen((open) => !open),
      keyframeTarget,
      setKeyframeTarget,
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
      fitMode,
      fit,
      zoomBy,
      zoomToScale,
      canZoomToScale,
      zoomIn,
      zoomOut,
      zoomReset,
      timelineOpen,
      keyframeTarget,
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
