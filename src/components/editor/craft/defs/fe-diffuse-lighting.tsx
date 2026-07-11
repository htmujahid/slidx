import { createFilterPrimitive } from "./create-filter-primitive"

export const FeDiffuseLighting = createFilterPrimitive({
  tag: "feDiffuseLighting",
  description: "Light the input as a diffuse surface",
  defaults: {
    surfaceScale: 1,
    diffuseConstant: 1,
    lightingColor: "#FFFFFF",
    in: "",
    result: "",
  },
  fields: [
    { type: "number", key: "surfaceScale", label: "Surface scale", half: true },
    { type: "number", key: "diffuseConstant", label: "Diffuse constant", half: true },
    { type: "color", key: "lightingColor", label: "Light color" },
    { type: "text", key: "in", label: "Input (optional)", mono: true },
    { type: "text", key: "result", label: "Result name (optional)", mono: true },
  ],
  childTags: ["feDistantLight", "fePointLight", "feSpotLight"],
})
