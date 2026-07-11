import type { ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"
import { isShapeType } from "../shapes"

type MarkerProps = {
  name: string
  markerWidth: number
  markerHeight: number
  refX: number
  refY: number
  orient: string
  children?: ReactNode
}

export const SvgMarker: UserComponent<Partial<MarkerProps>> = ({
  markerWidth,
  markerHeight,
  refX,
  refY,
  orient,
  children,
}) => {
  const { id } = useNode()
  return (
    <marker
      id={`fx-${id}`}
      markerWidth={markerWidth}
      markerHeight={markerHeight}
      refX={refX}
      refY={refY}
      orient={orient}
      markerUnits="strokeWidth"
    >
      {children}
    </marker>
  )
}

SvgMarker.craft = {
  displayName: "marker",
  props: {
    name: "marker",
    markerWidth: 10,
    markerHeight: 10,
    refX: 8,
    refY: 5,
    orient: "auto",
  },
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
          { type: "number", key: "markerWidth", label: "Width", min: 1, half: true },
          { type: "number", key: "markerHeight", label: "Height", min: 1, half: true },
          { type: "number", key: "refX", label: "Ref X", half: true },
          { type: "number", key: "refY", label: "Ref Y", half: true },
          {
            type: "select",
            key: "orient",
            label: "Orient",
            options: ["auto", "auto-start-reverse", "0", "90", "180", "270"],
          },
        ]}
      />
    ),
  },
}
