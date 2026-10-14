"use client"

import * as React from "react"
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react"
import { ConvexReactClient } from "convex/react"

import { authClient } from "@/lib/auth-client"

const client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={client} authClient={authClient}>
      {children}
    </ConvexBetterAuthProvider>
  )
}

export { ConvexProvider }
