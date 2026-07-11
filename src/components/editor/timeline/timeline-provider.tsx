import { useMemo, useRef, useState, type ReactNode } from "react"

import {
  DEFAULT_PX_PER_SECOND,
  FINE_SNAP_SECONDS,
  SNAP_SECONDS,
} from "./constants"
import { TimelineContext } from "./timeline-context"

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [pxPerSecond, setPxPerSecond] = useState(DEFAULT_PX_PER_SECOND)
  const [snap, setSnap] = useState(true)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const value = useMemo(
    () => ({
      pxPerSecond,
      setPxPerSecond,
      snap,
      setSnap,
      snapSeconds: snap ? SNAP_SECONDS : FINE_SNAP_SECONDS,
      rootRef,
    }),
    [pxPerSecond, snap]
  )

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  )
}
