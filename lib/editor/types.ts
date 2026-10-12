export type ElementTransformProps = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  flipX: boolean
  flipY: boolean
  shadow: boolean
}

export const DEFAULT_TRANSFORM: ElementTransformProps = {
  x: 760,
  y: 390,
  width: 400,
  height: 300,
  rotation: 0,
  opacity: 1,
  flipX: false,
  flipY: false,
  shadow: false,
}

export type TextAlign = "left" | "center" | "right"
