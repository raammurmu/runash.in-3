"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { findNodeDefinition } from "@/lib/workflow-kit/node-registry"
import { WorkflowGraph, WorkflowNode } from "@/types/workflow-kit"

interface WorkflowBuilderProps {
  workflow: WorkflowGraph
  selectedNodeId?: string | null
  onSelectNode?: (nodeId: string) => void
  onChange: (workflow: WorkflowGraph) => void
}

export function WorkflowBuilder({ workflow, selectedNodeId, onSelectNode, onChange }: WorkflowBuilderProps) {
  const selectedNode = useMemo(() => workflow.nodes.find((node) => node.id === selectedNodeId), [selectedNodeId, workflow.nodes])

  function addNode(type: string) {
    const definition = findNodeDefinition(type)
    if (!definition) return

    const nextNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: definition.type,
      name: definition.label,
      config: definition.defaultConfig,
      position: { x: 40, y: 40 + workflow.nodes.length * 80 },
    }

    onChange({
      ...workflow,
      updatedAt: new Date().toISOString(),
      nodes: [...workflow.nodes, nextNode],
    })
    onSelectNode?.(nextNode.id)
  }

  function autoConnect() {
    const nodes = workflow.nodes
    const connections = nodes.slice(1).map((node, index) => ({
      id: `conn-${index + 1}`,
      sourceNodeId: nodes[index].id,
      sourcePortId: "video-out",
      targetNodeId: node.id,
      targetPortId: "video-in",
    }))

    onChange({ ...workflow, updatedAt: new Date().toISOString(), connections })
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Workflow Canvas</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={autoConnect}>
            Auto-connect
          </Button>
          <Button size="sm" onClick={() => addNode("camera-input")}>
            Quick add source
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {workflow.nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add nodes from the left palette to get started.</p>
        ) : (
          workflow.nodes.map((node) => (
            <button
              key={node.id}
              className={`w-full rounded-md border p-3 text-left ${selectedNode?.id === node.id ? "border-primary" : ""}`}
              onClick={() => onSelectNode?.(node.id)}
            >
              <p className="text-sm font-medium">{node.name}</p>
              <p className="text-xs text-muted-foreground">{node.type}</p>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  )
}
