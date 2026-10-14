"use client"

import * as React from "react"
import { ImageIcon, XIcon } from "lucide-react"

import { toAssetRef } from "@/lib/storage/assets"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDeck } from "@/components/editor/editor-stores"
import { useAssetSrc, useStorage } from "@/components/storage-provider"

function ImageSource({
  value,
  onChange,
  label = "Image",
}: {
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  const id = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const storage = useStorage()
  const presentationId = useDeck((state) => state.presentationId)
  const preview = useAssetSrc(value)

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="aspect-video w-full rounded-lg border object-contain"
        />
      ) : null}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (!file) return
          try {
            onChange(
              toAssetRef(await storage.putAsset(file, { presentationId }))
            )
          } catch (error) {
            toast.add({
              type: "error",
              title: "Could not add the image",
              description: error instanceof Error ? error.message : undefined,
            })
          }
        }}
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon data-icon="inline-start" />
          {value ? "Replace image" : "Upload image"}
        </Button>
        {value ? (
          <Button
            variant="outline"
            size="icon"
            aria-label="Remove image"
            onClick={() => onChange("")}
          >
            <XIcon />
          </Button>
        ) : null}
      </div>
    </Field>
  )
}

function ImageFitSetting({
  value,
  onChange,
}: {
  value: "cover" | "contain"
  onChange: (value: "cover" | "contain") => void
}) {
  return (
    <Field>
      <FieldLabel>Fit</FieldLabel>
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        aria-label="Image fit"
        value={[value]}
        onValueChange={([fit]) => {
          if (fit) onChange(fit as "cover" | "contain")
        }}
      >
        <ToggleGroupItem value="cover">Cover</ToggleGroupItem>
        <ToggleGroupItem value="contain">Contain</ToggleGroupItem>
      </ToggleGroup>
    </Field>
  )
}

export { ImageFitSetting, ImageSource }
