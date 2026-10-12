import * as React from "react"

import type { ShapeGeometry } from "@/lib/editor/shapes"

type GeometryProps = Omit<React.SVGProps<SVGElement>, "ref">

/** Draws a shape as its native SVG element; the props style it. */
function ShapeGeometryElement({
  geometry,
  ...props
}: GeometryProps & { geometry: ShapeGeometry }) {
  switch (geometry.tag) {
    case "rect":
      return (
        <rect
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          rx={geometry.rx || undefined}
          {...props}
        />
      )
    case "circle":
      return (
        <circle cx={geometry.cx} cy={geometry.cy} r={geometry.r} {...props} />
      )
    case "ellipse":
      return (
        <ellipse
          cx={geometry.cx}
          cy={geometry.cy}
          rx={geometry.rx}
          ry={geometry.ry}
          {...props}
        />
      )
    case "line":
      return (
        <line
          x1={geometry.x1}
          y1={geometry.y1}
          x2={geometry.x2}
          y2={geometry.y2}
          {...props}
        />
      )
    case "polygon":
      return <polygon points={geometry.points} {...props} />
    case "polyline":
      return <polyline points={geometry.points} {...props} />
    case "path":
      return (
        <>
          <path
            d={geometry.d}
            fillRule={geometry.fillRule}
            clipRule={geometry.fillRule}
            {...props}
          />
          {geometry.shade ? (
            <path
              d={geometry.shade}
              fill="#000"
              fillOpacity={0.14}
              stroke="none"
              pointerEvents="none"
            />
          ) : null}
        </>
      )
  }
}

export { ShapeGeometryElement }
