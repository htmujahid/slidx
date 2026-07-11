import { createFilterPrimitive } from "./create-filter-primitive"

export const FeBlend = createFilterPrimitive({
  tag: "feBlend",
  description: "Blend two inputs together",
  defaults: { mode: "normal", in: "", in2: "" },
  fields: [
    {
      type: "select",
      key: "mode",
      label: "Mode",
      options: ["normal", "multiply", "screen", "overlay", "darken", "lighten"],
    },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "in2", label: "Input 2 (optional)", mono: true },
  ],
})
