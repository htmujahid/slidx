import { createContext, useContext, type RefObject } from "react"

export type TimelineContextValue = {
  pxPerSecond: number
  setPxPerSecond: (px: number) => void
  snap: boolean
  setSnap: (snap: boolean) => void
  snapSeconds: number
  rootRef: RefObject<HTMLDivElement | null>
}

export const TimelineContext = createContext<TimelineContextValue | null>(null)

export function useTimeline() {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error("useTimeline must be used within the Timeline")
  }
  return context
}
