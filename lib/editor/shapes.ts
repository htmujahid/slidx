export type ShapeKind =
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "right-triangle"
  | "diamond"
  | "parallelogram"
  | "trapezoid"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "star"
  | "star-4"
  | "plus"
  | "check"
  | "heart"
  | "cloud"
  | "ring"
  | "speech-bubble"
  | "chevron"
  | "arrow"
  | "double-arrow"
  | "line"

type ShapeOptions = { cornerRadius: number }

export type ShapeDefinition = {
  kind: ShapeKind
  label: string
  filled: boolean
  fillRule?: "evenodd" | "nonzero"
  path: (width: number, height: number, options: ShapeOptions) => string
}

const round = (n: number) => Math.round(n * 100) / 100

export type DashStyle = "solid" | "dashed" | "dotted"

export function strokeDashArray(style: DashStyle, strokeWidth: number) {
  const unit = Math.max(strokeWidth, 1)
  if (style === "dashed") return `${unit * 3} ${unit * 2}`
  if (style === "dotted") return `0.1 ${unit * 2}`
  return undefined
}

function polygon(w: number, h: number, points: Array<[number, number]>) {
  return (
    points
      .map(
        ([x, y], i) => `${i === 0 ? "M" : "L"}${round(x * w)} ${round(y * h)}`
      )
      .join(" ") + " Z"
  )
}

function regularPolygon(sides: number, w: number, h: number, rotate = -90) {
  return polygon(
    w,
    h,
    Array.from({ length: sides }, (_, i) => {
      const a = ((rotate + (360 / sides) * i) * Math.PI) / 180
      return [0.5 + Math.cos(a) / 2, 0.5 + Math.sin(a) / 2] as [number, number]
    })
  )
}

function star(points: number, inner: number, w: number, h: number) {
  return polygon(
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
}

function ellipse(cx: number, cy: number, rx: number, ry: number) {
  return `M${round(cx - rx)} ${round(cy)}A${round(rx)} ${round(ry)} 0 1 1 ${round(cx + rx)} ${round(cy)}A${round(rx)} ${round(ry)} 0 1 1 ${round(cx - rx)} ${round(cy)}Z`
}

function roundedRect(w: number, h: number, radius: number) {
  const r = Math.min(Math.max(radius, 0), w / 2, h / 2)
  return `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${r}A${r} ${r} 0 0 1 0 ${h - r}V${r}A${r} ${r} 0 0 1 ${r} 0Z`
}

export const SHAPES: ShapeDefinition[] = [
  {
    kind: "rectangle",
    label: "Rectangle",
    filled: true,
    path: (w, h, { cornerRadius }) => roundedRect(w, h, cornerRadius),
  },
  {
    kind: "ellipse",
    label: "Ellipse",
    filled: true,
    path: (w, h) => ellipse(w / 2, h / 2, w / 2, h / 2),
  },
  {
    kind: "triangle",
    label: "Triangle",
    filled: true,
    path: (w, h) =>
      polygon(w, h, [
        [0.5, 0],
        [1, 1],
        [0, 1],
      ]),
  },
  {
    kind: "right-triangle",
    label: "Right triangle",
    filled: true,
    path: (w, h) =>
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
    path: (w, h) =>
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
    path: (w, h) =>
      polygon(w, h, [
        [0.22, 0],
        [1, 0],
        [0.78, 1],
        [0, 1],
      ]),
  },
  {
    kind: "trapezoid",
    label: "Trapezoid",
    filled: true,
    path: (w, h) =>
      polygon(w, h, [
        [0.2, 0],
        [0.8, 0],
        [1, 1],
        [0, 1],
      ]),
  },
  {
    kind: "pentagon",
    label: "Pentagon",
    filled: true,
    path: (w, h) => regularPolygon(5, w, h),
  },
  {
    kind: "hexagon",
    label: "Hexagon",
    filled: true,
    path: (w, h) => regularPolygon(6, w, h, 0),
  },
  {
    kind: "octagon",
    label: "Octagon",
    filled: true,
    path: (w, h) => regularPolygon(8, w, h, -22.5),
  },
  {
    kind: "star",
    label: "Star",
    filled: true,
    path: (w, h) => star(5, 0.4, w, h),
  },
  {
    kind: "star-4",
    label: "Sparkle",
    filled: true,
    path: (w, h) => star(4, 0.3, w, h),
  },
  {
    kind: "plus",
    label: "Plus",
    filled: true,
    path: (w, h) =>
      polygon(w, h, [
        [0.33, 0],
        [0.67, 0],
        [0.67, 0.33],
        [1, 0.33],
        [1, 0.67],
        [0.67, 0.67],
        [0.67, 1],
        [0.33, 1],
        [0.33, 0.67],
        [0, 0.67],
        [0, 0.33],
        [0.33, 0.33],
      ]),
  },
  {
    kind: "check",
    label: "Check",
    filled: true,
    path: (w, h) =>
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
    kind: "heart",
    label: "Heart",
    filled: true,
    path: (w, h) =>
      `M${w / 2} ${h}C${-w * 0.1} ${h * 0.55} ${w * 0.08} ${-h * 0.04} ${w / 2} ${h * 0.28}C${w * 0.92} ${-h * 0.04} ${w * 1.1} ${h * 0.55} ${w / 2} ${h}Z`,
  },
  {
    kind: "cloud",
    label: "Cloud",
    filled: true,
    path: (w, h) =>
      `M${w * 0.24} ${h * 0.85}A${w * 0.2} ${h * 0.22} 0 0 1 ${w * 0.2} ${h * 0.45}A${w * 0.2} ${h * 0.3} 0 0 1 ${w * 0.5} ${h * 0.2}A${w * 0.22} ${h * 0.25} 0 0 1 ${w * 0.8} ${h * 0.42}A${w * 0.2} ${h * 0.22} 0 0 1 ${w * 0.76} ${h * 0.85}Z`,
  },
  {
    kind: "ring",
    label: "Ring",
    filled: true,
    fillRule: "evenodd",
    path: (w, h) =>
      ellipse(w / 2, h / 2, w / 2, h / 2) +
      ellipse(w / 2, h / 2, w * 0.3, h * 0.3),
  },
  {
    kind: "speech-bubble",
    label: "Speech bubble",
    filled: true,
    path: (w, h) => {
      const r = Math.min(w, h) * 0.12
      const b = h * 0.8
      return `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${b - r}Q${w} ${b} ${w - r} ${b}H${w * 0.45}L${w * 0.24} ${h}L${w * 0.28} ${b}H${r}Q0 ${b} 0 ${b - r}V${r}Q0 0 ${r} 0Z`
    },
  },
  {
    kind: "chevron",
    label: "Chevron",
    filled: true,
    path: (w, h) =>
      polygon(w, h, [
        [0, 0],
        [0.6, 0],
        [1, 0.5],
        [0.6, 1],
        [0, 1],
        [0.4, 0.5],
      ]),
  },
  {
    kind: "arrow",
    label: "Arrow",
    filled: true,
    path: (w, h) =>
      polygon(w, h, [
        [0, 0.3],
        [0.6, 0.3],
        [0.6, 0],
        [1, 0.5],
        [0.6, 1],
        [0.6, 0.7],
        [0, 0.7],
      ]),
  },
  {
    kind: "double-arrow",
    label: "Double arrow",
    filled: true,
    path: (w, h) =>
      polygon(w, h, [
        [0, 0.5],
        [0.25, 0],
        [0.25, 0.3],
        [0.75, 0.3],
        [0.75, 0],
        [1, 0.5],
        [0.75, 1],
        [0.75, 0.7],
        [0.25, 0.7],
        [0.25, 1],
      ]),
  },
  {
    kind: "line",
    label: "Line",
    filled: false,
    path: (w, h) => `M0 ${h / 2}H${w}`,
  },
]

export const SHAPES_BY_KIND = Object.fromEntries(
  SHAPES.map((shape) => [shape.kind, shape])
) as Record<ShapeKind, ShapeDefinition>

export const SHAPE_CATEGORIES: { label: string; kinds: ShapeKind[] }[] = [
  {
    label: "Basic",
    kinds: ["rectangle", "ellipse", "triangle", "right-triangle", "diamond"],
  },
  {
    label: "Polygons",
    kinds: ["parallelogram", "trapezoid", "pentagon", "hexagon", "octagon"],
  },
  {
    label: "Symbols",
    kinds: [
      "star",
      "star-4",
      "plus",
      "check",
      "heart",
      "cloud",
      "ring",
      "speech-bubble",
    ],
  },
  {
    label: "Arrows & lines",
    kinds: ["chevron", "arrow", "double-arrow", "line"],
  },
]
