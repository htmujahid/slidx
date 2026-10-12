"use client"

import { PDFDocument } from "pdf-lib"

import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/editor/constants"
import { svgToMarkup, svgToPng } from "@/lib/editor/export"
import { renderSlides } from "@/lib/editor/render-slides"

const PDF_SCALE = 2
const PAGE_WIDTH = SLIDE_WIDTH / 2
const PAGE_HEIGHT = SLIDE_HEIGHT / 2

export async function slidesToPdf(slides: string[], title: string) {
  const markups = await renderSlides(slides, svgToMarkup)
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
