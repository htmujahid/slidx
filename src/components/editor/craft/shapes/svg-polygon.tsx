import { WaypointsIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { paintFields } from "./fields"
import { polyMove, polyPlaceAt } from "./utils"

export const SvgPolygon = createShape({
  tag: "polygon",
  kind: "shape",
  icon: WaypointsIcon,
  defaults: {
    points: "0,-45 13,-14 45,-14 19,7 29,38 0,19 -29,38 -19,7 -45,-14 -13,-14",
    fill: "#FBBF24",
    stroke: "none",
    strokeWidth: 0,
    strokeLinejoin: "round",
    opacity: 1,
  },
  move: polyMove,
  placeAt: polyPlaceAt,
  fields: [
    { type: "text", key: "points", label: "Points", mono: true },
    ...paintFields,
  ],
})
