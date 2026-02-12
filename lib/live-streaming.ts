export type LiveStreamStatus = "live" | "scheduled"

export interface LiveStreamChannel {
  id: string
  title: string
  hostName: string
  category: string
  viewerCount: number
  status: LiveStreamStatus
  startsAt: string
  route: string
  coverImage: string
  tags: string[]
}

export const liveStreamingChannels: LiveStreamChannel[] = [
  {
    id: "live-grocery-1",
    title: "Fresh Produce Flash Sale",
    hostName: "RunAsh Farm Desk",
    category: "Fruits",
    viewerCount: 1240,
    status: "live",
    startsAt: new Date().toISOString(),
    route: "/grocery/live",
    coverImage: "/runash live.webp",
    tags: ["organic", "limited-time", "fresh"],
  },
  {
    id: "live-grocery-2",
    title: "Evening Pantry Refill",
    hostName: "RunAsh Kitchen Lab",
    category: "Pantry Staples",
    viewerCount: 0,
    status: "scheduled",
    startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    route: "/grocery/live",
    coverImage: "/runash live shopping.webp",
    tags: ["bundle", "family-pack"],
  },
]

export function getActiveLiveStreams() {
  return liveStreamingChannels.filter((stream) => stream.status === "live")
}
