import { useNode, type UserComponent } from "@craftjs/core"

import { PropFields } from "../prop-fields"

type LinearGradientProps = {
  name: string
  from: string
  to: string
  x1: string
  y1: string
  x2: string
  y2: string
}

export const SvgLinearGradient: UserComponent<Partial<LinearGradientProps>> = ({
  from,
  to,
  x1,
  y1,
  x2,
  y2,
}) => {
  const { id } = useNode()
  return (
    <linearGradient id={`fx-${id}`} x1={x1} y1={y1} x2={x2} y2={y2}>
      <stop offset="0%" stopColor={from} />
      <stop offset="100%" stopColor={to} />
    </linearGradient>
  )
}

SvgLinearGradient.craft = {
  displayName: "linearGradient",
  props: {
    name: "linear gradient",
    from: "#8B5CF6",
    to: "#F472B6",
    x1: "0%",
    y1: "0%",
    x2: "100%",
    y2: "0%",
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
          { type: "color", key: "from", label: "From" },
          { type: "color", key: "to", label: "To" },
          { type: "text", key: "x1", label: "X1", mono: true },
          { type: "text", key: "y1", label: "Y1", mono: true },
          { type: "text", key: "x2", label: "X2", mono: true },
          { type: "text", key: "y2", label: "Y2", mono: true },
        ]}
      />
    ),
  },
}
