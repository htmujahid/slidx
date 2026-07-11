import { createFilterPrimitive } from "./create-filter-primitive"

export function createFeFunc(channel: "R" | "G" | "B" | "A") {
  return createFilterPrimitive({
    tag: `feFunc${channel}`,
    description: `Transfer function for the ${channel} channel`,
    defaults: {
      type: "linear",
      slope: 1,
      intercept: 0,
      amplitude: 1,
      exponent: 1,
      offset: 0,
      tableValues: "",
    },
    fields: [
      {
        type: "select",
        key: "type",
        label: "Type",
        options: ["identity", "table", "discrete", "linear", "gamma"],
      },
      { type: "number", key: "slope", label: "Slope", half: true },
      { type: "number", key: "intercept", label: "Intercept", half: true },
      { type: "number", key: "amplitude", label: "Amplitude", half: true },
      { type: "number", key: "exponent", label: "Exponent", half: true },
      { type: "number", key: "offset", label: "Offset" },
      { type: "text", key: "tableValues", label: "Table values", mono: true },
    ],
    parentTags: ["feComponentTransfer"],
  })
}
