import { useEffect, useState } from "react"

import { dragSource } from "./svg-coords"

export function useShapeDragActive() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const onDragStart = () => setActive(dragSource.kind === "shape")
    const onDragEnd = () => setActive(false)
    document.addEventListener("dragstart", onDragStart)
    document.addEventListener("dragend", onDragEnd)
    document.addEventListener("drop", onDragEnd)
    return () => {
      document.removeEventListener("dragstart", onDragStart)
      document.removeEventListener("dragend", onDragEnd)
      document.removeEventListener("drop", onDragEnd)
    }
  }, [])

  return active
}
