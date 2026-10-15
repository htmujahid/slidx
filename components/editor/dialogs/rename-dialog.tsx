"use client"

import * as React from "react"

import { DEFAULT_TITLE } from "@/lib/editor/presentation"
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
import { useDeckActions } from "@/components/editor/deck-actions-provider"
import { useChrome, useDeck } from "@/components/editor/editor-stores"

function RenameForm({ onDone }: { onDone: () => void }) {
  const title = useDeck((state) => state.title)
  const { setTitle } = useDeckActions()
  const [value, setValue] = React.useState(title)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setTitle(value.trim() || DEFAULT_TITLE)
        onDone()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="presentation-title">Name</FieldLabel>
          <Input
            id="presentation-title"
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={(event) => event.target.select()}
          />
        </Field>
      </FieldGroup>
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit">Rename</Button>
      </DialogFooter>
    </form>
  )
}

function RenameDialog() {
  const open = useChrome((state) => state.dialog === "rename")
  const setDialog = useChrome((state) => state.setDialog)
  const close = () => setDialog(null)

  return (
    <Dialog open={open} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename presentation</DialogTitle>
          <DialogDescription>
            The name is used in the header and for saved and exported files.
          </DialogDescription>
        </DialogHeader>
        {open ? <RenameForm onDone={close} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { RenameDialog }
