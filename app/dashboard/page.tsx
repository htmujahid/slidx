import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { isAuthenticated } from "@/lib/auth-server"
import { Dashboard } from "@/components/dashboard/dashboard"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  if (!(await isAuthenticated())) redirect("/")
  return <Dashboard />
}
