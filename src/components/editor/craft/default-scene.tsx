import { Element } from "@craftjs/core"

import { canvasDefaults } from "../data"
import {
  SvgAnimate,
  SvgAnimateTransform,
  SvgSet,
} from "./animations"
import { SvgDefs } from "./defs/svg-defs"
import { SvgCircle, SvgImage, SvgPath, SvgRect, SvgText } from "./shapes"
import { SvgDocument } from "./svg-document"

export const defaultScene = (
  <Element canvas is={SvgDocument} {...canvasDefaults}>
    <Element canvas is={SvgDefs} />
    <Element
      canvas
      is={SvgRect}
      custom={{ name: "background", locked: true }}
      x={0}
      y={0}
      width={400}
      height={400}
      rx={0}
      fill="#EEF2FF"
      stroke="none"
      strokeWidth={0}
      opacity={1}
    >
      <SvgAnimate
        attributeName="fill"
        values="#EEF2FF;#FCE7F3;#EEF2FF"
        from=""
        to=""
        begin={0}
        dur={30}
        repeatCount="indefinite"
        fill="remove"
      />
    </Element>
    <Element
      canvas
      is={SvgPath}
      custom={{ name: "logo" }}
      tx={153}
      ty={80}
      fill="none"
      stroke="#6366F1"
      strokeWidth={3}
      strokeDasharray="420"
      strokeDashoffset={420}
      opacity={1}
    >
      <SvgAnimate
        attributeName="stroke-dashoffset"
        from="420"
        to="0"
        begin={2}
        dur={6}
        repeatCount={1}
        fill="freeze"
      />
      <SvgSet attributeName="stroke" to="#8B5CF6" begin={8} dur={22} fill="freeze" />
    </Element>
    <Element
      canvas
      is={SvgCircle}
      custom={{ name: "pulse" }}
      cx={90}
      cy={90}
      r={36}
      fill="#8B5CF6"
      stroke="none"
      strokeWidth={0}
      opacity={1}
    >
      <SvgAnimate
        attributeName="r"
        values="36;44;36"
        from=""
        to=""
        begin={5}
        dur={2}
        repeatCount="indefinite"
        fill="remove"
      />
      <SvgAnimate
        attributeName="opacity"
        from="0"
        to="1"
        begin={4}
        dur={1}
        repeatCount={1}
        fill="freeze"
      />
    </Element>
    <Element
      canvas
      is={SvgImage}
      custom={{ name: "hero" }}
      x={250}
      y={40}
      width={110}
      height={82}
      opacity={0}
    >
      <SvgAnimate
        attributeName="opacity"
        from="0"
        to="1"
        begin={10}
        dur={2}
        repeatCount={1}
        fill="freeze"
      />
      <SvgAnimateTransform
        type="translate"
        values="0 0; 0 -8; 0 0"
        from=""
        to=""
        begin={12}
        dur={4}
        repeatCount="indefinite"
        fill="remove"
      />
    </Element>
    <Element
      canvas
      is={SvgText}
      custom={{ name: "headline" }}
      x={200}
      y={320}
      text="Hello SVG"
      fontSize={30}
      opacity={0}
    >
      <SvgAnimate
        attributeName="y"
        from="335"
        to="320"
        begin={3}
        dur={1}
        repeatCount={1}
        fill="freeze"
      />
      <SvgAnimate
        attributeName="opacity"
        from="0"
        to="1"
        begin={3}
        dur={1}
        repeatCount={1}
        fill="freeze"
      />
    </Element>
  </Element>
)
