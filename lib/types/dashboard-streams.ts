export type DashboardStreamStatus = "live" | "scheduled" | "ended" | "cancelled"

export interface DashboardRecentStream {
  id: string
  title: string
  category?: string
  date: string
  viewers: number
  duration: string | null
  url: string
  status: DashboardStreamStatus
}

export interface DashboardScheduledStream {
  id: string
  title: string
  category?: string
  startsAt: string
  status: Extract<DashboardStreamStatus, "scheduled" | "cancelled">
}

export interface StartStreamRequest {
  title: string
  category?: string
}

export interface StartStreamResponse {
  id: string
  title: string
  category?: string
  url: string
  status: Extract<DashboardStreamStatus, "live">
  startedAt: string
}

export interface ScheduleStreamRequest {
  title: string
  category?: string
  startsAt: string
}

export interface ScheduleStreamResponse extends DashboardScheduledStream {}

export interface InviteCollaboratorRequest {
  streamId: string
  email: string
}

export interface InviteCollaboratorResponse {
  ok: true
  inviteId: string
  streamId: string
  email: string
  sentAt: string
}

export interface IntegrationKeyResponse {
  rtmpKey: string
}

export interface DashboardStreamsStore {
  recent: DashboardRecentStream[]
  scheduled: DashboardScheduledStream[]
  invites: Array<{ id: string; streamId: string; email: string; sentAt: string }>
}

export interface DashboardRecentStreamsResponse {
  streams: DashboardRecentStream[]
}

export interface DashboardScheduledStreamsResponse {
  streams: DashboardScheduledStream[]
}
