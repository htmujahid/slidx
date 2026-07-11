import { createFilterPrimitive } from "./create-filter-primitive"

export const FeSpecularLighting = createFilterPrimitive({
  tag: "feSpecularLighting",
  description: "Light the input as a shiny surface",
  defaults: {
    surfaceScale: 1,
    specularConstant: 1,
    specularExponent: 20,
    lightingColor: "#FFFFFF",
    in: "",
    result: "",
  },
  fields: [
    { type: "number", key: "surfaceScale", label: "Surface scale", half: true },
    { type: "number", key: "specularConstant", label: "Specular constant", half: true },
    { type: "number", key: "specularExponent", label: "Specular exponent" },
    { type: "color", key: "lightingColor", label: "Light color" },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
  childTags: ["feDistantLight", "fePointLight", "feSpotLight"],
})
