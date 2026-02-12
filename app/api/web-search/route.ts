import { NextRequest } from "next/server"
import { z } from "zod"

import { respondError, respondSuccess, resolveRequestId } from "@/lib/api/response"
import { searchProductsWithProviders } from "@/services/web-search-service"

const querySchema = z.object({
  query: z.string().trim().min(2).max(240),
})

export async function GET(request: NextRequest) {
  const requestId = resolveRequestId(request)
  const url = new URL(request.url)

  const parseResult = querySchema.safeParse({ query: url.searchParams.get("query") ?? "" })

  if (!parseResult.success) {
    return respondError(
      request,
      { code: "INVALID_QUERY", message: "query must be at least 2 characters" },
      { status: 400, requestId },
    )
  }

  const results = await searchProductsWithProviders(parseResult.data.query)
  return respondSuccess(request, { query: parseResult.data.query, results }, { requestId })
}
