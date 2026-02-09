"use client"

import { WORKFLOW_NODE_DEFINITIONS } from "@/lib/workflow-kit/node-registry"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkflowNodeCard } from "@/components/workflow-kit/workflow-node-card"

interface NodePaletteProps {
  onAddNode: (type: string) => void
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b p-3 text-sm font-semibold">Node Palette</div>
      <ScrollArea className="h-[420px] p-3">
        <div className="space-y-2">
          {WORKFLOW_NODE_DEFINITIONS.map((definition) => (
            <WorkflowNodeCard key={definition.type} definition={definition} onAdd={onAddNode} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
