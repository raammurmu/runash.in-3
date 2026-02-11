import { GET as v1GET } from "@/app/api/v1/agents/sessions/[id]/route"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return v1GET(request as any, context)
}
