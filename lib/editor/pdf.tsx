"use client"

import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { Editor, Frame } from "@craftjs/core"
import { PDFDocument } from "pdf-lib"

import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import { svgToMarkup, svgToPng } from "@/lib/editor/export"
import { resolver } from "@/lib/editor/resolver"

const PDF_SCALE = 2
const PAGE_WIDTH = SLIDE_WIDTH / 2
const PAGE_HEIGHT = SLIDE_HEIGHT / 2
const RENDER_SETTLE_MS = 300

async function renderSlidesToSvg(slides: string[]) {
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
            <div key={index} data-pdf-slide="">
              <Editor resolver={resolver} enabled={false}>
                <Frame data={json} />
              </Editor>
            </div>
          ))}
        </>
      )
    )
    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, RENDER_SETTLE_MS))
    const svgs = Array.from(
      host.querySelectorAll<SVGSVGElement>("[data-pdf-slide] > svg")
    )
    if (svgs.length !== slides.length) {
      throw new Error("Some slides could not be rendered.")
    }
    return svgs.map(svgToMarkup)
  } finally {
    root.unmount()
    host.remove()
  }
}

export async function slidesToPdf(slides: string[], title: string) {
  const markups = await renderSlidesToSvg(slides)
  const doc = await PDFDocument.create()
  doc.setTitle(title)
  for (const markup of markups) {
    const png = await svgToPng(markup, PDF_SCALE)
    const image = await doc.embedPng(await png.arrayBuffer())
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
    })
  }
  const bytes = await doc.save()
  return new Blob([bytes as BlobPart], { type: "application/pdf" })
}
