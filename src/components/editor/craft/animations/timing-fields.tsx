import { useNode } from "@craftjs/core"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { PropFields } from "../prop-fields"
import type { TimingProps } from "./timing"

export function TimingFields() {
  const {
    actions: { setProp },
    repeatCount,
  } = useNode((node) => ({
    repeatCount: node.data.props.repeatCount as TimingProps["repeatCount"],
  }))
  const indefinite = repeatCount === "indefinite"

  return (
    <FieldGroup>
      <PropFields
        fields={[
          { type: "number", key: "begin", label: "Start", addon: "s", min: 0, half: true },
          { type: "number", key: "dur", label: "Duration", addon: "s", min: 0.1, half: true },
        ]}
      />
      <Field orientation="horizontal">
        <FieldLabel htmlFor="repeat-forever">Repeat forever</FieldLabel>
        <Switch
          id="repeat-forever"
          checked={indefinite}
          onCheckedChange={(checked) =>
            setProp((props: TimingProps) => {
              props.repeatCount = checked ? "indefinite" : 1
            })
          }
        />
      </Field>
      {indefinite ? null : (
        <PropFields
          fields={[
            { type: "number", key: "repeatCount", label: "Repeat count", min: 1 },
          ]}
        />
      )}
      <PropFields
        fields={[
          { type: "select", key: "fill", label: "After end", options: ["freeze", "remove"] },
        ]}
      />
    </FieldGroup>
  )
}
