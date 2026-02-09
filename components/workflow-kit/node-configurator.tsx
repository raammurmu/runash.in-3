"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WorkflowNode } from "@/types/workflow-kit"

interface NodeConfiguratorProps {
  node?: WorkflowNode
  onUpdate: (next: WorkflowNode) => void
}

export function NodeConfigurator({ node, onUpdate }: NodeConfiguratorProps) {
  if (!node) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Select a node to edit configuration.</div>
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">{node.name} configuration</h3>
      {Object.entries(node.config).map(([key, value]) => (
        <div key={key} className="space-y-1">
          <Label className="text-xs">{key}</Label>
          <Input
            value={String(value)}
            onChange={(event) =>
              onUpdate({
                ...node,
                config: {
                  ...node.config,
                  [key]: event.target.value,
                },
              })
            }
          />
        </div>
      ))}
    </div>
  )
}
