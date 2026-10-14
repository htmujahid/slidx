import { create } from "zustand"

export type EditorDialog =
  "rename" | "new" | "reset" | "size" | { type: "keyframes"; id: string } | null

export type ChromeState = {
  propertiesOpen: boolean
  timelineOpen: boolean
  dialog: EditorDialog
  editingId: string | null
  setPropertiesOpen: (open: boolean) => void
  toggleProperties: () => void
  setTimelineOpen: (open: boolean) => void
  toggleTimeline: () => void
  setDialog: (dialog: EditorDialog) => void
  setEditingId: (id: string | null) => void
}

export const useChrome = create<ChromeState>()((set) => ({
  propertiesOpen: false,
  timelineOpen: false,
  dialog: null,
  editingId: null,
  setPropertiesOpen: (propertiesOpen) => set({ propertiesOpen }),
  toggleProperties: () =>
    set(({ propertiesOpen }) => ({ propertiesOpen: !propertiesOpen })),
  setTimelineOpen: (timelineOpen) => set({ timelineOpen }),
  toggleTimeline: () =>
    set(({ timelineOpen }) => ({ timelineOpen: !timelineOpen })),
  setDialog: (dialog) => set({ dialog }),
  setEditingId: (editingId) => set({ editingId }),
}))
