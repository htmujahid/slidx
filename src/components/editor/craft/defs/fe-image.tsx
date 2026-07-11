import { createFilterPrimitive } from "./create-filter-primitive"

export const FeImage = createFilterPrimitive({
  tag: "feImage",
  description: "Use an external image as input",
  defaults: {
    href: "",
    preserveAspectRatio: "xMidYMid meet",
    result: "",
  },
  fields: [
    { type: "text", key: "href", label: "Image URL", mono: true },
    {
      type: "select",
      key: "preserveAspectRatio",
      label: "Preserve aspect ratio",
      options: ["xMidYMid meet", "xMidYMid slice", "none"],
    },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
