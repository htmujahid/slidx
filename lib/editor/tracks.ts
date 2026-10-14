import { EASINGS, type AnimationEasing } from "@/lib/editor/easing"

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

type PropertyDefinition = {
  label: string
  group: TrackGroup
  unit: string
  step: number
  min?: number
  max?: number
  only?: string[]
  rest: (values: ElementValues) => number
  variable: string
  syntax: string
  initial: string
  inherits?: boolean
  toCss: (value: number, rest: number) => string
}

const offset = (unit: string) => (value: number, rest: number) =>
  `${+(value - rest).toFixed(4)}${unit}`
const ratio = (value: number, rest: number) =>
  `${+(value / (rest || 1)).toFixed(4)}`

export const TRACK_PROPERTIES: Record<TrackProperty, PropertyDefinition> = {
  x: {
    label: "X",
    group: "Position and size",
    unit: "px",
    step: 10,
    rest: (values) => values.x ?? 0,
    variable: "--vx-x",
    syntax: "<length>",
    initial: "0px",
    toCss: offset("px"),
  },
  y: {
    label: "Y",
    group: "Position and size",
    unit: "px",
    step: 10,
    rest: (values) => values.y ?? 0,
    variable: "--vx-y",
    syntax: "<length>",
    initial: "0px",
    toCss: offset("px"),
  },
  width: {
    label: "Width",
    group: "Position and size",
    unit: "px",
    step: 10,
    min: 1,
    rest: (values) => values.width || 1,
    variable: "--vx-w",
    syntax: "<number>",
    initial: "1",
    toCss: ratio,
  },
  height: {
    label: "Height",
    group: "Position and size",
    unit: "px",
    step: 10,
    min: 1,
    rest: (values) => values.height || 1,
    variable: "--vx-h",
    syntax: "<number>",
    initial: "1",
    toCss: ratio,
  },
  rotation: {
    label: "Rotation",
    group: "Position and size",
    unit: "°",
    step: 15,
    rest: (values) => values.rotation ?? 0,
    variable: "--vx-r",
    syntax: "<angle>",
    initial: "0deg",
    toCss: offset("deg"),
  },
  scale: {
    label: "Scale",
    group: "Position and size",
    unit: "×",
    step: 0.1,
    min: 0,
    rest: () => 1,
    variable: "--vx-scale",
    syntax: "<number>",
    initial: "1",
    toCss: (value) => `${value}`,
  },
  opacity: {
    label: "Opacity",
    group: "Appearance",
    unit: "",
    step: 0.05,
    min: 0,
    max: 1,
    rest: () => 1,
    variable: "--vx-o",
    syntax: "<number>",
    initial: "1",
    toCss: (value) => `${value}`,
  },
  strokeWidth: {
    label: "Stroke width",
    group: "Appearance",
    unit: "px",
    step: 1,
    min: 0,
    only: ["Shape", "IconBox", "ArrowLine"],
    rest: (values) => values.strokeWidth ?? 0,
    variable: "--vx-sw",
    syntax: "<number>",
    initial: "0",
    inherits: true,
    toCss: (value) => `${value}`,
  },
  blur: {
    label: "Blur",
    group: "Effects",
    unit: "px",
    step: 2,
    min: 0,
    rest: () => 0,
    variable: "--vx-b",
    syntax: "<length>",
    initial: "0px",
    toCss: (value) => `${value}px`,
  },
  brightness: {
    label: "Brightness",
    group: "Effects",
    unit: "%",
    step: 10,
    min: 0,
    rest: () => 100,
    variable: "--vx-br",
    syntax: "<number>",
    initial: "1",
    toCss: (value) => `${+(value / 100).toFixed(4)}`,
  },
  grayscale: {
    label: "Grayscale",
    group: "Effects",
    unit: "%",
    step: 10,
    min: 0,
    max: 100,
    rest: () => 0,
    variable: "--vx-g",
    syntax: "<number>",
    initial: "0",
    toCss: (value) => `${+(value / 100).toFixed(4)}`,
  },
}

export const TRACK_ORDER = Object.keys(TRACK_PROPERTIES) as TrackProperty[]

export const propertiesFor = (nodeName: string) =>
  TRACK_ORDER.filter((property) => {
    const only = TRACK_PROPERTIES[property].only
    return !only || only.includes(nodeName)
  })

export const restValue = (property: TrackProperty, values: ElementValues) =>
  TRACK_PROPERTIES[property].rest(values)

export function elementValues(props: Record<string, unknown>): ElementValues {
  const pick = (key: keyof ElementValues) =>
    typeof props[key] === "number" ? (props[key] as number) : undefined
  return {
    x: pick("x"),
    y: pick("y"),
    width: pick("width"),
    height: pick("height"),
    rotation: pick("rotation"),
    strokeWidth: pick("strokeWidth"),
  }
}

export function compileTracks(options: {
  scope: string
  id: string
  tracks: AnimationTrack[]
  values: ElementValues
  durationMs: number
  delay: number
}) {
  const { scope, id, values, durationMs } = options
  const keyframes = new Map<string, string>()
  const registrations = new Map<string, string>()
  const animations: string[] = []
  const declarations = new Set<string>()
  const drawn = new Set<string>()
  const percent = (ms: number) =>
    +((Math.min(Math.max(ms, 0), durationMs) / durationMs) * 100).toFixed(4)

  for (const { property, keyframes: points } of options.tracks) {
    const def = TRACK_PROPERTIES[property]
    if (!def || points.length === 0) continue
    const name = `vx-${scope}-${id}-${property}`
    const rest = def.rest(values)
    const ordered = [...points].sort((a, b) => a.at - b.at)
    const first = ordered[0]
    const last = ordered[ordered.length - 1]
    const frames = [
      ...(percent(first.at) > 0 ? [{ ...first, at: 0 }] : []),
      ...ordered,
      ...(percent(last.at) < 100 ? [{ ...last, at: durationMs }] : []),
    ]
    keyframes.set(
      name,
      frames
        .map(
          (point) =>
            `${percent(point.at)}%{${def.variable}:${def.toCss(point.value, rest)};animation-timing-function:${EASINGS[point.easing].css}}`
        )
        .join("")
    )
    registrations.set(
      def.variable,
      `@property ${def.variable}{syntax:"${def.syntax}";inherits:${def.inherits ? "true" : "false"};initial-value:${def.initial}}`
    )
    animations.push(`${name} ${durationMs}ms linear ${options.delay}ms 1 both`)

    if (property === "x" || property === "y")
      declarations.add("translate:var(--vx-x,0px) var(--vx-y,0px)")
    else if (["scale", "width", "height"].includes(property))
      declarations.add(
        "scale:calc(var(--vx-scale,1)*var(--vx-w,1)) calc(var(--vx-scale,1)*var(--vx-h,1))"
      )
    else if (property === "rotation")
      declarations.add("rotate:var(--vx-r,0deg)")
    else if (property === "opacity") declarations.add("opacity:var(--vx-o,1)")
    else if (["blur", "brightness", "grayscale"].includes(property))
      declarations.add(
        "filter:blur(var(--vx-b,0px)) brightness(var(--vx-br,1)) grayscale(var(--vx-g,0))"
      )
    else if (property === "strokeWidth")
      drawn.add(`stroke-width:var(--vx-sw,${values.strokeWidth ?? 0})`)
  }

  return { keyframes, registrations, animations, declarations, drawn }
}
