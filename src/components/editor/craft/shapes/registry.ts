import type { ShapeComponent } from "./create-shape"
import { SvgCircle } from "./svg-circle"
import { SvgEllipse } from "./svg-ellipse"
import { SvgGroup } from "./svg-group"
import { SvgImage } from "./svg-image"
import { SvgLine } from "./svg-line"
import { SvgPath } from "./svg-path"
import { SvgPolygon } from "./svg-polygon"
import { SvgPolyline } from "./svg-polyline"
import { SvgRect } from "./svg-rect"
import { SvgText } from "./svg-text"
import { SvgTextPath } from "./svg-text-path"
import { SvgUse } from "./svg-use"

export const shapeRegistry: ShapeComponent[] = [
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
]
