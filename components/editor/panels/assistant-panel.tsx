"use client"

import * as React from "react"
import { PlusIcon, SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import { Separator } from "@/components/ui/separator"
import { AssistantComposer } from "@/components/editor/panels/assistant/assistant-composer"
import { AssistantMessages } from "@/components/editor/panels/assistant/assistant-messages"
import { AssistantWelcome } from "@/components/editor/panels/assistant/assistant-welcome"
import type {
  AssistantMode,
  Reference,
} from "@/components/editor/panels/assistant/types"
import { useAssistantChat } from "@/components/editor/panels/assistant/use-assistant-chat"

export function AssistantPanel() {
  const [mode, setMode] = React.useState<AssistantMode>("ask")
  const [draft, setDraft] = React.useState("")
  const [references, setReferences] = React.useState<Reference[]>([])
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const chat = useAssistantChat({ mode, references })
  const empty = chat.messages.length === 0

  function send() {
    const text = draft.trim()
    if (!text || chat.busy) return
    chat.send(
      text,
      references.length
        ? references.map((ref) => ref.label).join(", ")
        : "Entire presentation"
    )
    setDraft("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <Badge variant="secondary">
          <SparklesIcon data-icon="inline-start" /> Beta
        </Badge>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="New chat"
          onClick={() => {
            chat.reset()
            setDraft("")
            setReferences([])
          }}
        >
          <PlusIcon />
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent
                className={cn("gap-5 p-4 pt-2", empty && "justify-center")}
              >
                {empty ? (
                  <MessageScrollerItem messageId="welcome">
                    <AssistantWelcome
                      onPick={(prompt, nextMode) => {
                        setDraft(prompt)
                        setMode(nextMode)
                        inputRef.current?.focus()
                      }}
                    />
                  </MessageScrollerItem>
                ) : (
                  <AssistantMessages chat={chat} />
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Separator />
      <AssistantComposer
        inputRef={inputRef}
        mode={mode}
        onModeChange={setMode}
        draft={draft}
        onDraftChange={setDraft}
        references={references}
        onReferencesChange={setReferences}
        busy={chat.busy}
        onSend={send}
        onStop={chat.stop}
      />
    </div>
  )
}
