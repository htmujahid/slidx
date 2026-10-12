import { ROOT_NODE } from "@craftjs/core"

import { resolver } from "@/lib/editor/resolver"

export const DEFAULT_TITLE = "Untitled presentation"
export const PRESENTATION_VERSION = 1
export const PRESENTATION_EXTENSION = ".visx.json"

export type PresentationFile = {
  app: "visx"
  version: number
  title: string
  slides: { json: string }[]
}

export type ParsedPresentation = { title: string; slides: string[] }

const KNOWN_NODES = new Set(Object.keys(resolver))

export function parsePresentation(text: string): ParsedPresentation {
  let data: Partial<PresentationFile>
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("This file is not valid JSON.")
  }
  if (
    data?.app !== "visx" ||
    !Array.isArray(data.slides) ||
    !data.slides.length
  ) {
    throw new Error("This is not a Visx presentation file.")
  }
  if ((data.version ?? 0) > PRESENTATION_VERSION) {
    throw new Error("This file was saved by a newer version of Visx.")
  }

  const slides = data.slides.map(({ json }, index) => {
    let nodes: Record<string, { type?: { resolvedName?: string } }>
    try {
      nodes = JSON.parse(json)
    } catch {
      throw new Error(`Slide ${index + 1} is corrupted.`)
    }
    const valid =
      nodes?.[ROOT_NODE]?.type?.resolvedName === "Slide" &&
      Object.values(nodes).every(
        (node) =>
          typeof node?.type?.resolvedName === "string" &&
          KNOWN_NODES.has(node.type.resolvedName)
      )
    if (!valid) throw new Error(`Slide ${index + 1} is corrupted.`)
    return json
  })

  return {
    title:
      typeof data.title === "string" && data.title.trim()
        ? data.title.trim()
        : DEFAULT_TITLE,
    slides,
  }
}
