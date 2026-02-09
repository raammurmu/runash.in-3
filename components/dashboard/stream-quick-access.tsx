"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Video, Calendar, Clock, Users, Settings, Mail, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

type RecentStream = {
  id: string
  title: string
  date: string
  viewers?: number
  duration?: string
  url?: string
}

type ScheduledStream = {
  id: string
  title: string
  dateTime: string
  category: string
  status: "scheduled" | "cancelled"
}

const STREAM_CATEGORIES = [
  { value: "grocery", label: "Grocery" },
  { value: "sustainable", label: "Sustainable" },
  { value: "recipes", label: "Recipes" },
  { value: "gaming", label: "Gaming" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "entertainment", label: "Entertainment" },
] as const

type StreamCategory = (typeof STREAM_CATEGORIES)[number]["value"]

const DEFAULT_STREAM_CATEGORY: StreamCategory = STREAM_CATEGORIES[0].value
const STREAM_CATEGORY_VALUES = new Set<StreamCategory>(STREAM_CATEGORIES.map(({ value }) => value))

function isStreamCategory(value: string): value is StreamCategory {
  return STREAM_CATEGORY_VALUES.has(value as StreamCategory)
}

export function StreamQuickAccess() {
  const router = useRouter()
  const [streamTitle, setStreamTitle] = useState("")
  const [streamCategory, setStreamCategory] = useState<StreamCategory>(DEFAULT_STREAM_CATEGORY)
  const [recentStreams, setRecentStreams] = useState<RecentStream[]>([])
  const [scheduledStreams, setScheduledStreams] = useState<ScheduledStream[]>([])
  const [loading, setLoading] = useState(false)

  // Scheduling
  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleCategory, setScheduleCategory] = useState<StreamCategory>(DEFAULT_STREAM_CATEGORY)
  const [scheduleDateTime, setScheduleDateTime] = useState("")

  // Invite
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteStreamId, setInviteStreamId] = useState<string | null>(null)

  // Integration
  const [integrationKey, setIntegrationKey] = useState<string | null>(null)
  const [integrating, setIntegrating] = useState(false)

  useEffect(() => {
    async function fetchStreams() {
      setLoading(true)
      try {
        const [recentRes, scheduledRes] = await Promise.all([
          fetch("/api/dashboard/streams/recent"),
          fetch("/api/dashboard/streams/scheduled"),
        ])

        if (!recentRes.ok) throw new Error("Failed to fetch recent streams")
        if (!scheduledRes.ok) throw new Error("Failed to fetch scheduled streams")

        const recentJson = await recentRes.json()
        const scheduledJson = await scheduledRes.json()

        setRecentStreams(Array.isArray(recentJson) ? recentJson : [])
        setScheduledStreams(Array.isArray(scheduledJson) ? scheduledJson : [])
      } catch (err: any) {
        console.error(err)
        toast({ title: "Error", description: err?.message || "Could not load streams." })
      } finally {
        setLoading(false)
      }
    }

    fetchStreams()
  }, [])

  const handleStartStream = async () => {
    if (!streamTitle) {
      toast({ title: "Missing Title", description: "Please enter a stream title." })
      return
    }

    try {
      setLoading(true)
      const selectedCategory = STREAM_CATEGORY_VALUES.has(streamCategory) ? streamCategory : DEFAULT_STREAM_CATEGORY
      const res = await fetch("/api/dashboard/streams/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: streamTitle, category: selectedCategory }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to start stream")
      }

      const data = await res.json()
      toast({
        title: "Stream Started",
        description: `Your stream "${streamTitle}" is now live.`,
      })

      // Update recent streams locally
      setRecentStreams((r) => [{ id: data.id, title: streamTitle, date: "Live now", viewers: 0, url: data.url }, ...r])
      setStreamTitle("")
      // Navigate to stream detail/player page (adjust route to your app)
      router.push(`/stream/${data.id}`)
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message || "Could not start stream." })
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleStream = async () => {
    if (!scheduleTitle || !scheduleDateTime) {
      toast({ title: "Missing Data", description: "Please provide title and date/time for scheduling." })
      return
    }

    try {
      setLoading(true)
      const selectedCategory = STREAM_CATEGORY_VALUES.has(scheduleCategory) ? scheduleCategory : DEFAULT_STREAM_CATEGORY
      const res = await fetch("/api/dashboard/streams/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scheduleTitle,
          category: selectedCategory,
          dateTime: scheduleDateTime,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to schedule stream")
      }

      const newScheduled = await res.json()
      toast({ title: "Scheduled", description: `${newScheduled.title} scheduled for ${newScheduled.dateTime}` })
      setScheduledStreams((s) => [newScheduled, ...s])
      setScheduleTitle("")
      setScheduleDateTime("")
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message || "Could not schedule stream." })
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteStreamId) {
      toast({ title: "Missing Data", description: "Select a stream and provide an email." })
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/dashboard/streams/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: inviteStreamId, email: inviteEmail }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to send invite")
      }

      toast({ title: "Invite Sent", description: `Invitation sent to ${inviteEmail}` })
      setInviteEmail("")
      setInviteStreamId(null)
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message || "Could not send invite." })
    } finally {
      setLoading(false)
    }
  }

  const handleGetIntegration = async () => {
    try {
      setIntegrating(true)
      const res = await fetch("/api/dashboard/streams/integrate", {
        method: "POST",
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || "Failed to get integration")
      }
      const data = await res.json()
      setIntegrationKey(data.rtmpKey)
      toast({ title: "Integration Ready", description: "Received RTMP key (demo)." })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message || "Could not get integration." })
    } finally {
      setIntegrating(false)
    }
  }

  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Streaming
        </CardTitle>
        <CardDescription>Start a new stream, schedule broadcasts, invite collaborators, or integrate with your encoder</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Start Live Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500" disabled={loading}>
              <Video className="mr-2 h-4 w-4" />
              Go Live
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Live Stream</DialogTitle>
              <DialogDescription>Configure your stream settings and go live in seconds.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stream-title">Stream Title</Label>
                <Input
                  id="stream-title"
                  placeholder="Enter your stream title..."
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <RadioGroup
                  value={streamCategory}
                  onValueChange={(value) => setStreamCategory(isStreamCategory(value) ? value : DEFAULT_STREAM_CATEGORY)}
                >
                  {STREAM_CATEGORIES.map((category) => {
                    const categoryId = `stream-category-${category.value}`

                    return (
                      <div key={category.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={category.value} id={categoryId} />
                        <Label htmlFor={categoryId}>{category.label}</Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500"
                onClick={handleStartStream}
                disabled={loading}
              >
                Start Streaming
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Stream - inline controls */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule a Stream
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Title" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} />
            <Input type="datetime-local" value={scheduleDateTime} onChange={(e) => setScheduleDateTime(e.target.value)} />
            <div className="flex items-center space-x-2">
              <select
                value={scheduleCategory}
                onChange={(e) => setScheduleCategory(isStreamCategory(e.target.value) ? e.target.value : DEFAULT_STREAM_CATEGORY)}
                className="rounded-md border px-2 py-1"
              >
                {STREAM_CATEGORIES.map((category) => (
                  <option key={`schedule-category-${category.value}`} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <Button onClick={handleScheduleStream} disabled={loading}>
                Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Invite collaborators */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invite Collaborators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <select
              value={inviteStreamId ?? ""}
              onChange={(e) => setInviteStreamId(e.target.value || null)}
              className="rounded-md border px-2 py-1"
            >
              <option value="">Select a stream (scheduled or recent)</option>
              {scheduledStreams.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {new Date(s.dateTime).toLocaleString()}
                </option>
              ))}
              {recentStreams.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} — {r.date}
                </option>
              ))}
            </select>
            <Input placeholder="collaborator@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Button onClick={handleInvite} disabled={loading}>
              Send Invite
            </Button>
          </div>
        </div>

        {/* Recent Streams */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Recent Streams</h3>
          <div className="space-y-2">
            {recentStreams.length === 0 && !loading ? (
              <div className="text-xs text-muted-foreground">No recent streams yet.</div>
            ) : (
              recentStreams.map((stream) => (
                <div key={stream.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium truncate">{stream.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{stream.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stream.duration ?? "—"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {stream.viewers ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stream.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(stream.url, "_blank")}>
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Streams */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Upcoming Streams</h3>
          <div className="space-y-2">
            {scheduledStreams.length === 0 && !loading ? (
              <div className="text-xs text-muted-foreground">No upcoming streams scheduled.</div>
            ) : (
              scheduledStreams.map((stream) => (
                <div key={stream.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium truncate">{stream.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(stream.dateTime).toLocaleString()}</span>
                      <Badge
                        variant="outline"
                        className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400"
                      >
                        Scheduled
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      // Quick "copy link" for a scheduled stream
                      const link = `${window.location.origin}/stream/${stream.id}`
                      navigator.clipboard.writeText(link)
                      toast({ title: "Link Copied", description: link })
                    }}>
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="w-full flex gap-2">
          <Button variant="outline" className="w-full" onClick={() => router.push("/schedule")}>
            View All Streams
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleGetIntegration} disabled={integrating}>
            {integrationKey ? "Integration Ready" : "Get Integration"}
          </Button>
        </div>
        {integrationKey && (
          <div className="text-xs text-muted-foreground">
            Demo RTMP Key: <code className="bg-muted px-1 rounded">{integrationKey}</code>
          </div>
        )}
      </CardFooter>
    </Card>
  )
  }
