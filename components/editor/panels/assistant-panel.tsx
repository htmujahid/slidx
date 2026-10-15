"use client"

import * as React from "react"
import { ROOT_NODE, useEditor } from "@craftjs/core"
import {
  ArrowUpIcon,
  AtSignIcon,
  FileTextIcon,
  MessageSquareIcon,
  PencilLineIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"

import { getElementLabel } from "@/lib/editor/labels"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDeck } from "@/components/editor/editor-stores"

type Reference = { id: string; label: string }
type Turn = {
  id: string
  text: string
  context: string
  edit: boolean
  dismissed?: boolean
}

export function AssistantPanel() {
  const slides = useDeck((state) => state.slides)
  const activeId = useDeck((state) => state.activeId)
  const { selection } = useEditor((state) => ({
    selection: [...state.events.selected]
      .filter((id) => id !== ROOT_NODE && state.nodes[id])
      .map((id) => ({
        id: `${activeId}:${id}`,
        label: `Slide ${slides.findIndex((slide) => slide.id === activeId) + 1} · ${getElementLabel({ name: state.nodes[id].data.name, props: state.nodes[id].data.props })}`,
      })),
  }))
  const [mode, setMode] = React.useState("ask")
  const [draft, setDraft] = React.useState("")
  const [references, setReferences] = React.useState<Reference[]>([])
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [turns, setTurns] = React.useState<Turn[]>([])
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const context = references.length
    ? references.map((ref) => ref.label).join(", ")
    : "Entire presentation"

  function addReference(reference: Reference) {
    setReferences((current) =>
      current.some((ref) => ref.id === reference.id)
        ? current
        : [...current, reference]
    )
    setPickerOpen(false)
    setDraft((current) => current.replace(/@$/, ""))
    inputRef.current?.focus()
  }

  function send() {
    if (!draft.trim()) return
    setTurns((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        text: draft.trim(),
        context,
        edit: mode === "edit",
      },
    ])
    setDraft("")
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
        <Badge variant="secondary">
          <SparklesIcon data-icon="inline-start" /> Design preview
        </Badge>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="New chat"
          onClick={() => {
            setTurns([])
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
                className={cn(
                  "gap-5 p-4 pt-2",
                  turns.length === 0 && "justify-center"
                )}
              >
                {turns.length === 0 ? (
                  <MessageScrollerItem messageId="welcome">
                    <Empty className="border-0 px-0 py-8">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <SparklesIcon />
                        </EmptyMedia>
                        <EmptyTitle>A little help with your story</EmptyTitle>
                        <EmptyDescription>
                          Explore your presentation, refine a slide, or turn an
                          idea into content.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                    <div className="flex flex-col gap-2">
                      {[
                        {
                          label: "Summarize this presentation",
                          mode: "ask",
                          icon: FileTextIcon,
                        },
                        {
                          label: "Make the story more compelling",
                          mode: "edit",
                          icon: SparklesIcon,
                        },
                        {
                          label: "Insert, rewrite, or remove content",
                          mode: "edit",
                          icon: PencilLineIcon,
                        },
                      ].map((prompt) => (
                        <Button
                          key={prompt.label}
                          variant="outline"
                          className="h-auto justify-start py-3 text-left whitespace-normal"
                          onClick={() => {
                            setDraft(prompt.label)
                            setMode(prompt.mode)
                            inputRef.current?.focus()
                          }}
                        >
                          <prompt.icon data-icon="inline-start" />
                          {prompt.label}
                        </Button>
                      ))}
                    </div>
                  </MessageScrollerItem>
                ) : (
                  turns.map((turn) => (
                    <MessageScrollerItem
                      key={turn.id}
                      messageId={turn.id}
                      scrollAnchor
                    >
                      <div className="flex flex-col gap-4">
                        <Message align="end">
                          <MessageContent>
                            <MessageHeader>You · {turn.context}</MessageHeader>
                            <Bubble variant="secondary" align="end">
                              <BubbleContent>{turn.text}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                        <Message>
                          <MessageContent>
                            <MessageHeader>
                              <SparklesIcon className="mr-1.5 size-3" />
                              Assistant · Sample response
                            </MessageHeader>
                            <Bubble variant="ghost">
                              <BubbleContent>
                                {turn.edit
                                  ? "Here’s how a proposed edit would appear. Review the destination and each change before applying."
                                  : "An answer would appear here with references to the slides and elements you included. This demo does not read or analyze your content."}
                              </BubbleContent>
                            </Bubble>
                            {turn.edit && !turn.dismissed ? (
                              <Card size="sm">
                                <CardHeader>
                                  <CardTitle>Example changes</CardTitle>
                                  <CardDescription>
                                    Illustrative only · {turn.context}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                  <div className="flex flex-col gap-1">
                                    <Badge variant="outline">Update</Badge>
                                    <p className="text-xs text-muted-foreground line-through">
                                      Our comprehensive product vision
                                    </p>
                                    <p className="text-sm">
                                      A clearer vision for what’s next
                                    </p>
                                  </div>
                                  <Separator />
                                  <div className="flex flex-col gap-1">
                                    <Badge variant="outline">Insert</Badge>
                                    <p className="text-xs text-muted-foreground">
                                      Supporting text below the heading.
                                    </p>
                                  </div>
                                  <Separator />
                                  <div className="flex flex-col gap-1">
                                    <Badge variant="outline">Delete</Badge>
                                    <p className="text-xs text-muted-foreground">
                                      Remove a duplicate caption.
                                    </p>
                                  </div>
                                </CardContent>
                                <CardFooter className="flex flex-wrap gap-2">
                                  <Button size="sm" disabled>
                                    Apply changes
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setTurns((current) =>
                                        current.map((item) =>
                                          item.id === turn.id
                                            ? { ...item, dismissed: true }
                                            : item
                                        )
                                      )
                                    }
                                  >
                                    Dismiss
                                  </Button>
                                </CardFooter>
                              </Card>
                            ) : turn.dismissed ? (
                              <p className="text-xs text-muted-foreground">
                                Example changes dismissed.
                              </p>
                            ) : null}
                          </MessageContent>
                        </Message>
                      </div>
                    </MessageScrollerItem>
                  ))
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      <Separator />
      <form
        className="flex shrink-0 flex-col gap-3 p-3"
        onSubmit={(event) => {
          event.preventDefault()
          send()
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
                    setReferences((current) =>
                      current.filter((ref) => ref.id !== reference.id)
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
              Entire presentation · {slides.length} slides
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
              setDraft(event.target.value)
              if (event.target.value.endsWith("@")) setPickerOpen(true)
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                send()
              }
            }}
          />
          <InputGroupAddon align="block-end" className="justify-between">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger
                render={
                  <InputGroupButton aria-label="Mention a slide or selected element" />
                }
              >
                <AtSignIcon />
                Context
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Find context…" />
                  <CommandList>
                    <CommandEmpty>No matching context.</CommandEmpty>
                    <CommandGroup heading="Presentation">
                      <CommandItem
                        onSelect={() => {
                          setReferences([])
                          setPickerOpen(false)
                          setDraft((current) => current.replace(/@$/, ""))
                        }}
                      >
                        Entire presentation
                      </CommandItem>
                    </CommandGroup>
                    {selection.length > 0 && (
                      <CommandGroup heading="Selected elements">
                        {selection.map((reference) => (
                          <CommandItem
                            key={reference.id}
                            onSelect={() => addReference(reference)}
                          >
                            {reference.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    <CommandGroup heading="Slides">
                      {slides.map((slide, index) => (
                        <CommandItem
                          key={slide.id}
                          onSelect={() =>
                            addReference({
                              id: slide.id,
                              label: `Slide ${index + 1}`,
                            })
                          }
                        >
                          Slide {index + 1}
                          {slide.id === activeId ? " · Current" : ""}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              disabled={!draft.trim()}
              aria-label="Send demo message"
            >
              <ArrowUpIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex items-center justify-between gap-2">
          <ToggleGroup
            size="sm"
            value={[mode]}
            onValueChange={(value) => {
              if (value[0]) setMode(value[0])
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
          <span className="text-xs text-muted-foreground">
            @ to add context
          </span>
        </div>
      </form>
    </div>
  )
}
