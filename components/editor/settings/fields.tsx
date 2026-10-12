"use client"

import * as React from "react"

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Slider } from "@/components/ui/slider"

function SettingsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <AccordionItem value={title} className="-mx-1">
      <AccordionTrigger className="px-1">{title}</AccordionTrigger>
      <AccordionContent className="px-1 pt-1 pb-4">
        <FieldSet className="gap-3">
          <FieldLegend className="sr-only" variant="label">
            {title}
          </FieldLegend>
          <FieldGroup className="gap-3">{children}</FieldGroup>
        </FieldSet>
      </AccordionContent>
    </AccordionItem>
  )
}

function SettingsRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>
}

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

const HEX = /^#[0-9a-f]{6}$/i

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
      <FieldLabel htmlFor={`${id}-text`}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <input
            id={id}
            type="color"
            aria-label={`${label} picker`}
            value={HEX.test(value) ? value : "#000000"}
            onChange={(event) => onChange(event.target.value)}
            className="size-5 cursor-pointer rounded-sm border-0 bg-transparent p-0"
          />
        </InputGroupAddon>
        <InputGroupInput
          id={`${id}-text`}
          value={value}
          spellCheck={false}
          className="font-mono uppercase"
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </Field>
  )
}

function SliderSetting({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => `${v}`,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  format?: (value: number) => string
}) {
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-xs text-muted-foreground tabular-nums">
          {format(value)}
        </span>
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(Array.isArray(next) ? next[0] : next)}
      />
    </Field>
  )
}

export {
  ColorSetting,
  NumberSetting,
  SettingsRow,
  SettingsSection,
  SliderSetting,
}
