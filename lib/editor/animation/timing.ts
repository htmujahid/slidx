import type { AnimationEasing } from "@/lib/editor/easing"
import type { AnimationTrack } from "@/lib/editor/tracks/types"

export type AnimationPreset =
  | "none"
  | "fade-in"
  | "slide-in-left"
  | "slide-in-right"
  | "slide-in-up"
  | "slide-in-down"
  | "zoom-in"
  | "blur-in"
  | "bounce-in"
  | "wipe-in"
  | "typewriter"
  | "draw"
  | "chart-build"
  | "fade-out"
  | "slide-out-left"
  | "slide-out-right"
  | "slide-out-up"
  | "slide-out-down"
  | "zoom-out"
  | "blur-out"
  | "wipe-out"

export type TransitionSide = "enter" | "exit"

export type Transition = {
  preset: AnimationPreset
  duration: number
  easing: AnimationEasing
}

export type ElementSpan = {
  start: number
  end: number | null
  enter: Transition
  exit: Transition
}

export type ElementTiming = {
  spans: ElementSpan[]
  tracks: AnimationTrack[]
}

export const DEFAULT_SLIDE_DURATION = 5000
export const MIN_VISIBLE_MS = 100

const DEFAULT_ENTER: Transition = {
  preset: "none",
  duration: 600,
  easing: "ease-out",
}
const DEFAULT_EXIT: Transition = { ...DEFAULT_ENTER, easing: "ease-in" }

export const DEFAULT_SPAN: ElementSpan = {
  start: 0,
  end: null,
  enter: DEFAULT_ENTER,
  exit: DEFAULT_EXIT,
}

export const DEFAULT_TIMING: ElementTiming = {
  spans: [DEFAULT_SPAN],
  tracks: [],
}

export const resolveSpan = (span?: Partial<ElementSpan>): ElementSpan => ({
  ...DEFAULT_SPAN,
  ...span,
  enter: { ...DEFAULT_ENTER, ...span?.enter },
  exit: { ...DEFAULT_EXIT, ...span?.exit },
})

export function resolveTiming(timing?: Partial<ElementTiming>): ElementTiming {
  return {
    spans:
      timing?.spans && timing.spans.length > 0
        ? timing.spans.map(resolveSpan)
        : [DEFAULT_SPAN],
    tracks: timing?.tracks ?? [],
  }
}
