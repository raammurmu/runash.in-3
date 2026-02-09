"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { WorkflowExecution } from "@/types/workflow-kit"

interface ExecutionDashboardProps {
  execution: WorkflowExecution | null
}

export function ExecutionDashboard({ execution }: ExecutionDashboardProps) {
  const completed = useMemo(() => execution?.results.filter((result) => result.status === "completed").length ?? 0, [execution])

  if (!execution) {
    return <Card><CardContent className="p-4 text-sm text-muted-foreground">Run a workflow to view execution metrics.</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Execution Monitor</CardTitle>
          <Badge>{execution.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={execution.progress} />
        <div className="text-xs text-muted-foreground">{completed} nodes completed • {execution.progress}%</div>
        <div className="max-h-44 space-y-2 overflow-auto rounded border p-2 text-xs">
          {execution.logs.map((log) => (
            <p key={log}>{log}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
