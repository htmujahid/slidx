import type { ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"
import { isShapeType } from "../shapes"

type PatternProps = {
  name: string
  x: number
  y: number
  width: number
  height: number
  children?: ReactNode
}

export const SvgPattern: UserComponent<Partial<PatternProps>> = ({
  x,
  y,
  width,
  height,
  children,
}) => {
  const { id } = useNode()
  return (
    <pattern
      id={`fx-${id}`}
      x={x}
      y={y}
      width={width}
      height={height}
      patternUnits="userSpaceOnUse"
    >
      {children}
    </pattern>
  )
}

SvgPattern.craft = {
  displayName: "pattern",
  props: { name: "pattern", x: 0, y: 0, width: 20, height: 20 },
  rules: {
    canMoveIn: (incoming: Node[]) =>
      incoming.every((node) => isShapeType(node.data.type)),
    canDrag: () => false,
  },
  related: {
    settings: () => (
      <PropFields
        fields={[
          { type: "text", key: "name", label: "Name" },
          { type: "number", key: "x", label: "Tile X", half: true },
          { type: "number", key: "y", label: "Tile Y", half: true },
          { type: "number", key: "width", label: "Tile width", min: 1, half: true },
          { type: "number", key: "height", label: "Tile height", min: 1, half: true },
        ]}
      />
    ),
  },
}
