import type { ReactNode } from "react"
import type { Node, UserComponent } from "@craftjs/core"

import { SvgClipPath } from "./svg-clip-path"
import { SvgFilter } from "./svg-filter"
import { SvgLinearGradient } from "./svg-linear-gradient"
import { SvgMarker } from "./svg-marker"
import { SvgMask } from "./svg-mask"
import { SvgPattern } from "./svg-pattern"
import { SvgRadialGradient } from "./svg-radial-gradient"

const definitionTypes: unknown[] = [
  SvgFilter,
  SvgLinearGradient,
  SvgRadialGradient,
  SvgClipPath,
  SvgMask,
  SvgPattern,
  SvgMarker,
]

export const SvgDefs: UserComponent<{ children?: ReactNode }> = ({
  children,
}) => {
  return <defs>{children}</defs>
}

SvgDefs.craft = {
  displayName: "defs",
  props: {},
  rules: {
    canMoveIn: (incoming: Node[]) =>
      incoming.every((node) => definitionTypes.includes(node.data.type)),
    canDrag: () => false,
  },
}
