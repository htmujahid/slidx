import { createStore } from "zustand/vanilla"

export type PreviewMode = "off" | "play" | "scrub"

export type PreviewState = {
  mode: PreviewMode
  run: number
  time: number
  startedAt: number
  play: (durationMs: number) => void
  scrub: (ms: number) => void
  stop: () => void
}

export function createPreviewStore() {
  let timer: ReturnType<typeof setTimeout> | undefined

  return createStore<PreviewState>()((set) => ({
    mode: "off",
    run: 0,
    time: 0,
    startedAt: 0,
    play: (durationMs) => {
      clearTimeout(timer)
      set(({ run }) => ({
        mode: "play",
        run: run + 1,
        time: 0,
        startedAt: performance.now(),
      }))
      timer = setTimeout(() => set({ mode: "off" }), durationMs)
    },
    scrub: (ms) => {
      clearTimeout(timer)
      set({ mode: "scrub", time: ms })
    },
    stop: () => {
      clearTimeout(timer)
      set((state) => (state.mode === "off" ? state : { mode: "off" }))
    },
  }))
}
