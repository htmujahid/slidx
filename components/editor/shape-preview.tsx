import { SHAPES_BY_KIND, type ShapeKind } from "@/lib/editor/shapes"

function ShapePreview({
  kind,
  className,
}: {
  kind: ShapeKind
  className?: string
}) {
  const definition = SHAPES_BY_KIND[kind]
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
      <path
        d={definition.path(24, 24, { cornerRadius: 3 })}
        fillRule={definition.fillRule}
      />
    </svg>
  )
}

export { ShapePreview }
