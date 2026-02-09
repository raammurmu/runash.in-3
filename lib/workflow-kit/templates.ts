import { WorkflowTemplate } from "@/types/workflow-kit"

const now = new Date().toISOString()

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "template-live-commerce",
    name: "Live Commerce Booster",
    category: "live-commerce",
    description: "AI captions + product overlays + multi-platform broadcasting for shopping streams.",
    rating: 4.8,
    uses: 1240,
    graph: {
      name: "Live Commerce Booster",
      description: "Ready-to-run commerce workflow",
      nodes: [
        { id: "n1", type: "camera-input", name: "Camera", config: {}, position: { x: 80, y: 80 } },
        { id: "n2", type: "ai-caption", name: "Captions", config: {}, position: { x: 300, y: 80 } },
        { id: "n3", type: "video-overlay", name: "Product Overlay", config: {}, position: { x: 520, y: 80 } },
        { id: "n4", type: "multi-stream", name: "Broadcast", config: {}, position: { x: 760, y: 80 } },
      ],
      connections: [
        { id: "c1", sourceNodeId: "n1", sourcePortId: "video-out", targetNodeId: "n2", targetPortId: "video-in" },
        { id: "c2", sourceNodeId: "n2", sourcePortId: "video-out", targetNodeId: "n3", targetPortId: "video-in" },
        { id: "c3", sourceNodeId: "n3", sourcePortId: "video-out", targetNodeId: "n4", targetPortId: "video-in" },
      ],
    },
  },
  {
    id: "template-esports",
    name: "Esports Instant Replay",
    category: "gaming",
    description: "Overlay + AI enhancement + analytics tuned for competitive streams.",
    rating: 4.6,
    uses: 980,
    graph: {
      name: "Esports Instant Replay",
      nodes: [
        { id: "n1", type: "stream-key-input", name: "RTMP Ingest", config: {}, position: { x: 80, y: 140 } },
        { id: "n2", type: "ai-enhancer", name: "AI Enhance", config: {}, position: { x: 300, y: 140 } },
        { id: "n3", type: "multi-stream", name: "Broadcast", config: {}, position: { x: 520, y: 140 } },
        { id: "n4", type: "stream-analytics", name: "Metrics", config: {}, position: { x: 740, y: 140 } },
      ],
      connections: [
        { id: "c1", sourceNodeId: "n1", sourcePortId: "video-out", targetNodeId: "n2", targetPortId: "video-in" },
        { id: "c2", sourceNodeId: "n2", sourcePortId: "video-out", targetNodeId: "n3", targetPortId: "video-in" },
        { id: "c3", sourceNodeId: "n3", sourcePortId: "event-out", targetNodeId: "n4", targetPortId: "event-in" },
      ],
    },
  },
]

export function templateToWorkflow(templateId: string) {
  const template = WORKFLOW_TEMPLATES.find((item) => item.id === templateId)
  if (!template) return null

  return {
    id: `workflow-${template.id}-${Date.now()}`,
    name: template.name,
    description: template.description,
    createdAt: now,
    updatedAt: now,
    nodes: template.graph.nodes,
    connections: template.graph.connections,
  }
}
