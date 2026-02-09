import { WorkflowNode } from "@/types/workflow-kit"

export type NodeHandler = (node: WorkflowNode, input: Record<string, unknown>) => Promise<Record<string, unknown>>

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const passthrough = async (node: WorkflowNode, input: Record<string, unknown>) => {
  await sleep(200)
  return { ...input, lastProcessedBy: node.type }
}

export const NODE_HANDLERS: Record<string, NodeHandler> = {
  "camera-input": async (node) => {
    await sleep(150)
    return { videoFrame: `${node.id}:video`, audioFrame: `${node.id}:audio` }
  },
  "stream-key-input": async (node) => {
    await sleep(120)
    return { videoFrame: `${node.id}:ingest-video`, audioFrame: `${node.id}:ingest-audio` }
  },
  "video-trim": passthrough,
  "video-overlay": passthrough,
  "ai-enhancer": async (node, input) => {
    await sleep(300)
    return { ...input, enhancements: ["denoise", "low-light"] }
  },
  "ai-caption": async (node, input) => {
    await sleep(280)
    return { ...input, captions: [{ time: 0, text: "Welcome to the live stream" }] }
  },
  "multi-stream": async (node, input) => {
    await sleep(180)
    return {
      ...input,
      streamEvents: [
        { platform: "youtube", viewers: 120 },
        { platform: "twitch", viewers: 48 },
      ],
    }
  },
  "stream-analytics": async (_node, input) => {
    await sleep(220)
    return {
      kpis: {
        concurrentViewers: 168,
        averageWatchTime: 452,
        chatRate: 22,
      },
      input,
    }
  },
  "record-output": async (_node, input) => {
    await sleep(100)
    return { saved: true, artifactId: `recording-${Date.now()}`, input }
  },
}

export function getNodeHandler(type: string): NodeHandler {
  return NODE_HANDLERS[type] ?? passthrough
}
