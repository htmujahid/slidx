import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { isAuthenticated } from "@/lib/auth-server"
import { EditorShell } from "@/components/editor/editor-shell"

export const metadata: Metadata = {
  title: "Editor",
}

export default async function PresentationEditorPage() {
  if (!(await isAuthenticated())) redirect("/")
  return <EditorShell />
}
