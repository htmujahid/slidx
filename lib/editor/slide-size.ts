import { ROOT_NODE } from "@craftjs/core"

import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"

export type SlideSize = { width: number; height: number }

export const DEFAULT_SLIDE_SIZE: SlideSize = {
  width: SLIDE_WIDTH,
  height: SLIDE_HEIGHT,
}

export const MIN_SLIDE_DIMENSION = 320
export const MAX_SLIDE_DIMENSION = 7680

export const SLIDE_SIZE_PRESETS: (SlideSize & { id: string; label: string })[] =
  [
    { id: "widescreen", label: "Widescreen 16:9", width: 1920, height: 1080 },
    { id: "hd", label: "Widescreen 16:9 HD", width: 1280, height: 720 },
    { id: "wide-16-10", label: "Widescreen 16:10", width: 1920, height: 1200 },
    { id: "standard", label: "Standard 4:3", width: 1440, height: 1080 },
    { id: "square", label: "Square 1:1", width: 1080, height: 1080 },
    { id: "portrait", label: "Portrait 9:16", width: 1080, height: 1920 },
    { id: "a4-landscape", label: "A4 landscape", width: 1920, height: 1358 },
    { id: "a4-portrait", label: "A4 portrait", width: 1358, height: 1920 },
  ]

export const clampDimension = (value: number) =>
  Math.min(
    MAX_SLIDE_DIMENSION,
    Math.max(MIN_SLIDE_DIMENSION, Math.round(value))
  )

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)

export function aspectLabel({ width, height }: SlideSize) {
  const known: [string, number][] = [
    ["16:9", 16 / 9],
    ["16:10", 16 / 10],
    ["4:3", 4 / 3],
    ["3:2", 3 / 2],
    ["1:1", 1],
    ["9:16", 9 / 16],
    ["3:4", 3 / 4],
  ]
  const ratio = width / height
  const match = known.find(([, value]) => Math.abs(value - ratio) < 0.004)
  if (match) return match[0]
  const divisor = gcd(width, height)
  const [a, b] = [width / divisor, height / divisor]
  return a <= 40 && b <= 40 ? `${a}:${b}` : `${ratio.toFixed(2)}:1`
}

export const sameSize = (a: SlideSize, b: SlideSize) =>
  a.width === b.width && a.height === b.height

export function slideSizeOf(props?: Partial<SlideSize> | null): SlideSize {
  const valid = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) && value > 0
  return {
    width: valid(props?.width) ? (props!.width as number) : SLIDE_WIDTH,
    height: valid(props?.height) ? (props!.height as number) : SLIDE_HEIGHT,
  }
}

export type ResizeMode = "scale" | "keep"

export function slideSizeFromJson(json: string): SlideSize {
  try {
    return slideSizeOf(JSON.parse(json)?.[ROOT_NODE]?.props)
  } catch {
    return DEFAULT_SLIDE_SIZE
  }
}

type Node = {
  parent?: string | null
  type?: { resolvedName?: string }
  props: Record<string, unknown>
}

const PIXEL_PROPS: Record<string, string[]> = {
  TextBox: ["fontSize", "padding", "letterSpacing"],
  CodeBlock: ["fontSize", "cornerRadius"],
  ChartBox: ["fontSize"],
  Table: ["fontSize"],
  Equation: ["fontSize"],
  EmojiBox: ["fontSize"],
  ImageBox: ["cornerRadius"],
  Shape: ["strokeWidth"],
  ArrowLine: ["strokeWidth"],
}
const EFFECT_PROPS = ["shadowBlur", "shadowOffsetX", "shadowOffsetY", "blur"]

const round = (value: number) => Math.round(value * 1000) / 1000

const KEYFRAME_PIXELS: Record<string, "x" | "y" | "size"> = {
  x: "x",
  y: "y",
  width: "size",
  height: "size",
  strokeWidth: "size",
}

export function resizeSlideJson(json: string, to: SlideSize, mode: ResizeMode) {
  const nodes = JSON.parse(json) as Record<string, Node>
  const root = nodes[ROOT_NODE]
  if (!root) return json
  const from = slideSizeOf(root.props as Partial<SlideSize>)
  root.props.width = to.width
  root.props.height = to.height

  if (mode === "scale" && !sameSize(from, to)) {
    const factor = Math.min(to.width / from.width, to.height / from.height)
    const shift = {
      x: (to.width - from.width * factor) / 2,
      y: (to.height - from.height * factor) / 2,
    }
    for (const [id, node] of Object.entries(nodes)) {
      if (id === ROOT_NODE) continue
      const placed = node.parent === ROOT_NODE
      const scaleAt = (axis: "x" | "y", value: number) =>
        round(value * factor + (placed ? shift[axis] : 0))
      const props = node.props
      const set = (key: string, value: (current: number) => number) => {
        if (typeof props[key] === "number")
          props[key] = round(value(props[key] as number))
      }
      set("x", (value) => scaleAt("x", value))
      set("y", (value) => scaleAt("y", value))
      set("width", (value) => value * factor)
      set("height", (value) => value * factor)
      for (const key of [
        ...EFFECT_PROPS,
        ...(PIXEL_PROPS[node.type?.resolvedName ?? ""] ?? []),
      ])
        set(key, (value) => value * factor)

      const tracks = (props.timing as { tracks?: unknown[] } | undefined)
        ?.tracks as
        { property: string; keyframes: { value: number }[] }[] | undefined
      for (const track of tracks ?? []) {
        const kind = KEYFRAME_PIXELS[track.property]
        if (!kind) continue
        for (const keyframe of track.keyframes) {
          keyframe.value = round(
            kind === "size"
              ? keyframe.value * factor
              : scaleAt(kind, keyframe.value)
          )
        }
      }
    }
  }
  return JSON.stringify(nodes)
}
