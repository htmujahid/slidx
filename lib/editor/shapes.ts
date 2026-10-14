export type ShapeKind =
  | "rectangle"
  | "square"
  | "pill"
  | "ellipse"
  | "circle"
  | "triangle"
  | "right-triangle"
  | "diamond"
  | "parallelogram"
  | "trapezoid"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "star"
  | "star-6"
  | "star-4"
  | "burst"
  | "plus"
  | "cross"
  | "check"
  | "lightning"
  | "heart"
  | "cloud"
  | "ring"
  | "frame"
  | "speech-bubble"
  | "semicircle"
  | "quarter-circle"
  | "pie"
  | "crescent"
  | "chevron"
  | "arrow"
  | "double-arrow"
  | "line"
  | "elbow"
  | "zigzag"
  | "bracket"
  | "brace"
  | "parenthesis"
  | "angle-bracket"
  | "cylinder"
  | "document"
  | "predefined-process"
  | "callout"
  | "thought-bubble"
  | "ribbon"

export type ShapeParams = Record<string, number>

export type ShapeParam = {
  key: string
  label: string
  min: number
  max: number
  step?: number
  default: number
  unit?: "%" | "°" | "px"
  legacyProp?: "cornerRadius"
}

export type ShapeGeometry =
  | {
      tag: "rect"
      x: number
      y: number
      width: number
      height: number
      rx: number
    }
  | { tag: "circle"; cx: number; cy: number; r: number }
  | { tag: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { tag: "line"; x1: number; y1: number; x2: number; y2: number }
  | { tag: "polygon"; points: string }
  | { tag: "polyline"; points: string }
  | {
      tag: "path"
      d: string
      fillRule?: "evenodd" | "nonzero"
      shade?: string
    }

export type ShapeDefinition = {
  kind: ShapeKind
  label: string
  filled: boolean
  params?: ShapeParam[]
  geometry: (
    width: number,
    height: number,
    params: ShapeParams
  ) => ShapeGeometry
}

const round = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max)

export function resolveShapeParams(
  definition: ShapeDefinition,
  stored?: ShapeParams,
  legacy?: { cornerRadius?: number }
): ShapeParams {
  return Object.fromEntries(
    (definition.params ?? []).map((param) => [
      param.key,
      stored?.[param.key] ??
        (param.legacyProp ? legacy?.[param.legacyProp] : undefined) ??
        param.default,
    ])
  )
}

export type DashStyle = "solid" | "dashed" | "dotted"

export function strokeDashArray(style: DashStyle, strokeWidth: number) {
  const unit = Math.max(strokeWidth, 1)
  if (style === "dashed") return `${unit * 3} ${unit * 2}`
  if (style === "dotted") return `0.1 ${unit * 2}`
  return undefined
}

type Unit = Array<[number, number]>

const toPoints = (w: number, h: number, points: Unit) =>
  points.map(([x, y]) => `${round(x * w)},${round(y * h)}`).join(" ")

const polygon = (w: number, h: number, points: Unit): ShapeGeometry => ({
  tag: "polygon",
  points: toPoints(w, h, points),
})

const polyline = (w: number, h: number, points: Unit): ShapeGeometry => ({
  tag: "polyline",
  points: toPoints(w, h, points),
})

const path = (
  d: string,
  fillRule?: "evenodd" | "nonzero",
  shade?: string
): ShapeGeometry => ({ tag: "path", d, fillRule, shade })

const regularPolygon = (
  sides: number,
  w: number,
  h: number,
  rotate = -90
): ShapeGeometry =>
  polygon(
    w,
    h,
    Array.from({ length: sides }, (_, i) => {
      const a = ((rotate + (360 / sides) * i) * Math.PI) / 180
      return [0.5 + Math.cos(a) / 2, 0.5 + Math.sin(a) / 2] as [number, number]
    })
  )

const star = (
  points: number,
  inner: number,
  w: number,
  h: number
): ShapeGeometry =>
  polygon(
    w,
    h,
    Array.from({ length: points * 2 }, (_, i) => {
      const a = ((-90 + (180 / points) * i) * Math.PI) / 180
      const r = i % 2 === 0 ? 1 : inner
      return [0.5 + (Math.cos(a) * r) / 2, 0.5 + (Math.sin(a) * r) / 2] as [
        number,
        number,
      ]
    })
  )

function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
  return `M${round(cx - rx)} ${round(cy)}A${round(rx)} ${round(ry)} 0 1 1 ${round(cx + rx)} ${round(cy)}A${round(rx)} ${round(ry)} 0 1 1 ${round(cx - rx)} ${round(cy)}Z`
}

const centered = (w: number, h: number, size: number) => ({
  x: round((w - size) / 2),
  y: round((h - size) / 2),
})

export const SHAPES: ShapeDefinition[] = [
  {
    kind: "rectangle",
    label: "Rectangle",
    filled: true,
    params: [
      {
        key: "radius",
        label: "Corner radius",
        min: 0,
        max: 400,
        default: 0,
        unit: "px",
        legacyProp: "cornerRadius",
      },
    ],
    geometry: (w, h, { radius }) => ({
      tag: "rect",
      x: 0,
      y: 0,
      width: w,
      height: h,
      rx: clamp(radius, 0, Math.min(w, h) / 2),
    }),
  },
  {
    kind: "square",
    label: "Square",
    filled: true,
    params: [
      {
        key: "radius",
        label: "Corner radius",
        min: 0,
        max: 400,
        default: 0,
        unit: "px",
      },
    ],
    geometry: (w, h, { radius }) => {
      const size = Math.min(w, h)
      return {
        tag: "rect",
        ...centered(w, h, size),
        width: size,
        height: size,
        rx: clamp(radius, 0, size / 2),
      }
    },
  },
  {
    kind: "pill",
    label: "Pill",
    filled: true,
    geometry: (w, h) => ({
      tag: "rect",
      x: 0,
      y: 0,
      width: w,
      height: h,
      rx: Math.min(w, h) / 2,
    }),
  },
  {
    kind: "ellipse",
    label: "Ellipse",
    filled: true,
    geometry: (w, h) => ({
      tag: "ellipse",
      cx: w / 2,
      cy: h / 2,
      rx: w / 2,
      ry: h / 2,
    }),
  },
  {
    kind: "circle",
    label: "Circle",
    filled: true,
    geometry: (w, h) => ({
      tag: "circle",
      cx: w / 2,
      cy: h / 2,
      r: Math.min(w, h) / 2,
    }),
  },
  {
    kind: "triangle",
    label: "Triangle",
    filled: true,
    params: [
      {
        key: "apex",
        label: "Apex position",
        min: 0,
        max: 100,
        default: 50,
        unit: "%",
      },
    ],
    geometry: (w, h, { apex }) =>
      polygon(w, h, [
        [clamp(apex, 0, 100) / 100, 0],
        [1, 1],
        [0, 1],
      ]),
  },
  {
    kind: "right-triangle",
    label: "Right triangle",
    filled: true,
    geometry: (w, h) =>
      polygon(w, h, [
        [0, 0],
        [1, 1],
        [0, 1],
      ]),
  },
  {
    kind: "diamond",
    label: "Diamond",
    filled: true,
    geometry: (w, h) =>
      polygon(w, h, [
        [0.5, 0],
        [1, 0.5],
        [0.5, 1],
        [0, 0.5],
      ]),
  },
  {
    kind: "parallelogram",
    label: "Parallelogram",
    filled: true,
    params: [
      { key: "slant", label: "Slant", min: 0, max: 45, default: 22, unit: "%" },
    ],
    geometry: (w, h, { slant }) => {
      const s = clamp(slant, 0, 48) / 100
      return polygon(w, h, [
        [s, 0],
        [1, 0],
        [1 - s, 1],
        [0, 1],
      ])
    },
  },
  {
    kind: "trapezoid",
    label: "Trapezoid",
    filled: true,
    params: [
      {
        key: "inset",
        label: "Top inset",
        min: 0,
        max: 45,
        default: 20,
        unit: "%",
      },
    ],
    geometry: (w, h, { inset }) => {
      const i = clamp(inset, 0, 48) / 100
      return polygon(w, h, [
        [i, 0],
        [1 - i, 0],
        [1, 1],
        [0, 1],
      ])
    },
  },
  {
    kind: "pentagon",
    label: "Pentagon",
    filled: true,
    geometry: (w, h) => regularPolygon(5, w, h),
  },
  {
    kind: "hexagon",
    label: "Hexagon",
    filled: true,
    geometry: (w, h) => regularPolygon(6, w, h, 0),
  },
  {
    kind: "octagon",
    label: "Octagon",
    filled: true,
    geometry: (w, h) => regularPolygon(8, w, h, -22.5),
  },
  {
    kind: "star",
    label: "Star",
    filled: true,
    params: [
      { key: "points", label: "Points", min: 3, max: 16, default: 5 },
      {
        key: "inner",
        label: "Inner radius",
        min: 10,
        max: 90,
        default: 40,
        unit: "%",
      },
    ],
    geometry: (w, h, { points, inner }) =>
      star(Math.round(clamp(points, 3, 32)), clamp(inner, 5, 95) / 100, w, h),
  },
  {
    kind: "star-6",
    label: "6-point star",
    filled: true,
    params: [
      { key: "points", label: "Points", min: 3, max: 16, default: 6 },
      {
        key: "inner",
        label: "Inner radius",
        min: 10,
        max: 90,
        default: 55,
        unit: "%",
      },
    ],
    geometry: (w, h, { points, inner }) =>
      star(Math.round(clamp(points, 3, 32)), clamp(inner, 5, 95) / 100, w, h),
  },
  {
    kind: "star-4",
    label: "Sparkle",
    filled: true,
    params: [
      { key: "points", label: "Points", min: 3, max: 16, default: 4 },
      {
        key: "inner",
        label: "Inner radius",
        min: 10,
        max: 90,
        default: 30,
        unit: "%",
      },
    ],
    geometry: (w, h, { points, inner }) =>
      star(Math.round(clamp(points, 3, 32)), clamp(inner, 5, 95) / 100, w, h),
  },
  {
    kind: "burst",
    label: "Starburst",
    filled: true,
    params: [
      { key: "points", label: "Points", min: 3, max: 16, default: 12 },
      {
        key: "inner",
        label: "Inner radius",
        min: 10,
        max: 90,
        default: 80,
        unit: "%",
      },
    ],
    geometry: (w, h, { points, inner }) =>
      star(Math.round(clamp(points, 3, 32)), clamp(inner, 5, 95) / 100, w, h),
  },
  {
    kind: "plus",
    label: "Plus",
    filled: true,
    params: [
      {
        key: "thickness",
        label: "Arm thickness",
        min: 10,
        max: 80,
        default: 34,
        unit: "%",
      },
    ],
    geometry: (w, h, { thickness }) => {
      const a = (1 - clamp(thickness, 5, 95) / 100) / 2
      const b = 1 - a
      return polygon(w, h, [
        [a, 0],
        [b, 0],
        [b, a],
        [1, a],
        [1, b],
        [b, b],
        [b, 1],
        [a, 1],
        [a, b],
        [0, b],
        [0, a],
        [a, a],
      ])
    },
  },
  {
    kind: "cross",
    label: "Cross",
    filled: true,
    params: [
      {
        key: "thickness",
        label: "Arm thickness",
        min: 5,
        max: 40,
        default: 14,
        unit: "%",
      },
    ],
    geometry: (w, h, { thickness }) => {
      const t = clamp(thickness, 3, 45) / 100
      return polygon(w, h, [
        [t, 0],
        [0.5, 0.5 - t],
        [1 - t, 0],
        [1, t],
        [0.5 + t, 0.5],
        [1, 1 - t],
        [1 - t, 1],
        [0.5, 0.5 + t],
        [t, 1],
        [0, 1 - t],
        [0.5 - t, 0.5],
        [0, t],
      ])
    },
  },
  {
    kind: "check",
    label: "Check",
    filled: true,
    geometry: (w, h) =>
      polygon(w, h, [
        [0.04, 0.55],
        [0.18, 0.41],
        [0.39, 0.62],
        [0.82, 0.12],
        [0.96, 0.26],
        [0.39, 0.9],
      ]),
  },
  {
    kind: "lightning",
    label: "Lightning",
    filled: true,
    geometry: (w, h) =>
      polygon(w, h, [
        [0.62, 0],
        [0.18, 0.56],
        [0.46, 0.56],
        [0.36, 1],
        [0.84, 0.4],
        [0.55, 0.4],
        [0.74, 0],
      ]),
  },
  {
    kind: "heart",
    label: "Heart",
    filled: true,
    geometry: (w, h) =>
      path(
        `M${w / 2} ${h}C${-w * 0.1} ${h * 0.55} ${w * 0.08} ${-h * 0.04} ${w / 2} ${h * 0.28}C${w * 0.92} ${-h * 0.04} ${w * 1.1} ${h * 0.55} ${w / 2} ${h}Z`
      ),
  },
  {
    kind: "cloud",
    label: "Cloud",
    filled: true,
    geometry: (w, h) =>
      path(
        `M${w * 0.24} ${h * 0.85}A${w * 0.2} ${h * 0.22} 0 0 1 ${w * 0.2} ${h * 0.45}A${w * 0.2} ${h * 0.3} 0 0 1 ${w * 0.5} ${h * 0.2}A${w * 0.22} ${h * 0.25} 0 0 1 ${w * 0.8} ${h * 0.42}A${w * 0.2} ${h * 0.22} 0 0 1 ${w * 0.76} ${h * 0.85}Z`
      ),
  },
  {
    kind: "ring",
    label: "Ring",
    filled: true,
    params: [
      {
        key: "hole",
        label: "Hole size",
        min: 10,
        max: 90,
        default: 60,
        unit: "%",
      },
    ],
    geometry: (w, h, { hole }) => {
      const k = clamp(hole, 5, 95) / 100
      return path(
        ellipsePath(w / 2, h / 2, w / 2, h / 2) +
          ellipsePath(w / 2, h / 2, (w / 2) * k, (h / 2) * k),
        "evenodd"
      )
    },
  },
  {
    kind: "frame",
    label: "Frame",
    filled: true,
    params: [
      {
        key: "thickness",
        label: "Thickness",
        min: 2,
        max: 45,
        default: 14,
        unit: "%",
      },
    ],
    geometry: (w, h, { thickness }) => {
      const t = round((Math.min(w, h) * clamp(thickness, 1, 49)) / 100)
      return path(
        `M0 0H${w}V${h}H0ZM${t} ${t}H${round(w - t)}V${round(h - t)}H${t}Z`,
        "evenodd"
      )
    },
  },
  {
    kind: "speech-bubble",
    label: "Speech bubble",
    filled: true,
    params: [
      {
        key: "tail",
        label: "Tail position",
        min: 4,
        max: 70,
        default: 24,
        unit: "%",
      },
    ],
    geometry: (w, h, { tail }) => {
      const r = Math.min(w, h) * 0.12
      const b = h * 0.8
      const tip = w * (clamp(tail, 4, 72) / 100)
      return path(
        `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${b - r}Q${w} ${b} ${w - r} ${b}H${round(tip + w * 0.21)}L${round(tip)} ${h}L${round(tip + w * 0.04)} ${b}H${r}Q0 ${b} 0 ${b - r}V${r}Q0 0 ${r} 0Z`
      )
    },
  },
  {
    kind: "semicircle",
    label: "Semicircle",
    filled: true,
    geometry: (w, h) => path(`M0 ${h}A${w / 2} ${h} 0 0 1 ${w} ${h}Z`),
  },
  {
    kind: "quarter-circle",
    label: "Quarter circle",
    filled: true,
    geometry: (w, h) => path(`M0 0A${w} ${h} 0 0 1 ${w} ${h}H0Z`),
  },
  {
    kind: "pie",
    label: "Pie",
    filled: true,
    params: [
      {
        key: "start",
        label: "Start angle",
        min: 0,
        max: 359,
        default: 0,
        unit: "°",
      },
      {
        key: "sweep",
        label: "Sweep",
        min: 10,
        max: 350,
        default: 270,
        unit: "°",
      },
    ],
    geometry: (w, h, { start, sweep }) => {
      const rx = w / 2
      const ry = h / 2
      const sweepAngle = clamp(sweep, 1, 359)
      const point = (degrees: number) => {
        const a = (degrees * Math.PI) / 180
        return `${round(rx + rx * Math.sin(a))} ${round(ry - ry * Math.cos(a))}`
      }
      return path(
        `M${rx} ${ry}L${point(start)}A${rx} ${ry} 0 ${sweepAngle > 180 ? 1 : 0} 1 ${point(start + sweepAngle)}Z`
      )
    },
  },
  {
    kind: "crescent",
    label: "Crescent",
    filled: true,
    params: [
      {
        key: "thickness",
        label: "Thickness",
        min: 8,
        max: 70,
        default: 28,
        unit: "%",
      },
    ],
    geometry: (w, h, { thickness }) => {
      const d = clamp(thickness, 4, 80) / 100
      const x = round(w * (0.5 + d / 2))
      const dy = (h / 2) * Math.sqrt(1 - d * d)
      const top = round(h / 2 - dy)
      const bottom = round(h / 2 + dy)
      return path(
        `M${x} ${top}A${w / 2} ${h / 2} 0 1 0 ${x} ${bottom}A${w / 2} ${h / 2} 0 0 1 ${x} ${top}Z`
      )
    },
  },
  {
    kind: "chevron",
    label: "Chevron",
    filled: true,
    params: [
      {
        key: "depth",
        label: "Point depth",
        min: 10,
        max: 70,
        default: 40,
        unit: "%",
      },
    ],
    geometry: (w, h, { depth }) => {
      const d = clamp(depth, 5, 80) / 100
      return polygon(w, h, [
        [0, 0],
        [1 - d, 0],
        [1, 0.5],
        [1 - d, 1],
        [0, 1],
        [d, 0.5],
      ])
    },
  },
  {
    kind: "arrow",
    label: "Arrow",
    filled: true,
    params: [
      {
        key: "head",
        label: "Head length",
        min: 10,
        max: 90,
        default: 40,
        unit: "%",
      },
      {
        key: "shaft",
        label: "Shaft thickness",
        min: 10,
        max: 90,
        default: 40,
        unit: "%",
      },
    ],
    geometry: (w, h, { head, shaft }) => {
      const hd = clamp(head, 5, 95) / 100
      const y0 = 0.5 - clamp(shaft, 5, 95) / 200
      const y1 = 1 - y0
      return polygon(w, h, [
        [0, y0],
        [1 - hd, y0],
        [1 - hd, 0],
        [1, 0.5],
        [1 - hd, 1],
        [1 - hd, y1],
        [0, y1],
      ])
    },
  },
  {
    kind: "double-arrow",
    label: "Double arrow",
    filled: true,
    params: [
      {
        key: "head",
        label: "Head length",
        min: 10,
        max: 45,
        default: 25,
        unit: "%",
      },
      {
        key: "shaft",
        label: "Shaft thickness",
        min: 10,
        max: 90,
        default: 40,
        unit: "%",
      },
    ],
    geometry: (w, h, { head, shaft }) => {
      const hd = clamp(head, 5, 48) / 100
      const y0 = 0.5 - clamp(shaft, 5, 95) / 200
      const y1 = 1 - y0
      return polygon(w, h, [
        [0, 0.5],
        [hd, 0],
        [hd, y0],
        [1 - hd, y0],
        [1 - hd, 0],
        [1, 0.5],
        [1 - hd, 1],
        [1 - hd, y1],
        [hd, y1],
        [hd, 1],
      ])
    },
  },
  {
    kind: "line",
    label: "Line",
    filled: false,
    geometry: (w, h) => ({ tag: "line", x1: 0, y1: h / 2, x2: w, y2: h / 2 }),
  },
  {
    kind: "elbow",
    label: "Elbow line",
    filled: false,
    params: [
      {
        key: "bend",
        label: "Bend position",
        min: 10,
        max: 90,
        default: 50,
        unit: "%",
      },
    ],
    geometry: (w, h, { bend }) => {
      const b = clamp(bend, 0, 100) / 100
      return polyline(w, h, [
        [0, 0],
        [b, 0],
        [b, 1],
        [1, 1],
      ])
    },
  },
  {
    kind: "zigzag",
    label: "Zigzag line",
    filled: false,
    params: [
      { key: "segments", label: "Segments", min: 2, max: 16, default: 5 },
    ],
    geometry: (w, h, { segments }) => {
      const n = Math.round(clamp(segments, 2, 40))
      return polyline(
        w,
        h,
        Array.from({ length: n + 1 }, (_, i) => [i / n, i % 2 === 0 ? 1 : 0])
      )
    },
  },
  {
    kind: "bracket",
    label: "Bracket",
    filled: false,
    geometry: (w, h) =>
      polyline(w, h, [
        [1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
      ]),
  },
  {
    kind: "brace",
    label: "Brace",
    filled: false,
    geometry: (w, h) =>
      path(
        `M${w} 0C${w * 0.5} 0 ${w * 0.5} ${h * 0.1} ${w * 0.5} ${h * 0.25}V${h * 0.4}C${w * 0.5} ${h * 0.47} ${w * 0.3} ${h * 0.5} 0 ${h * 0.5}C${w * 0.3} ${h * 0.5} ${w * 0.5} ${h * 0.53} ${w * 0.5} ${h * 0.6}V${h * 0.75}C${w * 0.5} ${h * 0.9} ${w * 0.5} ${h} ${w} ${h}`
      ),
  },
  {
    kind: "parenthesis",
    label: "Parenthesis",
    filled: false,
    geometry: (w, h) =>
      path(
        `M${w} 0C${round(w * 0.1)} ${round(h * 0.22)} ${round(w * 0.1)} ${round(h * 0.78)} ${w} ${h}`
      ),
  },
  {
    kind: "angle-bracket",
    label: "Angle bracket",
    filled: false,
    geometry: (w, h) =>
      polyline(w, h, [
        [1, 0],
        [0, 0.5],
        [1, 1],
      ]),
  },
  {
    kind: "cylinder",
    label: "Cylinder",
    filled: true,
    params: [
      {
        key: "depth",
        label: "Top depth",
        min: 5,
        max: 40,
        default: 20,
        unit: "%",
      },
    ],
    geometry: (w, h, { depth }) => {
      const ry = round(Math.min((h * clamp(depth, 2, 45)) / 100, w * 0.25))
      const rx = round(w / 2)
      return path(
        `M0 ${ry}A${rx} ${ry} 0 0 1 ${w} ${ry}V${round(h - ry)}A${rx} ${ry} 0 0 1 0 ${round(h - ry)}Z`,
        undefined,
        ellipsePath(w / 2, ry, rx, ry)
      )
    },
  },
  {
    kind: "document",
    label: "Document",
    filled: true,
    params: [
      {
        key: "wave",
        label: "Wave depth",
        min: 0,
        max: 30,
        default: 18,
        unit: "%",
      },
    ],
    geometry: (w, h, { wave }) => {
      const depth = clamp(wave, 0, 40) / 100
      const base = round(h * (1 - depth))
      const control = round(h * (1 - 2 * depth))
      return path(
        `M0 0H${w}V${base}Q${round(w * 0.75)} ${control} ${round(w * 0.5)} ${base}T0 ${base}Z`
      )
    },
  },
  {
    kind: "predefined-process",
    label: "Predefined process",
    filled: true,
    params: [
      {
        key: "inset",
        label: "Bar position",
        min: 3,
        max: 30,
        default: 12,
        unit: "%",
      },
    ],
    geometry: (w, h, { inset }) => {
      const bar = round(Math.max(w * 0.012, 2))
      const left = round((w * clamp(inset, 2, 40)) / 100)
      const right = round(w - left)
      return path(
        `M0 0H${w}V${h}H0Z` +
          `M${left} 0H${round(left + bar)}V${h}H${left}Z` +
          `M${round(right - bar)} 0H${right}V${h}H${round(right - bar)}Z`,
        "evenodd"
      )
    },
  },
  {
    kind: "callout",
    label: "Callout",
    filled: true,
    params: [
      {
        key: "tail",
        label: "Tail position",
        min: 4,
        max: 70,
        default: 20,
        unit: "%",
      },
    ],
    geometry: (w, h, { tail }) => {
      const t = clamp(tail, 4, 74) / 100
      return polygon(w, h, [
        [0, 0],
        [1, 0],
        [1, 0.78],
        [t + 0.22, 0.78],
        [t, 1],
        [t + 0.04, 0.78],
        [0, 0.78],
      ])
    },
  },
  {
    kind: "thought-bubble",
    label: "Thought bubble",
    filled: true,
    geometry: (w, h) =>
      path(
        ellipsePath(w / 2, h * 0.4, w / 2, h * 0.4) +
          ellipsePath(w * 0.2, h * 0.86, w * 0.06, h * 0.06) +
          ellipsePath(w * 0.08, h * 0.96, w * 0.035, h * 0.035)
      ),
  },
  {
    kind: "ribbon",
    label: "Ribbon",
    filled: true,
    params: [
      {
        key: "notch",
        label: "Notch depth",
        min: 0,
        max: 40,
        default: 10,
        unit: "%",
      },
      {
        key: "band",
        label: "Band height",
        min: 30,
        max: 100,
        default: 76,
        unit: "%",
      },
    ],
    geometry: (w, h, { notch, band }) => {
      const n = clamp(notch, 0, 45) / 100
      const y0 = 0.5 - clamp(band, 10, 100) / 200
      const y1 = 1 - y0
      return polygon(w, h, [
        [0, y0],
        [1, y0],
        [1 - n, 0.5],
        [1, y1],
        [0, y1],
        [n, 0.5],
      ])
    },
  },
]

export const SHAPES_BY_KIND = Object.fromEntries(
  SHAPES.map((shape) => [shape.kind, shape])
) as Record<ShapeKind, ShapeDefinition>

export const SHAPE_CATEGORIES: { label: string; kinds: ShapeKind[] }[] = [
  {
    label: "Basic",
    kinds: [
      "rectangle",
      "square",
      "pill",
      "ellipse",
      "circle",
      "triangle",
      "right-triangle",
      "diamond",
    ],
  },
  {
    label: "Polygons",
    kinds: ["parallelogram", "trapezoid", "pentagon", "hexagon", "octagon"],
  },
  {
    label: "Symbols",
    kinds: [
      "star",
      "star-6",
      "star-4",
      "burst",
      "plus",
      "cross",
      "check",
      "lightning",
      "heart",
      "cloud",
      "ring",
      "frame",
    ],
  },
  {
    label: "Callouts",
    kinds: ["speech-bubble", "callout", "thought-bubble", "ribbon"],
  },
  {
    label: "Diagrams",
    kinds: ["cylinder", "document", "predefined-process"],
  },
  {
    label: "Arcs",
    kinds: ["semicircle", "quarter-circle", "pie", "crescent"],
  },
  {
    label: "Arrows & lines",
    kinds: [
      "chevron",
      "arrow",
      "double-arrow",
      "line",
      "elbow",
      "zigzag",
      "bracket",
      "brace",
      "parenthesis",
      "angle-bracket",
    ],
  },
]
