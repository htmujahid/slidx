import { useCallback } from "react"
import { useEditor, useNode } from "@craftjs/core"

import { clientToSvgPoint } from "./svg-coords"

const MOVE_THRESHOLD_PX = 3
const HISTORY_THROTTLE_MS = 300

export function useShapeMove<P>(
  move: (props: P, dx: number, dy: number) => void
) {
  const {
    actions: { setProp },
    locked,
  } = useNode((node) => ({ locked: !!node.data.custom?.locked }))
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }))

  return useCallback(
    (event: React.PointerEvent<SVGElement>) => {
      if (event.button !== 0 || locked || !enabled) return
      const svg = (event.currentTarget as SVGGraphicsElement).ownerSVGElement
      if (!svg) return

      const startClient = { x: event.clientX, y: event.clientY }
      let last = clientToSvgPoint(svg, event.clientX, event.clientY)
      let moved = false

      const handleMove = (e: PointerEvent) => {
        if (
          !moved &&
          Math.hypot(e.clientX - startClient.x, e.clientY - startClient.y) <
            MOVE_THRESHOLD_PX
        ) {
          return
        }
        moved = true
        const point = clientToSvgPoint(svg, e.clientX, e.clientY)
        const dx = point.x - last.x
        const dy = point.y - last.y
        last = point
        setProp((props: P) => move(props, dx, dy), HISTORY_THROTTLE_MS)
      }

      const handleUp = () => {
        window.removeEventListener("pointermove", handleMove)
      }

      window.addEventListener("pointermove", handleMove)
      window.addEventListener("pointerup", handleUp, { once: true })
    },
    [locked, enabled, setProp, move]
  )
}
