import {
  resolveShapeParams,
  SHAPES_BY_KIND,
  type ShapeKind,
} from "@/lib/editor/shapes"
import { ShapeGeometryElement } from "@/components/editor/shape-geometry"

const PREVIEW_SIZES: Partial<Record<ShapeKind, [number, number]>> = {
  rectangle: [24, 16],
  ellipse: [24, 15],
  pill: [24, 12],
  semicircle: [24, 13],
  elbow: [24, 18],
  zigzag: [24, 14],
  bracket: [10, 24],
  brace: [12, 24],
  parenthesis: [8, 24],
  "angle-bracket": [10, 24],
  document: [20, 24],
  ribbon: [24, 20],
  callout: [24, 22],
}

function ShapePreview({
  kind,
  className,
}: {
  kind: ShapeKind
  className?: string
}) {
  const definition = SHAPES_BY_KIND[kind]
  const [width, height] = PREVIEW_SIZES[kind] ?? [24, 24]
  return (
    <svg
      viewBox="-1 -1 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <g transform={`translate(${(24 - width) / 2} ${(24 - height) / 2})`}>
        <ShapeGeometryElement
          geometry={definition.geometry(
            width,
            height,
            resolveShapeParams(definition)
          )}
        />
      </g>
    </svg>
  )
}

export { ShapePreview }
