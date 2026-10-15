"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"
import { ConvexError } from "convex/values"
import { CircleAlertIcon } from "lucide-react"

import { DECK_LIMIT_CODE, DECK_LIMIT_MESSAGE } from "@/lib/ai/errors"
import { DEFAULT_TITLE } from "@/lib/editor/presentation"
import { BLANK_SLIDE_JSON, createSlideId } from "@/lib/editor/slides"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useStorage } from "@/components/storage-provider"

function CreateForm({ onCancel }: { onCancel: () => void }) {
  const storage = useStorage()
  const router = useRouter()
  const quota = useQuery(api.quota.get)
  const [title, setTitle] = React.useState(DEFAULT_TITLE)
  const [creating, setCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const limitReached =
    quota !== undefined && quota.decks.used >= quota.decks.limit
  const message = limitReached ? DECK_LIMIT_MESSAGE : error

  const create = async (event: React.FormEvent) => {
    event.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const id = await storage.create({
        title: title.trim() || DEFAULT_TITLE,
        slides: [{ id: createSlideId(), json: BLANK_SLIDE_JSON }],
      })
      router.push(`/editor/${id}`)
    } catch (caught) {
      setError(
        caught instanceof ConvexError && caught.data === DECK_LIMIT_CODE
          ? DECK_LIMIT_MESSAGE
          : "Could not create the presentation. Please try again."
      )
      setCreating(false)
    }
  }

  return (
    <form onSubmit={create}>
      <FieldGroup>
        {message ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>
              {limitReached || error === DECK_LIMIT_MESSAGE
                ? "Presentation limit reached"
                : "Something went wrong"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="new-presentation-title">Name</FieldLabel>
          <Input
            id="new-presentation-title"
            autoFocus
            value={title}
            disabled={limitReached || creating}
            onChange={(event) => setTitle(event.target.value)}
            onFocus={(event) => event.target.select()}
          />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={limitReached || creating}>
          {creating ? <Spinner data-icon="inline-start" /> : null}
          Create
        </Button>
      </DialogFooter>
    </form>
  )
}

function CreatePresentationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New presentation</DialogTitle>
          <DialogDescription>
            Give your presentation a name. You can rename it later.
          </DialogDescription>
        </DialogHeader>
        {open ? <CreateForm onCancel={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { CreatePresentationDialog }
