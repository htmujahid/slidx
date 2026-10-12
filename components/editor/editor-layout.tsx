"use client"

import * as React from "react"

import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/lib/editor/constants"

export type EditorDialog = "rename" | "new" | "reset" | null

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
  animationPreview: { active: boolean; run: number }
  playAnimationPreview: (durationMs: number) => void
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
  const [animationPreview, setAnimationPreview] = React.useState({
    active: false,
    run: 0,
  })
  const previewTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const playAnimationPreview = React.useCallback((durationMs: number) => {
    clearTimeout(previewTimer.current)
    setAnimationPreview((current) => ({ active: true, run: current.run + 1 }))
    previewTimer.current = setTimeout(
      () => setAnimationPreview((current) => ({ ...current, active: false })),
      durationMs
    )
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
      animationPreview,
      playAnimationPreview,
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
      animationPreview,
      playAnimationPreview,
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
