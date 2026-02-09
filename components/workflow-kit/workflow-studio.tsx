"use client"

import { useMemo, useState } from "react"
import { NodePalette } from "@/components/workflow-kit/node-palette"
import { NodeConfigurator } from "@/components/workflow-kit/node-configurator"
import { WorkflowBuilder } from "@/components/workflow-kit/workflow-builder"
import { ExecutionDashboard } from "@/components/workflow-kit/execution-dashboard"
import { WorkflowMarketplace } from "@/components/workflow-kit/workflow-marketplace"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { findNodeDefinition } from "@/lib/workflow-kit/node-registry"
import { templateToWorkflow } from "@/lib/workflow-kit/templates"
import { WorkflowEngine } from "@/lib/workflow-kit/workflow-engine"
import { WorkflowExecution, WorkflowGraph } from "@/types/workflow-kit"

const initialWorkflow: WorkflowGraph = {
  id: "workflow-live-studio",
  name: "AI Live Video Workflow",
  description: "Compose AI-driven live workflows",
  nodes: [],
  connections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function WorkflowStudio() {
  const [workflow, setWorkflow] = useState<WorkflowGraph>(initialWorkflow)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [execution, setExecution] = useState<WorkflowExecution | null>(null)
  const [running, setRunning] = useState(false)

  const selectedNode = useMemo(() => workflow.nodes.find((n) => n.id === selectedNodeId), [workflow.nodes, selectedNodeId])

  function addNode(type: string) {
    const definition = findNodeDefinition(type)
    if (!definition) return

    const node = {
      id: `node-${Date.now()}`,
      type: definition.type,
      name: definition.label,
      config: definition.defaultConfig,
      position: { x: 80, y: workflow.nodes.length * 80 + 50 },
    }

    setWorkflow((prev) => ({ ...prev, nodes: [...prev.nodes, node], updatedAt: new Date().toISOString() }))
    setSelectedNodeId(node.id)
  }

  async function runWorkflow() {
    setRunning(true)
    const engine = new WorkflowEngine()
    engine.on("execution:update", (update) => setExecution({ ...update }))
    const completed = await engine.execute(workflow)
    setExecution(completed)
    setRunning(false)
  }

  return (
    <Tabs defaultValue="builder" className="space-y-4">
      <TabsList>
        <TabsTrigger value="builder">Builder</TabsTrigger>
        <TabsTrigger value="monitor">Monitor</TabsTrigger>
        <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
      </TabsList>

      <TabsContent value="builder" className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        <NodePalette onAddNode={addNode} />
        <div className="space-y-3">
          <WorkflowBuilder
            workflow={workflow}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onChange={setWorkflow}
          />
          <Button onClick={runWorkflow} disabled={running || workflow.nodes.length === 0}>
            {running ? "Running..." : "Run Workflow"}
          </Button>
        </div>
        <NodeConfigurator
          node={selectedNode}
          onUpdate={(updatedNode) =>
            setWorkflow((prev) => ({
              ...prev,
              nodes: prev.nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
            }))
          }
        />
      </TabsContent>

      <TabsContent value="monitor">
        <ExecutionDashboard execution={execution} />
      </TabsContent>

      <TabsContent value="marketplace">
        <WorkflowMarketplace
          onUseTemplate={(templateId) => {
            const next = templateToWorkflow(templateId)
            if (next) setWorkflow(next)
          }}
        />
      </TabsContent>
    </Tabs>
  )
}
