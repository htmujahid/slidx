import type {
  ElementValues,
  TrackGroup,
  TrackProperty,
} from "@/lib/editor/tracks/types"

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
