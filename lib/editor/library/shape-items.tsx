import { MoveDownRightIcon } from "lucide-react"

import { center } from "@/lib/editor/library/placement"
import type { LibraryItem } from "@/lib/editor/library/types"
import { SHAPE_CATEGORIES, SHAPES, type ShapeKind } from "@/lib/editor/shapes"
import { ArrowLine } from "@/components/editor/nodes/arrow-line"
import { Shape } from "@/components/editor/nodes/shape"
import { ShapePreview } from "@/components/editor/shape-preview"

const SHAPE_SIZES: Partial<Record<ShapeKind, [number, number]>> = {
  line: [400, 24],
  elbow: [360, 200],
  bracket: [80, 300],
  brace: [100, 300],
  parenthesis: [70, 300],
  "angle-bracket": [80, 300],
  cylinder: [240, 300],
  document: [320, 280],
  "predefined-process": [360, 200],
  callout: [380, 260],
  "thought-bubble": [400, 320],
  ribbon: [440, 180],
  zigzag: [400, 120],
  pill: [360, 120],
  semicircle: [360, 180],
  lightning: [220, 320],
  frame: [380, 280],
  arrow: [400, 200],
  "double-arrow": [400, 200],
  chevron: [300, 240],
  parallelogram: [360, 240],
  trapezoid: [360, 240],
  "speech-bubble": [380, 300],
  cloud: [400, 260],
}

export const shapeItems: LibraryItem[] = SHAPES.map((shape) => {
  const [width, height] = SHAPE_SIZES[shape.kind] ?? [300, 300]
  return {
    id: `shape:${shape.kind}`,
    group: "shape",
    label: shape.label,
    section: SHAPE_CATEGORIES.find((category) =>
      category.kinds.includes(shape.kind)
    )?.label,
    icon: ({ className }) => (
      <ShapePreview kind={shape.kind} className={className} />
    ),
    create: (at) => (
      <Shape
        kind={shape.kind}
        width={width}
        height={height}
        {...center(at, width, height)}
        {...(shape.filled ? {} : { fill: "#0a0a0a", strokeWidth: 6 })}
      />
    ),
  }
})

export const arrowLineItems: LibraryItem[] = [
  {
    id: "shape:arrow-line",
    group: "shape",
    label: "Diagonal arrow",
    section: "Arrows & lines",
    icon: MoveDownRightIcon,
    create: (at) => <ArrowLine {...center(at, 400, 200)} />,
  },
]
