"use client"

import * as React from "react"

import type { AlignmentGuide } from "@/lib/editor/alignment-guides"
import type { GridSnap, Point } from "@/lib/editor/geometry"

type SlideContextValue = {
  scale: number
  setGuides: (guides: AlignmentGuide[]) => void
  grid: GridSnap
  snapToAlignment: boolean
  toSlidePoint: (clientX: number, clientY: number) => Point
  /** Element id -> class that plays its animation; empty when not playing. */
  animationClasses: Record<string, string>
}

const SlideContext = React.createContext<SlideContextValue | null>(null)

function useSlide() {
  const context = React.useContext(SlideContext)
  if (!context) {
    throw new Error("useSlide must be used within a <Slide>.")
  }
  return context
}

export { SlideContext, useSlide }
export type { SlideContextValue }
