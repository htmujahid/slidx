"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

function NumberSetting({
  label,
  prefix,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
}: {
  label: string
  prefix?: React.ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}) {
  const id = React.useId()
  return (
    <Field data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id} className={prefix ? "sr-only" : undefined}>
        {label}
      </FieldLabel>
      <InputGroup>
        {prefix ? (
          <InputGroupAddon>
            <InputGroupText>{prefix}</InputGroupText>
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.valueAsNumber
            if (Number.isNaN(next)) return
            onChange(next)
          }}
        />
      </InputGroup>
    </Field>
  )
}

export { NumberSetting }
