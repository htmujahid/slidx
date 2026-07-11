import { createFilterPrimitive } from "./create-filter-primitive"

export const FeComponentTransfer = createFilterPrimitive({
  tag: "feComponentTransfer",
  description: "Remap color channels per function",
  defaults: { in: "", result: "" },
  fields: [
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
  childTags: ["feFuncR", "feFuncG", "feFuncB", "feFuncA"],
})
