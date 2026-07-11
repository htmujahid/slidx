import { createFilterPrimitive } from "./create-filter-primitive"

export const FeSpotLight = createFilterPrimitive({
  tag: "feSpotLight",
  description: "Spot light source",
  defaults: {
    x: 50,
    y: 50,
    z: 100,
    pointsAtX: 200,
    pointsAtY: 200,
    pointsAtZ: 0,
    specularExponent: 1,
    limitingConeAngle: 30,
  },
  fields: [
    { type: "number", key: "x", label: "X", half: true },
    { type: "number", key: "y", label: "Y", half: true },
    { type: "number", key: "z", label: "Z", half: true },
    { type: "number", key: "pointsAtX", label: "Points at X", half: true },
    { type: "number", key: "pointsAtY", label: "Points at Y", half: true },
    { type: "number", key: "pointsAtZ", label: "Points at Z", half: true },
    { type: "number", key: "specularExponent", label: "Focus", half: true },
    { type: "number", key: "limitingConeAngle", label: "Cone angle", half: true },
  ],
  parentTags: ["feDiffuseLighting", "feSpecularLighting"],
})
