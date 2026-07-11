import type { TrackKind } from "../kind-icons"

export const RAIL_WIDTH_PX = 176
export const DEFAULT_PX_PER_SECOND = 40
export const MIN_PX_PER_SECOND = 10
export const MAX_PX_PER_SECOND = 120
export const SNAP_SECONDS = 0.5
export const FINE_SNAP_SECONDS = 0.1
export const MIN_CLIP_SECONDS = 0.2

export const clipStyles: Record<TrackKind, string> = {
  shape: "border-chart-1/50 bg-chart-1/20",
  path: "border-chart-2/50 bg-chart-2/20",
  text: "border-chart-3/50 bg-chart-3/20",
  group: "border-chart-4/50 bg-chart-4/20",
  image: "border-chart-5/50 bg-chart-5/20",
}
