import { createFilterPrimitive } from "./create-filter-primitive"

export const FeDropShadow = createFilterPrimitive({
  tag: "feDropShadow",
  description: "Offset shadow behind the input",
  defaults: {
    dx: 2,
    dy: 4,
    stdDeviation: 3,
    floodColor: "#0F172A",
    floodOpacity: 0.4,
  },
  fields: [
    { type: "number", key: "dx", label: "Offset X", half: true },
    { type: "number", key: "dy", label: "Offset Y", half: true },
    { type: "slider", key: "stdDeviation", label: "Blur", max: 40, step: 0.5, unit: "px" },
    { type: "color", key: "floodColor", label: "Color" },
    { type: "slider", key: "floodOpacity", label: "Opacity", max: 1, step: 0.01 },
  ],
})
