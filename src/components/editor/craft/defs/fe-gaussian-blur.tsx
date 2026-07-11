import { createFilterPrimitive } from "./create-filter-primitive"

export const FeGaussianBlur = createFilterPrimitive({
  tag: "feGaussianBlur",
  description: "Blur the input image",
  defaults: { stdDeviation: 4, in: "", result: "" },
  fields: [
    { type: "slider", key: "stdDeviation", label: "Amount", max: 40, step: 0.5, unit: "px" },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
