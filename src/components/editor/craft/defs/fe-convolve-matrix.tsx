import { createFilterPrimitive } from "./create-filter-primitive"

export const FeConvolveMatrix = createFilterPrimitive({
  tag: "feConvolveMatrix",
  description: "Convolve pixels with a kernel matrix",
  defaults: {
    order: "3",
    kernelMatrix: "0 -1 0 -1 5 -1 0 -1 0",
    edgeMode: "duplicate",
    preserveAlpha: "false",
    in: "",
    result: "",
  },
  fields: [
    { type: "text", key: "order", label: "Order", mono: true },
    { type: "text", key: "kernelMatrix", label: "Kernel matrix", mono: true },
    {
      type: "select",
      key: "edgeMode",
      label: "Edge mode",
      options: ["duplicate", "wrap", "none"],
    },
    {
      type: "select",
      key: "preserveAlpha",
      label: "Preserve alpha",
      options: ["false", "true"],
    },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
