"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

function ImageFitSetting({
  value,
  onChange,
}: {
  value: "cover" | "contain"
  onChange: (value: "cover" | "contain") => void
}) {
  return (
    <Field>
      <FieldLabel>Fit</FieldLabel>
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Image fit"
        value={[value]}
        onValueChange={([fit]) => {
          if (fit) onChange(fit as "cover" | "contain")
        }}
      >
        <ToggleGroupItem value="cover">Cover</ToggleGroupItem>
        <ToggleGroupItem value="contain">Contain</ToggleGroupItem>
      </ToggleGroup>
    </Field>
  )
}

export { ImageFitSetting }
