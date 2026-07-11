import { createFilterPrimitive } from "./create-filter-primitive"

export const FeComposite = createFilterPrimitive({
  tag: "feComposite",
  description: "Combine two inputs with an operator",
  defaults: { operator: "over", in: "", in2: "" },
  fields: [
    {
      type: "select",
      key: "operator",
      label: "Operator",
      options: ["over", "in", "out", "atop", "xor", "arithmetic"],
    },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "in2", label: "Input 2 (optional)", mono: true },
  ],
})
