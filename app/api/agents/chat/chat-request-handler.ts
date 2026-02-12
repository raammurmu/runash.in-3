import type { SupportedTool } from "@/services/agent-orchestration-service"

export function buildToolPlan(tools: SupportedTool[]) {
  const immediate: SupportedTool[] = []
  const queued: SupportedTool[] = []

  for (const tool of tools) {
    if (tool === "catalog_lookup" || tool === "web_search") {
      immediate.push(tool)
      continue
    }

    queued.push(tool)
  }

  return { immediate, queued }
}
