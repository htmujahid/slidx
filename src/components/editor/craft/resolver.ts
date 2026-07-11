import {
  SvgAnimate,
  SvgAnimateMotion,
  SvgAnimateTransform,
  SvgSet,
} from "./animations"
import { FeBlend } from "./defs/fe-blend"
import { FeColorMatrix } from "./defs/fe-color-matrix"
import { FeComponentTransfer } from "./defs/fe-component-transfer"
import { FeComposite } from "./defs/fe-composite"
import { FeConvolveMatrix } from "./defs/fe-convolve-matrix"
import { FeDiffuseLighting } from "./defs/fe-diffuse-lighting"
import { FeDisplacementMap } from "./defs/fe-displacement-map"
import { FeDistantLight } from "./defs/fe-distant-light"
import { FeDropShadow } from "./defs/fe-drop-shadow"
import { FeFlood } from "./defs/fe-flood"
import { FeFuncA } from "./defs/fe-func-a"
import { FeFuncB } from "./defs/fe-func-b"
import { FeFuncG } from "./defs/fe-func-g"
import { FeFuncR } from "./defs/fe-func-r"
import { FeGaussianBlur } from "./defs/fe-gaussian-blur"
import { FeImage } from "./defs/fe-image"
import { FeMerge } from "./defs/fe-merge"
import { FeMergeNode } from "./defs/fe-merge-node"
import { FeMorphology } from "./defs/fe-morphology"
import { FeOffset } from "./defs/fe-offset"
import { FePointLight } from "./defs/fe-point-light"
import { FeSpecularLighting } from "./defs/fe-specular-lighting"
import { FeSpotLight } from "./defs/fe-spot-light"
import { FeTile } from "./defs/fe-tile"
import { FeTurbulence } from "./defs/fe-turbulence"
import { SvgClipPath } from "./defs/svg-clip-path"
import { SvgDefs } from "./defs/svg-defs"
import { SvgFilter } from "./defs/svg-filter"
import { SvgLinearGradient } from "./defs/svg-linear-gradient"
import { SvgMarker } from "./defs/svg-marker"
import { SvgMask } from "./defs/svg-mask"
import { SvgPattern } from "./defs/svg-pattern"
import { SvgRadialGradient } from "./defs/svg-radial-gradient"
import {
  SvgCircle,
  SvgEllipse,
  SvgGroup,
  SvgImage,
  SvgLine,
  SvgPath,
  SvgPolygon,
  SvgPolyline,
  SvgRect,
  SvgText,
  SvgTextPath,
  SvgUse,
} from "./shapes"
import { SvgDocument } from "./svg-document"

export const editorResolver = {
  SvgDocument,
  SvgRect,
  SvgCircle,
  SvgEllipse,
  SvgLine,
  SvgPolyline,
  SvgPolygon,
  SvgPath,
  SvgText,
  SvgTextPath,
  SvgImage,
  SvgGroup,
  SvgUse,
  SvgAnimate,
  SvgAnimateTransform,
  SvgAnimateMotion,
  SvgSet,
  SvgDefs,
  SvgFilter,
  SvgLinearGradient,
  SvgRadialGradient,
  SvgClipPath,
  SvgMask,
  SvgPattern,
  SvgMarker,
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
}
