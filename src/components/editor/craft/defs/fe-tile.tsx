import { createFilterPrimitive } from "./create-filter-primitive"

export const FeTile = createFilterPrimitive({
  tag: "feTile",
  description: "Tile the input across the region",
  defaults: { in: "", result: "" },
  fields: [
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
