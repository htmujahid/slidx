import { WaypointsIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { strokeFields } from "./fields"
import { polyMove, polyPlaceAt } from "./utils"

export const SvgPolyline = createShape({
  tag: "polyline",
  kind: "shape",
  icon: WaypointsIcon,
  defaults: {
    points: "0,40 30,0 60,40 90,0 120,40",
    fill: "none",
    stroke: "#F59E0B",
    strokeWidth: 4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    opacity: 1,
  },
  move: polyMove,
  placeAt: polyPlaceAt,
  fields: [
    { type: "text", key: "points", label: "Points", mono: true },
    ...strokeFields,
  ],
})
