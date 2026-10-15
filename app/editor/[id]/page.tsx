import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { isAuthenticated } from "@/lib/auth-server"
import { EditorShell } from "@/components/editor/editor-shell"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Editor",
}

export default async function PresentationEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  if (!(await isAuthenticated())) redirect("/")
  const { id } = await params
  return <EditorShell presentationId={id} />
}
