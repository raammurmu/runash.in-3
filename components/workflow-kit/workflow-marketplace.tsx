"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { WORKFLOW_TEMPLATES } from "@/lib/workflow-kit/templates"

interface WorkflowMarketplaceProps {
  onUseTemplate: (templateId: string) => void
}

export function WorkflowMarketplace({ onUseTemplate }: WorkflowMarketplaceProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase()
    return WORKFLOW_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized) ||
        template.category.toLowerCase().includes(normalized),
    )
  }, [query])

  return (
    <div className="space-y-3">
      <Input placeholder="Search templates..." value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{template.category} • ⭐ {template.rating} • {template.uses} uses</span>
              <Button size="sm" onClick={() => onUseTemplate(template.id)}>Use Template</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
