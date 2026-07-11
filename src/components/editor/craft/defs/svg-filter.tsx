import type { ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"
import { isFilterPrimitiveType } from "./create-filter-primitive"

type FilterProps = {
  name: string
  x: string
  y: string
  width: string
  height: string
  children?: ReactNode
}

export const SvgFilter: UserComponent<Partial<FilterProps>> = ({
  x,
  y,
  width,
  height,
  children,
}) => {
  const { id } = useNode()
  return (
    <filter id={`fx-${id}`} x={x} y={y} width={width} height={height}>
      {children}
    </filter>
  )
}

SvgFilter.craft = {
  displayName: "filter",
  props: {
    name: "filter",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "140%",
  },
  rules: {
    canMoveIn: (incoming: Node[]) =>
      incoming.every((node) => isFilterPrimitiveType(node.data.type)),
    canDrag: () => false,
  },
  related: {
    settings: () => (
      <PropFields
        fields={[
          { type: "text", key: "name", label: "Name" },
          { type: "text", key: "x", label: "Region X", mono: true },
          { type: "text", key: "y", label: "Region Y", mono: true },
          { type: "text", key: "width", label: "Region width", mono: true },
          { type: "text", key: "height", label: "Region height", mono: true },
        ]}
      />
    ),
  },
}
