"use client"

import * as React from "react"

import { summarizeOperation } from "@/lib/ai/apply-edits"
import { proposeEditsSchema } from "@/lib/ai/edit-schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useDeck } from "@/components/editor/editor-stores"

export function AssistantProposal({
  state,
  input,
  output,
  onApply,
  onDismiss,
}: {
  state: string
  input: unknown
  output: unknown
  onApply: () => void
  onDismiss: () => void
}) {
  const slides = useDeck((deck) => deck.slides)
  const parsed = proposeEditsSchema.safeParse(input)

  if (
    state === "input-streaming" ||
    (!parsed.success && state !== "output-available")
  ) {
    return <span className="shimmer text-sm">Preparing changes…</span>
  }
  if (!parsed.success) return null

  const { summary, operations } = parsed.data
  const resolved = typeof output === "string" ? output : null
  const applied = resolved?.startsWith("Applied")

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Proposed changes</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {operations.map((operation, index) => {
          const { label, detail } = summarizeOperation(operation, slides)
          return (
            <React.Fragment key={index}>
              {index > 0 ? <Separator /> : null}
              <div className="flex flex-col gap-1">
                <Badge variant="outline">{label}</Badge>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            </React.Fragment>
          )
        })}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {resolved ? (
          <span className="text-xs text-muted-foreground">
            {applied ? resolved : "Dismissed"}
          </span>
        ) : (
          <>
            <Button size="sm" onClick={onApply}>
              Apply changes
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
