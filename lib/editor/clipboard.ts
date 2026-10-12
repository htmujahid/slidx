import type * as React from "react"

import { DUPLICATE_OFFSET } from "@/lib/editor/constants"

export type CopiedElement = {
  type: React.ElementType
  props: Record<string, unknown>
}

let elements: CopiedElement[] = []
let pastes = 0

const clone = ({ type, props }: CopiedElement): CopiedElement => ({
  type,
  props: structuredClone(props),
})

export function writeElements(next: CopiedElement[]) {
  if (next.length === 0) return false
  elements = next.map(clone)
  pastes = 0
  return true
}

export function readElements() {
  if (elements.length === 0) return null
  pastes += 1
  return { elements: elements.map(clone), offset: pastes * DUPLICATE_OFFSET }
}
