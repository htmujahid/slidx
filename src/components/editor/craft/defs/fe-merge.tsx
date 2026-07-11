import { createFilterPrimitive } from "./create-filter-primitive"

export const FeMerge = createFilterPrimitive({
  tag: "feMerge",
  description: "Stack results on top of each other",
  defaults: {},
  fields: [],
  childTags: ["feMergeNode"],
})
