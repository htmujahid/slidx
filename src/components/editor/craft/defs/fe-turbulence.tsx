import { createFilterPrimitive } from "./create-filter-primitive"

export const FeTurbulence = createFilterPrimitive({
  tag: "feTurbulence",
  description: "Generate Perlin noise",
  defaults: {
    type: "turbulence",
    baseFrequency: "0.05",
    numOctaves: 2,
    seed: 0,
    result: "",
  },
  fields: [
    {
      type: "select",
      key: "type",
      label: "Type",
      options: ["turbulence", "fractalNoise"],
    },
    { type: "text", key: "baseFrequency", label: "Base frequency", mono: true },
    { type: "number", key: "numOctaves", label: "Octaves", min: 1, half: true },
    { type: "number", key: "seed", label: "Seed", half: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
})
