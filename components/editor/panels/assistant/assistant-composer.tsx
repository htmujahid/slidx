"use client"

import * as React from "react"
import {
  ArrowUpIcon,
  FileTextIcon,
  MessageSquareIcon,
  PencilLineIcon,
  SquareIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDeck } from "@/components/editor/editor-stores"
import { AssistantContextPicker } from "@/components/editor/panels/assistant/assistant-context-picker"
import type {
  AssistantMode,
  Reference,
} from "@/components/editor/panels/assistant/types"

export function AssistantComposer({
  inputRef,
  mode,
  onModeChange,
  draft,
  onDraftChange,
  references,
  onReferencesChange,
  busy,
  onSend,
  onStop,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  mode: AssistantMode
  onModeChange: (mode: AssistantMode) => void
  draft: string
  onDraftChange: (draft: string) => void
  references: Reference[]
  onReferencesChange: (references: Reference[]) => void
  busy: boolean
  onSend: () => void
  onStop: () => void
}) {
  const slideCount = useDeck((state) => state.slides.length)
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const closePicker = () => {
    setPickerOpen(false)
    onDraftChange(draft.replace(/@$/, ""))
    inputRef.current?.focus()
  }

  return (
    <form
      className="flex shrink-0 flex-col gap-3 p-3"
      onSubmit={(event) => {
        event.preventDefault()
        onSend()
      }}
    >
      <div
        className="flex flex-wrap items-center gap-1.5"
        aria-label="Chat context"
      >
        {references.length ? (
          references.map((reference) => (
            <Badge
              key={reference.id}
              variant="secondary"
              className="max-w-full gap-1"
            >
              <span className="truncate">{reference.label}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-5 shrink-0"
                aria-label={`Remove ${reference.label} context`}
                onClick={() =>
                  onReferencesChange(
                    references.filter((ref) => ref.id !== reference.id)
                  )
                }
              >
                <XIcon />
              </Button>
            </Badge>
          ))
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileTextIcon className="size-3.5" />
            Entire presentation · {slideCount} slides
          </span>
        )}
      </div>
      <InputGroup>
        <InputGroupTextarea
          ref={inputRef}
          aria-label="Message assistant"
          placeholder={
            mode === "ask"
              ? "Ask about your presentation…"
              : "Describe a change to your slides…"
          }
          value={draft}
          rows={3}
          onChange={(event) => {
            onDraftChange(event.target.value)
            if (event.target.value.endsWith("@")) setPickerOpen(true)
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              onSend()
            }
          }}
        />
        <InputGroupAddon align="block-end" className="justify-between">
          <AssistantContextPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            onAdd={(reference) => {
              if (!references.some((ref) => ref.id === reference.id)) {
                onReferencesChange([...references, reference])
              }
              closePicker()
            }}
            onClear={() => {
              onReferencesChange([])
              closePicker()
            }}
          />
          {busy ? (
            <InputGroupButton
              variant="default"
              size="icon-sm"
              aria-label="Stop generating"
              onClick={onStop}
            >
              <SquareIcon />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <ArrowUpIcon />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup
          size="sm"
          value={[mode]}
          onValueChange={(value) => {
            if (value[0]) onModeChange(value[0] as AssistantMode)
          }}
          aria-label="Assistant mode"
        >
          <ToggleGroupItem value="ask">
            <MessageSquareIcon />
            Ask
          </ToggleGroupItem>
          <ToggleGroupItem value="edit">
            <PencilLineIcon />
            Edit
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="text-xs text-muted-foreground">@ to add context</span>
      </div>
    </form>
  )
}
