import { createStore } from "zustand/vanilla"

import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from "@/lib/editor/constants"

export type FitMode = "view" | "width"

export type ViewportState = {
  zoom: number
  fitMode: FitMode
  canvasScale: number
  setCanvasScale: (scale: number) => void
  fit: (mode: FitMode) => void
  zoomBy: (factor: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomReset: () => void
  zoomToScale: (scale: number) => void
}

const clampZoom = (zoom: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))

export const zoomForScale = (
  { zoom, canvasScale }: Pick<ViewportState, "zoom" | "canvasScale">,
  scale: number
) => (scale * zoom) / (canvasScale || 1)

export const canZoomToScale = (
  state: Pick<ViewportState, "zoom" | "canvasScale">,
  scale: number
) => {
  const target = zoomForScale(state, scale)
  return target >= ZOOM_MIN && target <= ZOOM_MAX
}

export const createViewportStore = () =>
  createStore<ViewportState>()((set, get) => ({
    zoom: 1,
    fitMode: "view",
    canvasScale: 1,
    setCanvasScale: (canvasScale) => set({ canvasScale }),
    fit: (fitMode) => set({ fitMode, zoom: 1 }),
    zoomBy: (factor) => set(({ zoom }) => ({ zoom: clampZoom(zoom * factor) })),
    zoomIn: () => get().zoomBy(ZOOM_STEP),
    zoomOut: () => get().zoomBy(1 / ZOOM_STEP),
    zoomReset: () => get().fit("view"),
    zoomToScale: (scale) =>
      set({ zoom: clampZoom(zoomForScale(get(), scale)) }),
  }))
