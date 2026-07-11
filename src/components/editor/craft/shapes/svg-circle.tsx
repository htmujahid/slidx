import { CircleIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { paintFields } from "./fields"
import { round } from "./utils"

export const SvgCircle = createShape({
  tag: "circle",
  kind: "shape",
  icon: CircleIcon,
  defaults: {
    cx: 100,
    cy: 100,
    r: 40,
    fill: "#F472B6",
    stroke: "none",
    strokeWidth: 0,
    opacity: 1,
  },
  move: (props, dx, dy) => {
    props.cx = round((props.cx as number) + dx)
    props.cy = round((props.cy as number) + dy)
  },
  placeAt: (props, x, y) => {
    props.cx = round(x)
    props.cy = round(y)
  },
  fields: [
    { type: "number", key: "cx", label: "Center X", half: true },
    { type: "number", key: "cy", label: "Center Y", half: true },
    { type: "number", key: "r", label: "Radius", min: 1 },
    ...paintFields,
  ],
})
