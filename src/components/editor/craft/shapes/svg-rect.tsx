import { SquareIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { paintFields } from "./fields"
import { round } from "./utils"

export const SvgRect = createShape({
  tag: "rect",
  kind: "shape",
  icon: SquareIcon,
  defaults: {
    x: 40,
    y: 40,
    width: 120,
    height: 80,
    rx: 0,
    fill: "#8B5CF6",
    stroke: "none",
    strokeWidth: 0,
    opacity: 1,
  },
  move: (props, dx, dy) => {
    props.x = round((props.x as number) + dx)
    props.y = round((props.y as number) + dy)
  },
  placeAt: (props, x, y) => {
    props.x = round(x - (props.width as number) / 2)
    props.y = round(y - (props.height as number) / 2)
  },
  fields: [
    { type: "number", key: "x", label: "X", half: true },
    { type: "number", key: "y", label: "Y", half: true },
    { type: "number", key: "width", label: "Width", min: 1, half: true },
    { type: "number", key: "height", label: "Height", min: 1, half: true },
    { type: "slider", key: "rx", label: "Corner radius", max: 60 },
    ...paintFields,
  ],
})
