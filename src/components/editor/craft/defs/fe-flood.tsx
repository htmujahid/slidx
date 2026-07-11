import { createFilterPrimitive } from "./create-filter-primitive"

export const FeFlood = createFilterPrimitive({
  tag: "feFlood",
  description: "Fill the region with a color",
  defaults: { floodColor: "#8B5CF6", floodOpacity: 1, result: "" },
  fields: [
    { type: "color", key: "floodColor", label: "Color" },
    { type: "slider", key: "floodOpacity", label: "Opacity", max: 1, step: 0.01 },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
