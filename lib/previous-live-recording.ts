export interface PreviousLiveRecording {
  id: string
  title: string
  recordedAt: string
  hostName: string
  clipCount: number
  totalPurchases: number
  route: string
}

export const previousLiveRecordings: PreviousLiveRecording[] = [
  {
    id: "recording-1",
    title: "Morning Farm Fresh Hour",
    recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    hostName: "Aarav",
    clipCount: 7,
    totalPurchases: 214,
    route: "/grocery/live/recordings",
  },
  {
    id: "recording-2",
    title: "Seasonal Fruits Mega Showcase",
    recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    hostName: "Maya",
    clipCount: 11,
    totalPurchases: 379,
    route: "/grocery/live/recordings",
  },
]

export function getRecentRecordings(limit = 2) {
  return previousLiveRecordings
    .slice()
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .slice(0, limit)
}
