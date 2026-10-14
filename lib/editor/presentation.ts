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
