import { GroupIcon } from "lucide-react"

import { isAnimationType } from "../animation-registry"
import { createShape, isShapeType } from "./create-shape"
import { round } from "./utils"

export const SvgGroup = createShape({
  tag: "g",
  kind: "group",
  icon: GroupIcon,
  defaults: { tx: 0, ty: 0, opacity: 1 },
  attrs: ({ tx, ty, ...rest }) => ({
    ...rest,
    transform: `translate(${tx} ${ty})`,
  }),
  move: (props, dx, dy) => {
    props.tx = round((props.tx as number) + dx)
    props.ty = round((props.ty as number) + dy)
  },
  placeAt: (props, x, y) => {
    props.tx = round(x)
    props.ty = round(y)
  },
  canMoveIn: (incoming) =>
    incoming.every(
      (node) => isShapeType(node.data.type) || isAnimationType(node.data.type)
    ),
  fields: [
    { type: "number", key: "tx", label: "X", half: true },
    { type: "number", key: "ty", label: "Y", half: true },
    { type: "slider", key: "opacity", label: "Opacity", max: 1, step: 0.01 },
  ],
})
