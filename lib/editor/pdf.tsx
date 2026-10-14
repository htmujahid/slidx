"use client"

import { PDFDocument } from "pdf-lib"

import { markupSize, sectionToImageMarkup, svgToPng } from "@/lib/editor/export"
import { renderSlides } from "@/lib/editor/render-slides"

const PDF_SCALE = 2
const PAGE_SCALE = 0.5

export async function slidesToPdf(slides: string[], title: string) {
  const markups = await renderSlides(slides, sectionToImageMarkup)
  const doc = await PDFDocument.create()
  doc.setTitle(title)
  for (const markup of markups) {
    const png = await svgToPng(markup, PDF_SCALE)
    const image = await doc.embedPng(await png.arrayBuffer())
    const size = markupSize(markup)
    const pageWidth = size.width * PAGE_SCALE
    const pageHeight = size.height * PAGE_SCALE
    const page = doc.addPage([pageWidth, pageHeight])
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    })
  }
  const bytes = await doc.save()
  return new Blob([bytes as BlobPart], { type: "application/pdf" })
}
