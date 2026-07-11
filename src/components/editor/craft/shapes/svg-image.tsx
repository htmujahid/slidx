import { ImageIcon } from "lucide-react"

import { createShape } from "./create-shape"
import { round } from "./utils"

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect width="120" height="90" fill="#C7D2FE"/><circle cx="38" cy="30" r="12" fill="#818CF8"/><path d="M0 90 L45 46 L74 72 L94 56 L120 76 V90 Z" fill="#6366F1"/></svg>`
  )

export const SvgImage = createShape({
  tag: "image",
  kind: "image",
  icon: ImageIcon,
  defaults: {
    href: PLACEHOLDER_IMAGE,
    x: 40,
    y: 40,
    width: 120,
    height: 90,
    preserveAspectRatio: "xMidYMid slice",
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
    { type: "text", key: "href", label: "Image URL", mono: true },
    { type: "number", key: "x", label: "X", half: true },
    { type: "number", key: "y", label: "Y", half: true },
    { type: "number", key: "width", label: "Width", min: 1, half: true },
    { type: "number", key: "height", label: "Height", min: 1, half: true },
    { type: "slider", key: "opacity", label: "Opacity", max: 1, step: 0.01 },
  ],
})
