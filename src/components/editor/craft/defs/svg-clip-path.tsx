import type { ReactNode } from "react"
import { useNode, type Node, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"
import { isShapeType } from "../shapes"

export const SvgClipPath: UserComponent<{
  name?: string
  children?: ReactNode
}> = ({ children }) => {
  const { id } = useNode()
  return <clipPath id={`fx-${id}`}>{children}</clipPath>
}

SvgClipPath.craft = {
  displayName: "clipPath",
  props: { name: "clip" },
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
