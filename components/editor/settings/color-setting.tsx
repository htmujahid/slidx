"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerTrigger,
} from "@/components/reui/color-picker"

function ColorSetting({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = React.useId()
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <ColorPicker
        id={id}
        aria-label={label}
        value={value}
        onValueChange={(next) => {
          if (next) onChange(next)
        }}
      >
        <ColorPickerTrigger className="w-full" />
        <ColorPickerContent className="w-64" />
      </ColorPicker>
    </Field>
  )
}

export { ColorSetting }
