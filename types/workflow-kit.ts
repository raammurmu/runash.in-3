export type WorkflowNodeCategory = "input" | "video" | "ai" | "streaming" | "output"

export type WorkflowExecutionStatus = "idle" | "running" | "paused" | "completed" | "failed"

export type WorkflowPortType = "video" | "audio" | "metadata" | "text" | "analytics" | "event"

export interface WorkflowPort {
  id: string
  label: string
  type: WorkflowPortType
  required?: boolean
}

export interface WorkflowNodeDefinition {
  type: string
  label: string
  description: string
  category: WorkflowNodeCategory
  color: string
  icon: string
  inputs: WorkflowPort[]
  outputs: WorkflowPort[]
  defaultConfig: Record<string, string | number | boolean | string[]>
}

export interface WorkflowNode {
  id: string
  type: string
  name: string
  config: Record<string, unknown>
  position: { x: number; y: number }
}

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

export interface WorkflowGraph {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  createdAt: string
  updatedAt: string
}

export interface NodeExecutionResult {
  nodeId: string
  startedAt: string
  completedAt?: string
  status: Exclude<WorkflowExecutionStatus, "idle" | "paused">
  output?: Record<string, unknown>
  error?: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: WorkflowExecutionStatus
  progress: number
  startedAt: string
  completedAt?: string
  results: NodeExecutionResult[]
  logs: string[]
}

export interface WorkflowTemplate {
  id: string
  name: string
  category: "live-commerce" | "sports" | "education" | "gaming" | "events" | "news"
  description: string
  rating: number
  uses: number
  graph: Omit<WorkflowGraph, "id" | "createdAt" | "updatedAt">
}
