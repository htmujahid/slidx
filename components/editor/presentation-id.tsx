"use client"

import * as React from "react"

import { LOCAL_PRESENTATION_ID } from "@/lib/storage/types"

const PresentationIdContext = React.createContext(LOCAL_PRESENTATION_ID)

const PresentationIdProvider = PresentationIdContext.Provider

function usePresentationId() {
  return React.useContext(PresentationIdContext)
}

export { PresentationIdProvider, usePresentationId }
