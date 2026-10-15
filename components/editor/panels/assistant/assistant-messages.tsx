"use client"

import { isToolUIPart } from "ai"

import { LOGIN_REQUIRED_MESSAGE } from "@/lib/ai/errors"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Button } from "@/components/ui/button"
import { Message, MessageContent, MessageHeader } from "@/components/ui/message"
import { MessageScrollerItem } from "@/components/ui/message-scroller"
import { AssistantProposal } from "@/components/editor/panels/assistant/assistant-proposal"
import {
  PROPOSE_EDITS,
  type AssistantMessage,
} from "@/components/editor/panels/assistant/types"
import type { AssistantChat } from "@/components/editor/panels/assistant/use-assistant-chat"

function UserMessage({ message }: { message: AssistantMessage }) {
  return (
    <Message align="end">
      <MessageContent>
        <MessageHeader>You · {message.metadata?.context}</MessageHeader>
        <Bubble variant="secondary" align="end">
          <BubbleContent className="whitespace-pre-wrap">
            {message.parts.map((part) =>
              part.type === "text" ? part.text : ""
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function AssistantReply({
  message,
  chat,
}: {
  message: AssistantMessage
  chat: AssistantChat
}) {
  return (
    <Message>
      <MessageContent>
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return part.text ? (
              <Bubble key={index} variant="ghost">
                <BubbleContent className="whitespace-pre-wrap">
                  {part.text}
                </BubbleContent>
              </Bubble>
            ) : null
          }
          if (isToolUIPart(part) && part.type === `tool-${PROPOSE_EDITS}`) {
            return (
              <AssistantProposal
                key={index}
                state={part.state}
                input={part.input}
                output={part.output}
                onApply={() => chat.applyProposal(part.toolCallId, part.input)}
                onDismiss={() => chat.dismissProposal(part.toolCallId)}
              />
            )
          }
          return null
        })}
      </MessageContent>
    </Message>
  )
}

export function AssistantMessages({ chat }: { chat: AssistantChat }) {
  return (
    <>
      {chat.messages.map((message) => (
        <MessageScrollerItem
          key={message.id}
          messageId={message.id}
          scrollAnchor={message.role === "user"}
        >
          {message.role === "user" ? (
            <UserMessage message={message} />
          ) : (
            <AssistantReply message={message} chat={chat} />
          )}
        </MessageScrollerItem>
      ))}
      {chat.status === "submitted" ? (
        <MessageScrollerItem messageId="pending">
          <Message>
            <MessageContent>
              <span className="shimmer text-sm">Thinking…</span>
            </MessageContent>
          </Message>
        </MessageScrollerItem>
      ) : null}
      {chat.error ? (
        <MessageScrollerItem messageId="error">
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col items-start gap-2">
              {chat.error.message || "Something went wrong."}
              {chat.error.message === LOGIN_REQUIRED_MESSAGE ? null : (
                <Button variant="outline" size="sm" onClick={chat.retry}>
                  Try again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </MessageScrollerItem>
      ) : null}
    </>
  )
}
