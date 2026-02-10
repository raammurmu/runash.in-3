import { NextResponse } from "next/server"
import { parsePeriod, requireAnalyticsSession, seedFromContext, seededValue } from "../_lib"

type InsightType = "opportunity" | "optimization" | "warning" | "success"
type InsightImpact = "high" | "medium" | "low"

type Insight = {
  id: string
  type: InsightType
  title: string
  description: string
  impact: InsightImpact
  confidence: number
  action: string
  icon: "TrendingUp" | "Target" | "AlertTriangle" | "CheckCircle"
}

type RecommendationCategory = {
  category: string
  suggestions: string[]
}

type AIInsightsResponse = {
  insights: Insight[]
  recommendations: RecommendationCategory[]
}

export async function GET(request: Request) {
  const auth = await requireAnalyticsSession()
  if ("error" in auth) return auth.error

  const { searchParams } = new URL(request.url)
  const periodResult = parsePeriod(searchParams)
  if (!periodResult.ok) return periodResult.response

  const seed = seedFromContext(auth.userId, periodResult.period)

  const insights: Insight[] = [
    {
      id: `aud-ret-${seed % 997}`,
      type: "opportunity",
      title: "Increase returning viewers in peak window",
      description: "Viewers who rejoined within 24h were most active between 19:00-21:00 UTC.",
      impact: "high",
      confidence: seededValue(seed >>> 1, 76, 94),
      action: "Schedule your top-offer segment in the first 20 minutes of the stream.",
      icon: "TrendingUp",
    },
    {
      id: `chat-mod-${seed % 761}`,
      type: "optimization",
      title: "Moderation response can be faster",
      description: "Auto-moderation handled most flagged comments, but manual follow-up lagged.",
      impact: "medium",
      confidence: seededValue(seed >>> 2, 68, 89),
      action: "Enable pre-approved response snippets for moderators.",
      icon: "Target",
    },
    {
      id: `dropoff-${seed % 613}`,
      type: "warning",
      title: "Audience drop-off detected after 35 minutes",
      description: "Viewer retention dipped after long product explanations without interaction.",
      impact: "medium",
      confidence: seededValue(seed >>> 3, 62, 84),
      action: "Insert a live poll or Q&A every 10-12 minutes to sustain engagement.",
      icon: "AlertTriangle",
    },
    {
      id: `checkout-${seed % 431}`,
      type: "success",
      title: "Checkout conversion improved",
      description: "Shorter checkout guidance correlated with higher completed orders.",
      impact: "low",
      confidence: seededValue(seed >>> 4, 71, 95),
      action: "Reuse the streamlined checkout script in future sessions.",
      icon: "CheckCircle",
    },
  ]

  const recommendations: RecommendationCategory[] = [
    {
      category: "Content Strategy",
      suggestions: [
        "Open each stream with one high-demand product in the first 5 minutes.",
        "Use short recurring CTA segments every 8-10 minutes.",
      ],
    },
    {
      category: "Audience Growth",
      suggestions: [
        "Promote the next stream at the final 3-minute mark.",
        "Highlight loyalty perks for returning viewers in chat.",
      ],
    },
  ]

  const response: AIInsightsResponse = { insights, recommendations }

  return NextResponse.json(response)
}
