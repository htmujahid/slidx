import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { isAuthenticated } from "@/lib/auth-server"
import { NewPresentation } from "@/components/new-presentation"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "New presentation",
}

export default async function NewPresentationPage() {
  if (!(await isAuthenticated())) redirect("/")
  return <NewPresentation />
}
