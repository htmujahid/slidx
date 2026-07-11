import { createFilterPrimitive } from "./create-filter-primitive"

export const FeDisplacementMap = createFilterPrimitive({
  tag: "feDisplacementMap",
  description: "Distort input using a displacement map",
  defaults: {
    scale: 20,
    xChannelSelector: "A",
    yChannelSelector: "A",
    in: "",
    in2: "",
    result: "",
  },
  fields: [
    { type: "number", key: "scale", label: "Scale" },
    {
      type: "select",
      key: "xChannelSelector",
      label: "X channel",
      options: ["R", "G", "B", "A"],
    },
    {
      type: "select",
      key: "yChannelSelector",
      label: "Y channel",
      options: ["R", "G", "B", "A"],
    },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "in2", label: "Map input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
