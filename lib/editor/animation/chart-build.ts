import {
  DRAW_STROKE_FRAMES,
  FADE_LATE_FRAMES,
  WIPE_FRAMES,
} from "@/lib/editor/animation/frames"
import type { ChartMeta } from "@/lib/editor/animation/timeline"

type ChartPiece = {
  selector: string
  declarations?: string
  animation?: string
}

export function chartBuildCss(
  scope: string,
  buildId: string,
  selector: string,
  meta: ChartMeta,
  timing: {
    duration: number
    easing: string
    start: number
    fill: "backwards" | "none"
  }
) {
  const { duration, easing, start, fill } = timing
  const keyframes = new Map<string, string>()
  const pieces: ChartPiece[] = []
  const run = (name: string, ms: number, delay: number) =>
    `${name} ${ms}ms ${easing} ${delay}ms 1 ${fill}`
  const key = (name: string, body: string) => {
    const full = `vx-${scope}-${name}`
    keyframes.set(full, body)
    return full
  }
  const late = () => key("fade-late", FADE_LATE_FRAMES)

  if (meta.kind === "bar" || meta.kind === "bar-horizontal") {
    const horizontal = meta.kind === "bar-horizontal"
    const count = Math.max(1, meta.categories)
    const barMs = count > 1 ? duration / 2 : duration
    const step = count > 1 ? (duration - barMs) / (count - 1) : 0
    const percent = (ms: number) => +((ms / duration) * 100).toFixed(4)
    const origin = horizontal ? "0% 50%" : "50% 100%"
    const axis = horizontal ? "X" : "Y"
    pieces.push(
      {
        selector: `${selector} .recharts-bar-rectangle`,
        declarations: `transform-box:fill-box;transform-origin:${origin}`,
      },
      {
        selector: `${selector} .recharts-label-list`,
        animation: run(late(), duration, start),
      }
    )
    for (let index = 0; index < count; index++) {
      const from = percent(index * step)
      const to = percent(index * step + barMs)
      const grow = key(
        `${buildId}-grow-${index}`,
        `0%${from > 0 ? `,${from}%` : ""}{transform:scale${axis}(0);animation-timing-function:${easing}}${to}%,100%{transform:scale${axis}(1)}`
      )
      pieces.push({
        selector: `${selector} .recharts-bar-rectangle:nth-child(${index + 1})`,
        animation: `${grow} ${duration}ms linear ${start}ms 1 ${fill}`,
      })
    }
  } else if (meta.kind === "line") {
    const draw = key("draw-stroke", DRAW_STROKE_FRAMES)
    pieces.push(
      {
        selector: `${selector} .recharts-line-curve`,
        animation: run(draw, duration, start),
      },
      {
        selector: `${selector} :is(.recharts-line-dots,.recharts-label-list)`,
        animation: run(late(), duration, start),
      }
    )
  } else if (meta.kind === "area") {
    const wipe = key("wipe-in", WIPE_FRAMES)
    pieces.push(
      {
        selector: `${selector} .recharts-area`,
        animation: run(wipe, duration, start),
      },
      {
        selector: `${selector} .recharts-label-list`,
        animation: run(late(), duration, start),
      }
    )
  } else if (meta.kind === "pie") {
    const sweep = key("sweep", "from{--vx-sweep:0deg}to{--vx-sweep:360deg}")
    pieces.push({
      selector: `${selector} .recharts-surface`,
      declarations:
        "mask-image:conic-gradient(from 0deg at 50% 50%,#000 var(--vx-sweep),transparent var(--vx-sweep))",
      animation: run(sweep, duration, start),
    })
  } else {
    const open = key(
      "radar-open",
      "from{opacity:0;transform:scale(0)}to{opacity:1;transform:none}"
    )
    pieces.push({
      selector: `${selector} .recharts-radar`,
      declarations: "transform-box:view-box;transform-origin:50% 50%",
      animation: run(open, duration, start),
    })
  }

  return { pieces, keyframes }
}
