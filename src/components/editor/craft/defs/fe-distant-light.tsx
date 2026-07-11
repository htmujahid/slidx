import { createFilterPrimitive } from "./create-filter-primitive"

export const FeDistantLight = createFilterPrimitive({
  tag: "feDistantLight",
  description: "Distant light source",
  defaults: { azimuth: 45, elevation: 45 },
  fields: [
    { type: "number", key: "azimuth", label: "Azimuth", half: true },
    { type: "number", key: "elevation", label: "Elevation", half: true },
  ],
  parentTags: ["feDiffuseLighting", "feSpecularLighting"],
})
