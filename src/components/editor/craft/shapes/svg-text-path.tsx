import { RouteIcon } from "lucide-react"

import { createShape } from "./create-shape"

export const SvgTextPath = createShape({
  tag: "textPath",
  renderTag: "text",
  kind: "text",
  icon: RouteIcon,
  defaults: {
    href: "",
    text: "Text on a path",
    startOffset: "0%",
    fontSize: 18,
    fontFamily: "Inter Variable, sans-serif",
    fontWeight: 600,
    fill: "#0F172A",
    opacity: 1,
  },
  attrs: ({ href, text, startOffset, ...rest }) => {
    void href
    void text
    void startOffset
    return rest
  },
  content: (props) => (
    <textPath href={String(props.href ?? "")} startOffset={String(props.startOffset ?? "0%")}>
      {String(props.text ?? "")}
    </textPath>
  ),
  move: () => {},
  placeAt: () => {},
  fields: [
    { type: "text", key: "href", label: "Path (#el-…)", mono: true },
    { type: "text", key: "text", label: "Text" },
    { type: "text", key: "startOffset", label: "Start offset", mono: true },
    { type: "slider", key: "fontSize", label: "Font size", min: 6, max: 120, unit: "px" },
    { type: "select", key: "fontWeight", label: "Weight", options: ["400", "500", "600", "700", "800"] },
    { type: "color", key: "fill", label: "Fill" },
    { type: "slider", key: "opacity", label: "Opacity", max: 1, step: 0.01 },
  ],
})
