import { SplineIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { paintFields } from "./fields"
import { round } from "./utils"

export const SvgPath = createShape({
  tag: "path",
  kind: "path",
  icon: SplineIcon,
  defaults: {
    d: "M0,32 C0,10 18,-6 38,2 C44,-14 68,-12 72,4 C88,0 100,14 94,30 C110,38 104,60 86,60 L10,60 C-4,60 -8,42 0,32 Z",
    tx: 60,
    ty: 60,
    fill: "none",
    stroke: "#6366F1",
    strokeWidth: 3,
    strokeDasharray: "",
    strokeDashoffset: 0,
    opacity: 1,
  },
  attrs: ({ tx, ty, strokeDasharray, ...rest }) => ({
    ...rest,
    strokeDasharray: strokeDasharray || undefined,
    transform: `translate(${tx} ${ty})`,
  }),
  move: (props, dx, dy) => {
    props.tx = round((props.tx as number) + dx)
    props.ty = round((props.ty as number) + dy)
  },
  placeAt: (props, x, y) => {
    props.tx = round(x - 48)
    props.ty = round(y - 30)
  },
  fields: [
    { type: "text", key: "d", label: "Path data", mono: true },
    { type: "number", key: "tx", label: "X", half: true },
    { type: "number", key: "ty", label: "Y", half: true },
    { type: "text", key: "strokeDasharray", label: "Dash array", mono: true },
    { type: "number", key: "strokeDashoffset", label: "Dash offset" },
    ...paintFields,
  ],
})
