import type { AnimationEasing } from "@/lib/editor/easing"

export type TrackProperty =
  | "x"
  | "y"
  | "width"
  | "height"
  | "rotation"
  | "scale"
  | "opacity"
  | "blur"
  | "brightness"
  | "grayscale"
  | "strokeWidth"

export type Keyframe = {
  at: number
  value: number
  easing: AnimationEasing
}

export type AnimationTrack = { property: TrackProperty; keyframes: Keyframe[] }

export type ElementValues = Partial<
  Record<"x" | "y" | "width" | "height" | "rotation" | "strokeWidth", number>
>

export type TrackGroup = "Position and size" | "Appearance" | "Effects"
