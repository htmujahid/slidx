import type { ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"
import { isShapeType } from "../shapes"

export const SvgMask: UserComponent<{
  name?: string
  children?: ReactNode
}> = ({ children }) => {
  const { id } = useNode()
  return <mask id={`fx-${id}`}>{children}</mask>
}

SvgMask.craft = {
  displayName: "mask",
  props: { name: "mask" },
  rules: {
    canMoveIn: (incoming: Node[]) =>
      incoming.every((node) => isShapeType(node.data.type)),
    canDrag: () => false,
  },
  related: {
    settings: () => (
      <PropFields fields={[{ type: "text", key: "name", label: "Name" }]} />
    ),
  },
}
