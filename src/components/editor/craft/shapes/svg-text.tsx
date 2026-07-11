import { TypeIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { paintFields } from "./fields"
import { round } from "./utils"

export const SvgText = createShape({
  tag: "text",
  kind: "text",
  icon: TypeIcon,
  defaults: {
    x: 100,
    y: 100,
    text: "Text",
    fontSize: 24,
    fontFamily: "Inter Variable, sans-serif",
    fontWeight: 600,
    textAnchor: "middle",
    fill: "#0F172A",
    stroke: "none",
    strokeWidth: 0,
    opacity: 1,
  },
  attrs: (props) => {
    const attrs = { ...props }
    delete attrs.text
    return attrs
  },
  content: (props) => props.text as string,
  move: (props, dx, dy) => {
    props.x = round((props.x as number) + dx)
    props.y = round((props.y as number) + dy)
  },
  placeAt: (props, x, y) => {
    props.x = round(x)
    props.y = round(y)
  },
  fields: [
    { type: "text", key: "text", label: "Text" },
    { type: "number", key: "x", label: "X", half: true },
    { type: "number", key: "y", label: "Y", half: true },
    { type: "slider", key: "fontSize", label: "Font size", min: 6, max: 120, unit: "px" },
    { type: "select", key: "fontWeight", label: "Weight", options: ["400", "500", "600", "700", "800"] },
    { type: "select", key: "textAnchor", label: "Anchor", options: ["start", "middle", "end"] },
    ...paintFields,
  ],
})
