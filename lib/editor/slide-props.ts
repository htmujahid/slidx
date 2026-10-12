import {
  DEFAULT_SLIDE_DURATION,
  DEFAULT_TIMING,
  type ElementTiming,
} from "@/lib/editor/animation"
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"

export type BackgroundType = "solid" | "gradient" | "image"
export type GradientType = "linear" | "radial"
export type ImageFit = "cover" | "contain"

export type SlideProps = {
  backgroundType: BackgroundType
  background: string
  gradientType: GradientType
  gradientFrom: string
  gradientTo: string
  gradientAngle: number
  backgroundImage: string
  imageFit: ImageFit
  showGrid: boolean
  gridSize: number
  snapToGrid: boolean
  snapToAlignment: boolean
  /** How long the slide plays, in milliseconds. Elements are on it throughout unless trimmed. */
  duration: number
  /** The slide's size, in the units everything on it is placed in. */
  width: number
  height: number
  /** The slide's own entrance and exit; its first span's presets apply to the whole slide. */
  timing: ElementTiming
}

export const SLIDE_DEFAULTS: SlideProps = {
  backgroundType: "solid",
  background: "#ffffff",
  gradientType: "linear",
  gradientFrom: "#eef2ff",
  gradientTo: "#a5b4fc",
  gradientAngle: 135,
  backgroundImage: "",
  imageFit: "cover",
  showGrid: false,
  gridSize: 40,
  snapToGrid: false,
  snapToAlignment: true,
  duration: DEFAULT_SLIDE_DURATION,
  width: SLIDE_WIDTH,
  height: SLIDE_HEIGHT,
  timing: DEFAULT_TIMING,
}

/**
 * Endpoints of a CSS-style linear gradient (0° points up, 90° right) across a
 * width × height box. The line runs through the center and is long enough
 * that the end colors land exactly on the corners.
 */
export function linearGradientPoints(
  angle: number,
  width: number,
  height: number
) {
  const radians = (angle * Math.PI) / 180
  const dx = Math.sin(radians)
  const dy = -Math.cos(radians)
  const half = (Math.abs(width * dx) + Math.abs(height * dy)) / 2
  const cx = width / 2
  const cy = height / 2
  return {
    x1: cx - dx * half,
    y1: cy - dy * half,
    x2: cx + dx * half,
    y2: cy + dy * half,
  }
}
