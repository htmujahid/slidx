import { createFilterPrimitive } from "./create-filter-primitive"

export const FeColorMatrix = createFilterPrimitive({
  tag: "feColorMatrix",
  description: "Transform colors with a matrix",
  defaults: { type: "saturate", values: "0", in: "", result: "" },
  fields: [
    {
      type: "select",
      key: "type",
      label: "Type",
      options: ["matrix", "saturate", "hueRotate", "luminanceToAlpha"],
    },
    { type: "text", key: "values", label: "Values", mono: true },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
