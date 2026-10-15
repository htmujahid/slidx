"use client"

import { FileTextIcon, PencilLineIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { AssistantMode } from "@/components/editor/panels/assistant/types"

const PROMPTS: {
  label: string
  mode: AssistantMode
  icon: typeof FileTextIcon
}[] = [
  { label: "Summarize this presentation", mode: "ask", icon: FileTextIcon },
  { label: "Make the story more compelling", mode: "edit", icon: SparklesIcon },
  {
    label: "Insert, rewrite, or remove content",
    mode: "edit",
    icon: PencilLineIcon,
  },
]

export function AssistantWelcome({
  onPick,
}: {
  onPick: (prompt: string, mode: AssistantMode) => void
}) {
  return (
    <>
      <Empty className="border-0 px-0 py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SparklesIcon />
          </EmptyMedia>
          <EmptyTitle>A little help with your story</EmptyTitle>
          <EmptyDescription>
            Explore your presentation, refine a slide, or turn an idea into
            content.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
      <div className="flex flex-col gap-2">
        {PROMPTS.map((prompt) => (
          <Button
            key={prompt.label}
            variant="outline"
            className="h-auto justify-start py-3 text-left whitespace-normal"
            onClick={() => onPick(prompt.label, prompt.mode)}
          >
            <prompt.icon data-icon="inline-start" />
            {prompt.label}
          </Button>
        ))}
      </div>
    </>
  )
}
