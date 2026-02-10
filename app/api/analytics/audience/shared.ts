import { NextResponse } from "next/server"
import { jsonError, seededValue } from "../_lib"
import type { AudienceDemographics } from "@/types/analytics"

const REGIONS = ["global", "na", "eu", "apac", "latam"] as const

type AudienceQuery = {
  startDate?: string
  endDate?: string
  channelId?: string
  region?: string
}

export function parseAudienceQuery(searchParams: URLSearchParams):
  | { ok: true; value: AudienceQuery }
  | { ok: false; response: NextResponse } {
  const startDate = searchParams.get("startDate")?.trim()
  const endDate = searchParams.get("endDate")?.trim()
  const channelId = searchParams.get("channelId")?.trim()
  const region = searchParams.get("region")?.trim().toLowerCase()

  if (startDate && Number.isNaN(Date.parse(startDate))) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid 'startDate' query parameter.", {
        startDate: "Expected an ISO-8601 date string.",
      }),
    }
  }

  if (endDate && Number.isNaN(Date.parse(endDate))) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid 'endDate' query parameter.", {
        endDate: "Expected an ISO-8601 date string.",
      }),
    }
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid date range.", {
        range: "startDate must be before or equal to endDate.",
      }),
    }
  }

  if (channelId && !/^[a-zA-Z0-9_-]{1,64}$/.test(channelId)) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid 'channelId' query parameter.", {
        channelId: "Use 1-64 characters: letters, numbers, '-' or '_'.",
      }),
    }
  }

  if (region && !REGIONS.includes(region as (typeof REGIONS)[number])) {
    return {
      ok: false,
      response: jsonError(400, "INVALID_QUERY", "Invalid 'region' query parameter.", {
        region: `Expected one of: ${REGIONS.join(", ")}`,
      }),
    }
  }

  return { ok: true, value: { startDate, endDate, channelId, region } }
}

export function audienceQuerySeedSuffix(query: AudienceQuery): string {
  return [query.channelId, query.region, query.startDate, query.endDate].filter(Boolean).join(":")
}

export function buildAudiencePayload(seed: number): AudienceDemographics {
  const ageGroups = [
    { range: "13-17", percentage: seededValue(seed >>> 1, 4, 10) },
    { range: "18-24", percentage: seededValue(seed >>> 2, 20, 34) },
    { range: "25-34", percentage: seededValue(seed >>> 3, 28, 40) },
    { range: "35-44", percentage: seededValue(seed >>> 4, 12, 22) },
    { range: "45+", percentage: seededValue(seed >>> 5, 8, 18) },
  ]

  const ageTotal = ageGroups.reduce((sum, item) => sum + item.percentage, 0)
  ageGroups[2].percentage += 100 - ageTotal

  const returningViewers = seededValue(seed >>> 6, 48, 78)

  return {
    ageGroups,
    genderDistribution: [
      { gender: "Male", percentage: seededValue(seed >>> 7, 42, 56) },
      { gender: "Female", percentage: seededValue(seed >>> 8, 36, 50) },
      { gender: "Non-binary", percentage: seededValue(seed >>> 9, 2, 8) },
    ],
    topCountries: [
      { country: "United States", viewers: seededValue(seed >>> 10, 1500, 3500), percentage: seededValue(seed >>> 11, 30, 44) },
      { country: "United Kingdom", viewers: seededValue(seed >>> 12, 600, 1900), percentage: seededValue(seed >>> 13, 10, 22) },
      { country: "India", viewers: seededValue(seed >>> 14, 550, 1800), percentage: seededValue(seed >>> 15, 8, 18) },
      { country: "Canada", viewers: seededValue(seed >>> 16, 400, 1300), percentage: seededValue(seed >>> 17, 6, 14) },
    ],
    deviceTypes: [
      { device: "Mobile", percentage: seededValue(seed >>> 18, 48, 70) },
      { device: "Desktop", percentage: seededValue(seed >>> 19, 22, 38) },
      { device: "Tablet", percentage: seededValue(seed >>> 20, 4, 12) },
      { device: "Smart TV", percentage: seededValue(seed >>> 21, 2, 8) },
    ],
    returningViewers,
    newViewers: 100 - returningViewers,
  }
}
