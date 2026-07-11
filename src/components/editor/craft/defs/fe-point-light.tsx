import { createFilterPrimitive } from "./create-filter-primitive"

export const FePointLight = createFilterPrimitive({
  tag: "fePointLight",
  description: "Point light source",
  defaults: { x: 50, y: 50, z: 100 },
  fields: [
    { type: "number", key: "x", label: "X", half: true },
    { type: "number", key: "y", label: "Y", half: true },
    { type: "number", key: "z", label: "Z" },
  ],
  parentTags: ["feDiffuseLighting", "feSpecularLighting"],
})
