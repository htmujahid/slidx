import { useNode, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"

type RadialGradientProps = {
  name: string
  from: string
  to: string
  cx: string
  cy: string
  r: string
}

export const SvgRadialGradient: UserComponent<Partial<RadialGradientProps>> = ({
  from,
  to,
  cx,
  cy,
  r,
}) => {
  const { id } = useNode()
  return (
    <radialGradient id={`fx-${id}`} cx={cx} cy={cy} r={r}>
      <stop offset="0%" stopColor={from} />
      <stop offset="100%" stopColor={to} />
    </radialGradient>
  )
}

SvgRadialGradient.craft = {
  displayName: "radialGradient",
  props: {
    name: "radial gradient",
    from: "#8B5CF6",
    to: "#F472B6",
    cx: "50%",
    cy: "50%",
    r: "50%",
  },
  rules: {
    canMoveIn: () => false,
    canDrag: () => false,
  },
  related: {
    settings: () => (
      <PropFields
        fields={[
          { type: "text", key: "name", label: "Name" },
          { type: "color", key: "from", label: "Center" },
          { type: "color", key: "to", label: "Edge" },
          { type: "text", key: "cx", label: "Center X", mono: true },
          { type: "text", key: "cy", label: "Center Y", mono: true },
          { type: "text", key: "r", label: "Radius", mono: true },
        ]}
      />
    ),
  },
}
