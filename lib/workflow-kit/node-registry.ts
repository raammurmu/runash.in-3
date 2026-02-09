import { WorkflowNodeDefinition } from "@/types/workflow-kit"

export const WORKFLOW_NODE_DEFINITIONS: WorkflowNodeDefinition[] = [
  {
    type: "camera-input",
    label: "Camera Input",
    description: "Capture live camera feed",
    category: "input",
    color: "#2563eb",
    icon: "Camera",
    inputs: [],
    outputs: [{ id: "video-out", label: "Video", type: "video" }],
    defaultConfig: { device: "default", resolution: "1080p", fps: 30 },
  },
  {
    type: "stream-key-input",
    label: "RTMP Input",
    description: "Ingest remote RTMP stream",
    category: "input",
    color: "#1d4ed8",
    icon: "Radio",
    inputs: [],
    outputs: [
      { id: "video-out", label: "Video", type: "video" },
      { id: "audio-out", label: "Audio", type: "audio" },
    ],
    defaultConfig: { source: "", reconnect: true },
  },
  {
    type: "video-trim",
    label: "Trim",
    description: "Trim timeline window",
    category: "video",
    color: "#7c3aed",
    icon: "Scissors",
    inputs: [{ id: "video-in", label: "Video", type: "video", required: true }],
    outputs: [{ id: "video-out", label: "Video", type: "video" }],
    defaultConfig: { start: 0, end: 30 },
  },
  {
    type: "video-overlay",
    label: "Overlay",
    description: "Add image/text overlays",
    category: "video",
    color: "#6d28d9",
    icon: "Layers",
    inputs: [{ id: "video-in", label: "Video", type: "video", required: true }],
    outputs: [{ id: "video-out", label: "Video", type: "video" }],
    defaultConfig: { title: "LIVE", position: "top-left", opacity: 0.8 },
  },
  {
    type: "ai-enhancer",
    label: "AI Enhancer",
    description: "Enhance video quality using AI",
    category: "ai",
    color: "#059669",
    icon: "Sparkles",
    inputs: [{ id: "video-in", label: "Video", type: "video", required: true }],
    outputs: [{ id: "video-out", label: "Enhanced Video", type: "video" }],
    defaultConfig: { denoise: true, sharpen: true, lowLightBoost: true },
  },
  {
    type: "ai-caption",
    label: "AI Caption",
    description: "Generate live captions",
    category: "ai",
    color: "#047857",
    icon: "Captions",
    inputs: [
      { id: "audio-in", label: "Audio", type: "audio", required: true },
      { id: "video-in", label: "Video", type: "video", required: false },
    ],
    outputs: [
      { id: "caption-out", label: "Captions", type: "text" },
      { id: "video-out", label: "Captioned Video", type: "video" },
    ],
    defaultConfig: { language: "en", style: "broadcast", profanityFilter: true },
  },
  {
    type: "multi-stream",
    label: "Multi Stream",
    description: "Broadcast to multiple platforms",
    category: "streaming",
    color: "#ea580c",
    icon: "Broadcast",
    inputs: [
      { id: "video-in", label: "Video", type: "video", required: true },
      { id: "audio-in", label: "Audio", type: "audio" },
    ],
    outputs: [{ id: "event-out", label: "Events", type: "event" }],
    defaultConfig: { youtube: true, twitch: true, instagram: false, bitrate: 6000 },
  },
  {
    type: "stream-analytics",
    label: "Analytics",
    description: "Track live stream KPIs",
    category: "streaming",
    color: "#c2410c",
    icon: "BarChart3",
    inputs: [{ id: "event-in", label: "Events", type: "event", required: true }],
    outputs: [{ id: "analytics-out", label: "Metrics", type: "analytics" }],
    defaultConfig: { intervalMs: 5000, alertDropThreshold: 30 },
  },
  {
    type: "record-output",
    label: "Recorder",
    description: "Store output stream",
    category: "output",
    color: "#be123c",
    icon: "Save",
    inputs: [{ id: "video-in", label: "Video", type: "video", required: true }],
    outputs: [],
    defaultConfig: { format: "mp4", path: "/recordings/live.mp4" },
  },
]

export function findNodeDefinition(type: string) {
  return WORKFLOW_NODE_DEFINITIONS.find((node) => node.type === type)
}

export function listNodeDefinitionsByCategory(category: WorkflowNodeDefinition["category"]) {
  return WORKFLOW_NODE_DEFINITIONS.filter((node) => node.category === category)
}
