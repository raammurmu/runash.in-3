import type { SearchResult } from "@/types/runash-chat"

type SearchProvider = "exa" | "mcp" | "fallback"

function normalizeResult(input: unknown, source: SearchProvider): SearchResult | null {
  if (!input || typeof input !== "object") return null
  const record = input as Record<string, unknown>
  const title = String(record.title ?? "").trim()
  const url = String(record.url ?? "").trim()
  if (!title || !url) return null

  return {
    id: String(record.id ?? `${source}-${title}-${url}`),
    title,
    snippet: String(record.snippet ?? record.description ?? "No summary available."),
    url,
    source,
  }
}

async function exaSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) return []

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      query,
      numResults: 5,
      useAutoprompt: true,
      type: "neural",
    }),
  })

  if (!response.ok) return []
  const payload = (await response.json()) as { results?: unknown[] }
  return (payload.results ?? [])
    .map((result) => normalizeResult(result, "exa"))
    .filter((result): result is SearchResult => Boolean(result))
}

async function mcpSearch(query: string): Promise<SearchResult[]> {
  const endpoint = process.env.RUNASH_MCP_SEARCH_ENDPOINT
  if (!endpoint) return []

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.RUNASH_MCP_SEARCH_TOKEN
        ? { Authorization: `Bearer ${process.env.RUNASH_MCP_SEARCH_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ query, limit: 5 }),
  })

  if (!response.ok) return []
  const payload = (await response.json()) as { results?: unknown[] }

  return (payload.results ?? [])
    .map((result) => normalizeResult(result, "mcp"))
    .filter((result): result is SearchResult => Boolean(result))
}

function fallbackSearch(query: string): SearchResult[] {
  return [
    {
      id: `fallback-${Date.now()}-1`,
      title: `RunAsh product insights for “${query}”`,
      snippet: "Use this as a starter query and connect EXA_API_KEY or RUNASH_MCP_SEARCH_ENDPOINT for live web results.",
      url: "https://www.runash.ai",
      source: "fallback",
    },
  ]
}

export async function searchProductsWithProviders(query: string): Promise<SearchResult[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const [exaResults, mcpResults] = await Promise.allSettled([exaSearch(cleanQuery), mcpSearch(cleanQuery)])

  const merged: SearchResult[] = []
  if (exaResults.status === "fulfilled") merged.push(...exaResults.value)
  if (mcpResults.status === "fulfilled") merged.push(...mcpResults.value)

  if (merged.length > 0) {
    const uniqueByUrl = new Map<string, SearchResult>()
    for (const result of merged) {
      if (!uniqueByUrl.has(result.url)) uniqueByUrl.set(result.url, result)
    }

    return Array.from(uniqueByUrl.values()).slice(0, 6)
  }

  return fallbackSearch(cleanQuery)
}
