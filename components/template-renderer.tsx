"use client"

import * as React from "react"
import { renderTemplate } from "@/lib/template-engine"

type TemplateRendererProps = {
  templateId: "product-card" | "stream-summary"
  data: Record<string, unknown>
  className?: string
}

const templates: Record<TemplateRendererProps["templateId"], string> = {
  "product-card": `
    <div class="flex items-start gap-3">
      <img src="{{ image_url | /placeholder.svg?height=60&width=60&query=product-image }}" alt="{{ name }}" class="h-14 w-14 rounded-md object-cover border" />
      <div class="flex-1">
        <div class="font-semibold leading-tight">{{ name | Untitled Product }}</div>
        <div class="text-xs text-muted-foreground">{{ category | General }}</div>
        <div class="text-sm mt-1">${"{{ price | 0 }}"} USD • {{ inventory_count | 0 }} in stock</div>
      </div>
    </div>
  `,
  "stream-summary": `
    <div>
      <div class="font-semibold">{{ title | Untitled Stream }}</div>
      <div class="text-sm text-muted-foreground mt-1">
        {{ viewers | 0 }} viewers • ${{ revenue }} revenue • Engagement {{ engagement | 0 }}%
      </div>
      <div class="text-xs text-muted-foreground mt-1">Duration: {{ duration | 00:00 }}</div>
    </div>
  `,
}

export function TemplateRenderer({ templateId, data, className }: TemplateRendererProps) {
  const html = React.useMemo(() => renderTemplate(templates[templateId], data), [templateId, data])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
