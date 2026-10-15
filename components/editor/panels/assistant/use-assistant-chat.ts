import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart } from "ai"

import { describeDeck } from "@/lib/ai/deck-context"
import { proposeEditsSchema } from "@/lib/ai/edit-schema"
import { useDeckActions } from "@/components/editor/deck-actions-provider"
import { useEditorStores } from "@/components/editor/editor-stores"
import {
  PROPOSE_EDITS,
  type AssistantMessage,
  type AssistantMode,
  type Reference,
} from "@/components/editor/panels/assistant/types"

const transport = new DefaultChatTransport({ api: "/api/chat" })

export function useAssistantChat({
  mode,
  references,
}: {
  mode: AssistantMode
  references: Reference[]
}) {
  const { deck } = useEditorStores()
  const deckActions = useDeckActions()
  const chat = useChat<AssistantMessage>({ transport })
  const { messages, sendMessage, addToolOutput, status } = chat

  // Sent with every request so the model sees the deck as it is right now,
  // including the live canvas and not only the saved slides.
  function requestOptions() {
    const { title, activeId } = deck.getState()
    return {
      body: {
        mode,
        deck: describeDeck({
          title,
          slides: deckActions.snapshot(),
          activeId,
          focus: references,
        }),
      },
    }
  }

  function resolveProposal(toolCallId: string, output: string) {
    void addToolOutput({ tool: PROPOSE_EDITS, toolCallId, output })
  }

  return {
    messages,
    status,
    error: chat.error,
    busy: status === "submitted" || status === "streaming",
    stop: () => void chat.stop(),
    reset: () => {
      void chat.stop()
      chat.setMessages([])
    },
    retry: () => void chat.regenerate(requestOptions()),

    send(text: string, context: string) {
      // A proposal left open has to be answered before the next message.
      for (const message of messages) {
        for (const part of message.parts) {
          if (isToolUIPart(part) && part.state === "input-available") {
            resolveProposal(part.toolCallId, "Dismissed by the user")
          }
        }
      }
      void sendMessage({ text, metadata: { context } }, requestOptions())
    },

    applyProposal(toolCallId: string, input: unknown) {
      const parsed = proposeEditsSchema.safeParse(input)
      if (!parsed.success) {
        return resolveProposal(toolCallId, "Dismissed: invalid proposal")
      }
      const errors = deckActions.applyEdits(parsed.data.operations)
      resolveProposal(
        toolCallId,
        errors.length ? `Applied with errors: ${errors.join("; ")}` : "Applied"
      )
    },

    dismissProposal: (toolCallId: string) =>
      resolveProposal(toolCallId, "Dismissed by the user"),
  }
}

export type AssistantChat = ReturnType<typeof useAssistantChat>
