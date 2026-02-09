import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkflowNodeDefinition } from "@/types/workflow-kit"

interface WorkflowNodeCardProps {
  definition: WorkflowNodeDefinition
  onAdd: (type: string) => void
}

export function WorkflowNodeCard({ definition, onAdd }: WorkflowNodeCardProps) {
  return (
    <Card className="cursor-pointer transition hover:border-primary" onClick={() => onAdd(definition.type)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{definition.label}</CardTitle>
          <Badge variant="secondary">{definition.category}</Badge>
        </div>
        <CardDescription className="text-xs">{definition.description}</CardDescription>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        In: {definition.inputs.length} • Out: {definition.outputs.length}
      </CardContent>
    </Card>
  )
}
