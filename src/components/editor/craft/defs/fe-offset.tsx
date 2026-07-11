import { createFilterPrimitive } from "./create-filter-primitive"

export const FeOffset = createFilterPrimitive({
  tag: "feOffset",
  description: "Shift the input image",
  defaults: { dx: 4, dy: 4, in: "", result: "" },
  fields: [
    { type: "number", key: "dx", label: "Offset X", half: true },
    { type: "number", key: "dy", label: "Offset Y", half: true },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
