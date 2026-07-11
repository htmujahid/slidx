import { createFilterPrimitive } from "./create-filter-primitive"

export const FeMorphology = createFilterPrimitive({
  tag: "feMorphology",
  description: "Thin or thicken the input",
  defaults: { operator: "dilate", radius: 2, in: "", result: "" },
  fields: [
    {
      type: "select",
      key: "operator",
      label: "Operator",
      options: ["erode", "dilate"],
    },
    { type: "number", key: "radius", label: "Radius", min: 0 },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
