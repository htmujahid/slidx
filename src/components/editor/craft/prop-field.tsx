import { useNode } from "@craftjs/core"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { FieldDef } from "./field-def"
import { formatNumber } from "./format-number"
import { NumberInput } from "./number-input"

const HISTORY_THROTTLE_MS = 300

export function PropField({ field }: { field: FieldDef }) {
  const {
    actions: { setProp },
    value,
  } = useNode((node) => ({
    value: node.data.props[field.key],
  }))

  const set = (next: unknown, throttle?: number) =>
    setProp((props: Record<string, unknown>) => {
      props[field.key] = next
    }, throttle)

  const id = `prop-${field.key}`

  switch (field.type) {
    case "number":
      return (
        <Field>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <NumberInput
            id={id}
            addon={field.addon}
            value={typeof value === "number" ? value : 0}
            min={field.min}
            max={field.max}
            onCommit={(next) => set(next, HISTORY_THROTTLE_MS)}
          />
        </Field>
      )
    case "text":
      return (
        <Field>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id={id}
              value={String(value ?? "")}
              onChange={(event) => set(event.target.value, HISTORY_THROTTLE_MS)}
              className={cn(field.mono && "font-mono")}
            />
          </InputGroup>
        </Field>
      )
    case "color":
      return (
        <Field>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <label
                className="relative size-4 cursor-pointer overflow-hidden rounded-sm border"
                style={{ backgroundColor: String(value ?? "transparent") }}
              >
                <input
                  type="color"
                  aria-label={`${field.label} color picker`}
                  value={toHexColor(String(value ?? ""))}
                  onChange={(event) =>
                    set(event.target.value, HISTORY_THROTTLE_MS)
                  }
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </InputGroupAddon>
            <InputGroupInput
              id={id}
              value={String(value ?? "")}
              onChange={(event) => set(event.target.value, HISTORY_THROTTLE_MS)}
              className="font-mono"
            />
          </InputGroup>
        </Field>
      )
    case "slider": {
      const current = typeof value === "number" ? value : (field.min ?? 0)
      return (
        <Field>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <div className="flex items-center gap-3">
            <Slider
              id={id}
              value={current}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              onValueChange={(next) =>
                set(Array.isArray(next) ? next[0] : next, HISTORY_THROTTLE_MS)
              }
            />
            <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
              {formatNumber(current)}
              {field.unit}
            </span>
          </div>
        </Field>
      )
    }
    case "select":
      return (
        <Field>
          <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
          <Select
            value={String(value ?? field.options[0])}
            onValueChange={(next) => set(next)}
            items={Object.fromEntries(field.options.map((o) => [o, o]))}
          >
            <SelectTrigger id={id} className="font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      )
  }
}

function toHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"
}
