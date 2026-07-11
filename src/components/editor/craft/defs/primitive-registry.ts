import type { FilterPrimitiveComponent } from "./create-filter-primitive"
import { FeBlend } from "./fe-blend"
import { FeColorMatrix } from "./fe-color-matrix"
import { FeComponentTransfer } from "./fe-component-transfer"
import { FeComposite } from "./fe-composite"
import { FeConvolveMatrix } from "./fe-convolve-matrix"
import { FeDiffuseLighting } from "./fe-diffuse-lighting"
import { FeDisplacementMap } from "./fe-displacement-map"
import { FeDistantLight } from "./fe-distant-light"
import { FeDropShadow } from "./fe-drop-shadow"
import { FeFlood } from "./fe-flood"
import { FeFuncA } from "./fe-func-a"
import { FeFuncB } from "./fe-func-b"
import { FeFuncG } from "./fe-func-g"
import { FeFuncR } from "./fe-func-r"
import { FeGaussianBlur } from "./fe-gaussian-blur"
import { FeImage } from "./fe-image"
import { FeMerge } from "./fe-merge"
import { FeMergeNode } from "./fe-merge-node"
import { FeMorphology } from "./fe-morphology"
import { FeOffset } from "./fe-offset"
import { FePointLight } from "./fe-point-light"
import { FeSpecularLighting } from "./fe-specular-lighting"
import { FeSpotLight } from "./fe-spot-light"
import { FeTile } from "./fe-tile"
import { FeTurbulence } from "./fe-turbulence"

export const filterPrimitiveRegistry: FilterPrimitiveComponent[] = [
  FeGaussianBlur,
  FeDropShadow,
  FeOffset,
  FeFlood,
  FeBlend,
  FeColorMatrix,
  FeComposite,
  FeMorphology,
  FeTurbulence,
  FeDisplacementMap,
  FeConvolveMatrix,
  FeImage,
  FeTile,
  FeMerge,
  FeMergeNode,
  FeComponentTransfer,
  FeFuncR,
  FeFuncG,
  FeFuncB,
  FeFuncA,
  FeDiffuseLighting,
  FeSpecularLighting,
  FeDistantLight,
  FePointLight,
  FeSpotLight,
]
