import { POST as v1POST } from "@/app/api/v1/agents/chat/route"

export const maxDuration = 30

export async function POST(request: Request) {
  return v1POST(request as any)
}
