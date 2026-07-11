import { CopyIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { round } from "./utils"

export const SvgUse = createShape({
  tag: "use",
  kind: "shape",
  icon: CopyIcon,
  defaults: {
    href: "",
    x: 20,
    y: 20,
    opacity: 1,
  },
  move: (props, dx, dy) => {
    props.x = round((props.x as number) + dx)
    props.y = round((props.y as number) + dy)
  },
  placeAt: (props, x, y) => {
    props.x = round(x)
    props.y = round(y)
  },
  canMoveIn: () => false,
  fields: [
    { type: "text", key: "href", label: "Target (#el-…)", mono: true },
    { type: "number", key: "x", label: "Offset X", half: true },
    { type: "number", key: "y", label: "Offset Y", half: true },
    { type: "slider", key: "opacity", label: "Opacity", max: 1, step: 0.01 },
  ],
})
