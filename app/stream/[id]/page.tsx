import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardStreamDetailsResponse } from "@/lib/types/dashboard-streams"

type StreamDetailPageProps = {
  params: {
    id: string
  }
}

async function getStream(id: string) {
  const headerStore = await headers()
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host")
  const protocol = headerStore.get("x-forwarded-proto") ?? "http"
  const baseUrl = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_BASE_URL

  if (!baseUrl) {
    return null
  }

  const response = await fetch(`${baseUrl}/api/dashboard/streams/${id}`, { cache: "no-store" })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Failed to load stream details")
  }

  const payload = (await response.json()) as DashboardStreamDetailsResponse
  return payload.stream
}

export default async function StreamDetailPage({ params }: StreamDetailPageProps) {
  const stream = await getStream(params.id)

  if (!stream) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 px-4 py-10 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-3xl">
        <Card className="border-border/40 bg-card/70 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{stream.title}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {stream.status}
              </Badge>
            </div>
            <CardDescription>
              {stream.category ? `${stream.category} stream` : "Stream details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Stream URL:</span> {stream.url}
            </p>
            {stream.startedAt && (
              <p>
                <span className="font-medium text-foreground">Started:</span> {new Date(stream.startedAt).toLocaleString()}
              </p>
            )}
            {stream.startsAt && (
              <p>
                <span className="font-medium text-foreground">Scheduled for:</span> {new Date(stream.startsAt).toLocaleString()}
              </p>
            )}
            {typeof stream.viewers === "number" && (
              <p>
                <span className="font-medium text-foreground">Viewers:</span> {stream.viewers}
              </p>
            )}
            {typeof stream.duration !== "undefined" && (
              <p>
                <span className="font-medium text-foreground">Duration:</span> {stream.duration ?? "—"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
