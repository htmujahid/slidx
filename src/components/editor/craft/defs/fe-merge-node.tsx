import { createFilterPrimitive } from "./create-filter-primitive"

export const FeMergeNode = createFilterPrimitive({
  tag: "feMergeNode",
  description: "One layer in a merge",
  defaults: { in: "SourceGraphic" },
  fields: [{ type: "text", key: "in", label: "Input", mono: true }],
  parentTags: ["feMerge"],
})
