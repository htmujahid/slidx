export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const

export type BlendMode = (typeof BLEND_MODES)[number]

export type ElementTransformProps = {
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  flipX: boolean
  flipY: boolean
  shadow: boolean
  shadowColor: string
  shadowOpacity: number
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  blendMode: BlendMode
  blur: number
  grayscale: number
  brightness: number
}

export const DEFAULT_TRANSFORM: ElementTransformProps = {
  name: "",
  x: 760,
  y: 390,
  width: 400,
  height: 300,
  rotation: 0,
  opacity: 1,
  flipX: false,
  flipY: false,
  shadow: false,
  shadowColor: "#000000",
  shadowOpacity: 0.35,
  shadowBlur: 18,
  shadowOffsetX: 0,
  shadowOffsetY: 10,
  blendMode: "normal",
  blur: 0,
  grayscale: 0,
  brightness: 100,
}

const HEX_COLOR = /^#([0-9a-f]{6})$/i

export function hexToRgba(hex: string, alpha: number) {
  const match = HEX_COLOR.exec(hex.trim())
  if (!match) return hex
  const value = parseInt(match[1], 16)
  const r = (value >> 16) & 0xff
  const g = (value >> 8) & 0xff
  const b = value & 0xff
  return `rgb(${r} ${g} ${b} / ${Math.round(alpha * 100) / 100})`
}

export function elementFilter(props: ElementTransformProps) {
  const parts = [
    props.brightness !== 100 ? `brightness(${props.brightness}%)` : null,
    props.grayscale > 0 ? `grayscale(${props.grayscale}%)` : null,
    props.blur > 0 ? `blur(${props.blur}px)` : null,
    props.shadow
      ? `drop-shadow(${props.shadowOffsetX}px ${props.shadowOffsetY}px ${props.shadowBlur}px ${hexToRgba(props.shadowColor, props.shadowOpacity)})`
      : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : undefined
}

export type TextAlign = "left" | "center" | "right" | "justify"
