import { redirect } from "next/navigation"

import { isAuthenticated } from "@/lib/auth-server"
import { EditorShell } from "@/components/editor/editor-shell"

export default async function HomePage() {
  if (await isAuthenticated()) redirect("/dashboard")
  return <EditorShell />
}
