import { EventEmitter } from "events"
import { getNodeHandler } from "@/lib/workflow-kit/node-handlers"
import { WorkflowExecution, WorkflowGraph, WorkflowNode } from "@/types/workflow-kit"

export type WorkflowEngineEvents =
  | "execution:start"
  | "execution:update"
  | "execution:complete"
  | "execution:error"
  | "node:start"
  | "node:complete"

export class WorkflowEngine extends EventEmitter {
  private isPaused = false

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  async execute(graph: WorkflowGraph): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: graph.id,
      status: "running",
      progress: 0,
      startedAt: new Date().toISOString(),
      results: [],
      logs: [`Execution started for ${graph.name}`],
    }

    this.emit("execution:start", execution)

    try {
      const orderedNodes = this.topologicalSort(graph)
      const context = new Map<string, Record<string, unknown>>()

      for (let i = 0; i < orderedNodes.length; i++) {
        const node = orderedNodes[i]
        while (this.isPaused) {
          await new Promise((resolve) => setTimeout(resolve, 80))
        }

        this.emit("node:start", node)
        const startedAt = new Date().toISOString()

        const input = this.resolveInput(graph, node, context)
        const output = await getNodeHandler(node.type)(node, input)
        context.set(node.id, output)

        const completedAt = new Date().toISOString()
        execution.results.push({
          nodeId: node.id,
          status: "completed",
          startedAt,
          completedAt,
          output,
        })

        execution.progress = Math.round(((i + 1) / orderedNodes.length) * 100)
        execution.logs.push(`Node ${node.name} completed`)
        this.emit("node:complete", { node, output })
        this.emit("execution:update", execution)
      }

      execution.status = "completed"
      execution.completedAt = new Date().toISOString()
      this.emit("execution:complete", execution)
      return execution
    } catch (error) {
      execution.status = "failed"
      execution.completedAt = new Date().toISOString()
      execution.logs.push(`Execution failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      this.emit("execution:error", error)
      return execution
    }
  }

  private resolveInput(
    graph: WorkflowGraph,
    node: WorkflowNode,
    context: Map<string, Record<string, unknown>>,
  ): Record<string, unknown> {
    const upstream = graph.connections.filter((connection) => connection.targetNodeId === node.id)
    return upstream.reduce<Record<string, unknown>>((acc, connection) => {
      acc[`${connection.sourceNodeId}.${connection.sourcePortId}`] = context.get(connection.sourceNodeId)
      return acc
    }, {})
  }

  private topologicalSort(graph: WorkflowGraph): WorkflowNode[] {
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    graph.nodes.forEach((node) => {
      inDegree.set(node.id, 0)
      adjacency.set(node.id, [])
    })

    graph.connections.forEach((connection) => {
      adjacency.get(connection.sourceNodeId)?.push(connection.targetNodeId)
      inDegree.set(connection.targetNodeId, (inDegree.get(connection.targetNodeId) ?? 0) + 1)
    })

    const queue = graph.nodes.filter((node) => (inDegree.get(node.id) ?? 0) === 0)
    const ordered: WorkflowNode[] = []

    while (queue.length > 0) {
      const current = queue.shift()!
      ordered.push(current)

      for (const next of adjacency.get(current.id) ?? []) {
        const nextDegree = (inDegree.get(next) ?? 1) - 1
        inDegree.set(next, nextDegree)
        if (nextDegree === 0) {
          const node = graph.nodes.find((item) => item.id === next)
          if (node) queue.push(node)
        }
      }
    }

    if (ordered.length !== graph.nodes.length) {
      throw new Error("Workflow has cyclic dependencies")
    }

    return ordered
  }
}
