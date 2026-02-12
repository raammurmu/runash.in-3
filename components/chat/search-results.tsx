"use client"

import { ExternalLink, Globe2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SearchResult } from "@/types/runash-chat"

interface SearchResultsProps {
  results: SearchResult[]
}

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="space-y-2">
      {results.map((result) => (
        <Card key={result.id} className="border-orange-100 dark:border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm leading-snug">{result.title}</CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                {result.source}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 dark:text-gray-300">{result.snippet}</p>
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center text-xs text-orange-600 hover:text-orange-700"
            >
              <Globe2 className="mr-1 h-3 w-3" />
              Open source
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
