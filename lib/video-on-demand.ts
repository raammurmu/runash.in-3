export interface VideoOnDemandItem {
  id: string
  title: string
  durationSeconds: number
  publishedAt: string
  category: string
  route: string
  thumbnail: string
  views: number
}

export const groceryVideoOnDemand: VideoOnDemandItem[] = [
  {
    id: "vod-1",
    title: "Top 10 Organic Essentials for Weekly Shopping",
    durationSeconds: 620,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Essentials",
    route: "/grocery/live/recordings",
    thumbnail: "/runash live selling.webp",
    views: 1830,
  },
  {
    id: "vod-2",
    title: "Budget Meal Prep with RunAsh Store",
    durationSeconds: 910,
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "Meal Prep",
    route: "/grocery/live/recordings",
    thumbnail: "/runash live shopping.webp",
    views: 1390,
  },
]

export function getFeaturedVods(limit = 2) {
  return groceryVideoOnDemand
    .slice()
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}
