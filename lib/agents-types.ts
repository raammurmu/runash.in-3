import { z } from "zod"

export const agentSessionStatusSchema = z.enum(["queued", "streaming", "tool-running", "completed", "failed"])

export const agentChatRequestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(8000),
  context: z.record(z.string(), z.unknown()).optional(),
  toolPermissions: z.array(z.string()).default([]),
  confirmationTokens: z.array(z.string()).default([]),
})

export const agentActionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  actionType: z.string().min(2).max(120),
  payload: z.record(z.string(), z.unknown()).default({}),
  confirmationToken: z.string().optional(),
})

export const agentFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  category: z.enum(["quality", "safety", "latency", "relevance"]),
  notes: z.string().max(2000).optional(),
})

export type AgentSessionStatus = z.infer<typeof agentSessionStatusSchema>
export type AgentChatRequest = z.infer<typeof agentChatRequestSchema>
export type AgentActionRequest = z.infer<typeof agentActionRequestSchema>
export type AgentFeedbackRequest = z.infer<typeof agentFeedbackSchema>

export type AgentToolCall = {
  id: string
  sessionId: string
  name: string
  args: Record<string, unknown>
  status: "queued" | "running" | "completed" | "failed"
  startedAt?: string
  finishedAt?: string
  error?: string
}
