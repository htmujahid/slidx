import { useState } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { formatNumber } from "./format-number"

export function NumberInput({
  id,
  value,
  addon,
  min,
  max,
  onCommit,
}: {
  id?: string
  value: number
  addon?: string
  min?: number
  max?: number
  onCommit: (value: number) => void
}) {
  const [text, setText] = useState(formatNumber(value))
  const [focused, setFocused] = useState(false)

  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    if (!focused) setText(formatNumber(value))
  }

  const handleChange = (raw: string) => {
    setText(raw)
    const parsed = Number(raw)
    if (raw.trim() === "" || Number.isNaN(parsed)) return
    onCommit(clamp(parsed, min, max))
  }

  return (
    <InputGroup>
      {addon ? <InputGroupAddon>{addon}</InputGroupAddon> : null}
      <InputGroupInput
        id={id}
        inputMode="decimal"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          setText(formatNumber(value))
        }}
        className="font-mono tabular-nums"
      />
    </InputGroup>
  )
}

function clamp(value: number, min?: number, max?: number) {
  if (min !== undefined && value < min) return min
  if (max !== undefined && value > max) return max
  return value
}
