import type { UIMessage } from "ai"

export type Reference = {
  id: string
  label: string
  slideId: string
  elementId?: string
}

export type AssistantMessage = UIMessage<{ context: string }>

export type AssistantMode = "ask" | "edit"

export const PROPOSE_EDITS = "proposeEdits"
