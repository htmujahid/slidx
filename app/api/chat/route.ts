import { api } from "@/convex/_generated/api"
import { openai } from "@ai-sdk/openai"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai"

import { proposeEditsSchema } from "@/lib/ai/edit-schema"
import { AI_LIMIT_MESSAGE, LOGIN_REQUIRED_MESSAGE } from "@/lib/ai/errors"
import { buildSystemPrompt } from "@/lib/ai/prompt"
import { fetchAuthMutation, isAuthenticated } from "@/lib/auth-server"

export const maxDuration = 60

const MAX_DECK_CHARS = 400_000

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return new Response(LOGIN_REQUIRED_MESSAGE, {
      status: 401,
    })
  }
  if (!process.env.OPENAI_API_KEY) {
    return new Response("OPENAI_API_KEY is not set.", {
      status: 500,
    })
  }

  const { messages, mode, deck } = (await request.json()) as {
    messages: UIMessage[]
    mode: "ask" | "edit"
    deck: string
  }
  if (typeof deck !== "string" || deck.length > MAX_DECK_CHARS) {
    return new Response("Presentation is too large for the assistant.", {
      status: 413,
    })
  }

  const quota = await fetchAuthMutation(api.quota.consumeAi, {})
  if (!quota.ok) {
    return new Response(AI_LIMIT_MESSAGE, { status: 429 })
  }

  const result = streamText({
    // A failed request shouldn't cost the user one of their daily requests.
    onError: () => {
      void fetchAuthMutation(api.quota.refundAi, {})
    },
    model: openai(process.env.OPENAI_MODEL ?? "gpt-5.4-mini"),
    system: buildSystemPrompt(mode === "edit" ? "edit" : "ask", deck),
    messages: await convertToModelMessages(messages),
    // No execute: the proposal is shown to the user, who applies or dismisses
    // it in the browser, where the editor state lives.
    tools: {
      proposeEdits: {
        description:
          "Propose changes to the presentation for the user to review and apply.",
        inputSchema: proposeEditsSchema,
      },
    },
    // Declared in both modes so earlier proposals in the history stay valid
    // after the user switches to Ask, but only Edit may call it.
    activeTools: mode === "edit" ? ["proposeEdits"] : [],
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  })
}
