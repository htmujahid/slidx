"use client"

import * as React from "react"

import { slideToSvg, svgToBlob, svgToPng } from "@/lib/editor/export"
import { downloadBlob, pickFile, toFilename } from "@/lib/editor/files"
import { slidesToPdf } from "@/lib/editor/pdf"
import {
  parsePresentation,
  PRESENTATION_EXTENSION,
} from "@/lib/editor/presentation"
import { toast } from "@/components/ui/toast"
import { useSlides } from "@/components/editor/slides-context"

const fail = (title: string, error: unknown) =>
  toast.add({
    type: "error",
    title,
    description: error instanceof Error ? error.message : undefined,
  })

function useFileActions() {
  const { title, activeIndex, getPresentation, loadPresentation } = useSlides()

  const save = React.useCallback(() => {
    const blob = new Blob([JSON.stringify(getPresentation())], {
      type: "application/json",
    })
    downloadBlob(blob, `${toFilename(title)}${PRESENTATION_EXTENSION}`)
    toast.add({ type: "success", title: "Presentation saved to a file" })
  }, [getPresentation, title])

  const open = React.useCallback(async () => {
    const file = await pickFile(".json,application/json")
    if (!file) return
    try {
      const parsed = parsePresentation(await file.text())
      loadPresentation(parsed.title, parsed.slides)
      toast.add({ type: "success", title: `Opened “${parsed.title}”` })
    } catch (error) {
      fail("Could not open the file", error)
    }
  }, [loadPresentation])

  const exportSlide = React.useCallback(
    async (format: "svg" | "png") => {
      const markup = slideToSvg()
      if (!markup) return fail("Nothing to export", undefined)
      const name = `${toFilename(title)}-slide-${activeIndex + 1}`
      try {
        if (format === "svg") {
          downloadBlob(svgToBlob(markup), `${name}.svg`)
        } else {
          downloadBlob(await svgToPng(markup), `${name}.png`)
        }
        toast.add({
          type: "success",
          title: `Slide exported as ${format.toUpperCase()}`,
        })
      } catch (error) {
        fail("Export failed", error)
      }
    },
    [title, activeIndex]
  )

  const exportPdf = React.useCallback(async () => {
    const presentation = getPresentation()
    try {
      const blob = await slidesToPdf(
        presentation.slides.map((slide) => slide.json),
        presentation.title
      )
      downloadBlob(blob, `${toFilename(title)}.pdf`)
      const count = presentation.slides.length
      toast.add({
        type: "success",
        title: `Exported ${count} slide${count === 1 ? "" : "s"} as PDF`,
      })
    } catch (error) {
      fail("Export failed", error)
    }
  }, [getPresentation, title])

  return { save, open, exportSlide, exportPdf }
}

export { useFileActions }
