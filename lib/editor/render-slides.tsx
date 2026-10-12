"use client"

import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { Editor, Frame } from "@craftjs/core"

import { resolver } from "@/lib/editor/resolver"
import { slideSizeFromJson } from "@/lib/editor/slide-size"
import { PlaybackProvider } from "@/components/editor/animation-playback"

const RENDER_SETTLE_MS = 300

/**
 * Renders each serialized slide off screen, in the live document so fonts and
 * styles apply, and maps each slide's `<section>` through `convert`.
 */
export async function renderSlides<T>(
  slides: string[],
  convert: (section: HTMLElement) => T | Promise<T>,
  { animate = false }: { animate?: boolean } = {}
) {
  const host = document.createElement("div")
  host.setAttribute("aria-hidden", "true")
  host.style.cssText =
    "position:fixed;left:0;top:0;z-index:-1;width:960px;opacity:0;pointer-events:none"
  document.body.append(host)
  const root = createRoot(host)
  try {
    flushSync(() =>
      root.render(
        <>
          {slides.map((json, index) => (
            <div
              key={index}
              data-render-slide=""
              style={{
                width: "100%",
                aspectRatio: (({ width, height }) => width / height)(
                  slideSizeFromJson(json)
                ),
              }}
            >
              <PlaybackProvider play={animate}>
                <Editor resolver={resolver} enabled={false}>
                  <Frame data={json} />
                </Editor>
              </PlaybackProvider>
            </div>
          ))}
        </>
      )
    )
    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, RENDER_SETTLE_MS))
    const sections = Array.from(
      host.querySelectorAll<HTMLElement>(
        "[data-render-slide] > section[data-slide-root]"
      )
    )
    if (sections.length !== slides.length) {
      throw new Error("Some slides could not be rendered.")
    }
    // Converted before the render is torn down, which happens after this returns.
    return await Promise.all(sections.map(convert))
  } finally {
    root.unmount()
    host.remove()
  }
}
