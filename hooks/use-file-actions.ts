"use client"

import * as React from "react"

import { sectionToImageMarkup, svgToPng } from "@/lib/editor/export"
import { downloadBlob, pickFile, toFilename } from "@/lib/editor/files"
import { slidesToHtml, slideToHtml } from "@/lib/editor/html-export"
import { slidesToPdf } from "@/lib/editor/pdf"
import { PRESENTATION_EXTENSION } from "@/lib/editor/presentation"
import { parsePresentation } from "@/lib/editor/presentation-file"
import { renderSlides } from "@/lib/editor/render-slides"
import { externalizeAssets, inlineAssets } from "@/lib/storage/assets"
import { toast } from "@/components/ui/toast"
import {
  selectActiveIndex,
  useEditorStores,
} from "@/components/editor/editor-stores"
import { useStorage } from "@/components/storage-provider"

const fail = (title: string, error: unknown) =>
  toast.add({
    type: "error",
    title,
    description: error instanceof Error ? error.message : undefined,
  })

function useFileActions() {
  const { deck } = useEditorStores()
  const storage = useStorage()

  const inline = React.useCallback(
    (jsons: string[]) =>
      Promise.all(jsons.map((json) => inlineAssets(storage, json))),
    [storage]
  )

  const save = React.useCallback(async () => {
    try {
      const { title, getPresentation } = deck.getState()
      const presentation = getPresentation()
      const slides = await inline(
        presentation.slides.map((slide) => slide.json)
      )
      const blob = new Blob(
        [
          JSON.stringify({
            ...presentation,
            slides: slides.map((json) => ({ json })),
          }),
        ],
        { type: "application/json" }
      )
      downloadBlob(blob, `${toFilename(title)}${PRESENTATION_EXTENSION}`)
      toast.add({ type: "success", title: "Presentation saved to a file" })
    } catch (error) {
      fail("Could not save the file", error)
    }
  }, [deck, inline])

  const open = React.useCallback(async () => {
    const { presentationId, load } = deck.getState()
    const file = await pickFile(".json,application/json")
    if (!file) return
    try {
      const parsed = parsePresentation(await file.text())
      const slides = await Promise.all(
        parsed.slides.map((json) =>
          externalizeAssets(storage, json, { presentationId })
        )
      )
      load(parsed.title, slides)
      toast.add({ type: "success", title: `Opened “${parsed.title}”` })
    } catch (error) {
      fail("Could not open the file", error)
    }
  }, [deck, storage])

  const exportPng = React.useCallback(async () => {
    try {
      const state = deck.getState()
      const { title } = state
      const activeIndex = selectActiveIndex(state)
      const presentation = state.getPresentation()
      const [json] = await inline([presentation.slides[activeIndex].json])
      const [markup] = await renderSlides([json], sectionToImageMarkup)
      downloadBlob(
        await svgToPng(markup),
        `${toFilename(title)}-slide-${activeIndex + 1}.png`
      )
      toast.add({ type: "success", title: "Slide exported as PNG" })
    } catch (error) {
      fail("Export failed", error)
    }
  }, [deck, inline])

  const exportSlideHtml = React.useCallback(async () => {
    const state = deck.getState()
    const { title } = state
    const activeIndex = selectActiveIndex(state)
    const presentation = state.getPresentation()
    const slide = presentation.slides[activeIndex]
    if (!slide) return fail("Nothing to export", undefined)
    try {
      downloadBlob(
        await slideToHtml((await inline([slide.json]))[0], presentation.title),
        `${toFilename(title)}-slide-${activeIndex + 1}.html`
      )
      toast.add({ type: "success", title: "Slide exported as HTML" })
    } catch (error) {
      fail("Export failed", error)
    }
  }, [deck, inline])

  const exportPdf = React.useCallback(async () => {
    const { title, getPresentation } = deck.getState()
    const presentation = getPresentation()
    try {
      const blob = await slidesToPdf(
        await inline(presentation.slides.map((slide) => slide.json)),
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
  }, [deck, inline])

  const exportHtml = React.useCallback(async () => {
    const { title, getPresentation } = deck.getState()
    const presentation = getPresentation()
    try {
      const blob = await slidesToHtml(
        await inline(presentation.slides.map((slide) => slide.json)),
        presentation.title
      )
      downloadBlob(blob, `${toFilename(title)}.html`)
      const count = presentation.slides.length
      toast.add({
        type: "success",
        title: `Exported ${count} slide${count === 1 ? "" : "s"} as HTML`,
      })
    } catch (error) {
      fail("Export failed", error)
    }
  }, [deck, inline])

  return { save, open, exportPng, exportSlideHtml, exportPdf, exportHtml }
}

export { useFileActions }
