import { EllipseIcon } from "../../elements/ellipse-icon"
import { createShape } from "./create-shape"
import { paintFields } from "./fields"
import { round } from "./utils"

export const SvgEllipse = createShape({
  tag: "ellipse",
  kind: "shape",
  icon: EllipseIcon,
  defaults: {
    cx: 100,
    cy: 100,
    rx: 60,
    ry: 35,
    fill: "#34D399",
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
    { type: "number", key: "rx", label: "Radius X", min: 1, half: true },
    { type: "number", key: "ry", label: "Radius Y", min: 1, half: true },
    ...paintFields,
  ],
})
