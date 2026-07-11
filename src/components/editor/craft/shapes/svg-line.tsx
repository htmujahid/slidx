import { MinusIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { strokeFields } from "./fields"
import { round } from "./utils"

export const SvgLine = createShape({
  tag: "line",
  kind: "shape",
  icon: MinusIcon,
  defaults: {
    x1: 40,
    y1: 100,
    x2: 160,
    y2: 100,
    stroke: "#0F172A",
    strokeWidth: 4,
    strokeLinecap: "round",
    opacity: 1,
  },
  move: (props, dx, dy) => {
    props.x1 = round((props.x1 as number) + dx)
    props.y1 = round((props.y1 as number) + dy)
    props.x2 = round((props.x2 as number) + dx)
    props.y2 = round((props.y2 as number) + dy)
  },
  placeAt: (props, x, y) => {
    const halfLength =
      Math.abs((props.x2 as number) - (props.x1 as number)) / 2 || 60
    props.x1 = round(x - halfLength)
    props.x2 = round(x + halfLength)
    props.y1 = round(y)
    props.y2 = round(y)
  },
  fields: [
    { type: "number", key: "x1", label: "X1", half: true },
    { type: "number", key: "y1", label: "Y1", half: true },
    { type: "number", key: "x2", label: "X2", half: true },
    { type: "number", key: "y2", label: "Y2", half: true },
    ...strokeFields,
  ],
})
