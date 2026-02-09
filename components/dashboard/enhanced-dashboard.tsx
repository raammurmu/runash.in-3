"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  BarChart3,
  Users,
  Video,
  Eye,
  Share2,
  Play,
  Pause,
  MoreHorizontal,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Award,
  Target,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import type {
  DashboardRecentStream,
  DashboardRecentStreamsResponse,
  InviteCollaboratorResponse,
  StartStreamResponse,
} from "@/lib/types/dashboard-streams"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={`overflow-hidden border-border/40 bg-card/50 backdrop-blur ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
          {value}
        </div>
        {trend && (
          <p className="mt-1 text-xs flex items-center gap-1">
            <span className={`inline-flex items-center ${trend.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{description}</span>
          </p>
        )}
        {!trend && description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}

type StreamCardData = DashboardRecentStream & { thumbnail_url?: string }

function StreamCard({ stream }: { stream: StreamCardData }) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-200">
      <div className="relative aspect-video bg-gradient-to-br from-orange-500/20 to-amber-400/20">
        {stream.thumbnail_url ? (
          <img
            src={stream.thumbnail_url || "/placeholder.svg"}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-black/20 backdrop-blur hover:bg-black/40"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
            </Button>
          </div>
        )}
        {stream.status === "live" && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
            LIVE
          </Badge>
        )}
        <div className="absolute top-2 right-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 backdrop-blur hover:bg-black/40">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Separator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start text-red-600" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Stream</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this stream? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-2">{stream.title}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {stream.viewers?.toLocaleString?.() ?? stream.viewers}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {stream.duration}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{stream.date}</span>
            <Badge variant={stream.status === "live" ? "destructive" : "secondary"} className="text-xs">
              {stream.status?.toUpperCase?.() ?? stream.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-400 text-white text-xs">
              {activity.user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between space-x-4">
            <Avatar>
              <AvatarImage src={activity.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{activity.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{activity.user.name}</h4>
              <p className="text-sm text-muted-foreground">Active viewer</p>
              <div className="flex items-center pt-2">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />
                <span className="text-xs text-muted-foreground">Recent activity</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">{activity.action}</span>{" "}
          {activity.target && <span className="font-medium">{activity.target}</span>}
        </p>
        <p className="text-xs text-muted-foreground">{activity.time}</p>
      </div>
      <Badge
        variant="outline"
        className={`text-xs ${activity.type === "comment" && "border-blue-200 text-blue-700"} ${
          activity.type === "follow" && "border-green-200 text-green-700"
        } ${activity.type === "subscription" && "border-purple-200 text-purple-700"} ${
          activity.type === "donation" && "border-amber-200 text-amber-700"
        }`}
      >
        {activity.type}
      </Badge>
    </div>
  )
}

export function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any | null>(null)
  const [recentStreams, setRecentStreams] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [monthlyGoals, setMonthlyGoals] = useState<any[]>([])
  const [user, setUser] = useState<any | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)

  // Dialog state for actions
  const [startDialogOpen, setStartDialogOpen] = useState(false)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  // Forms
  const [startTitle, setStartTitle] = useState("")
  const [startCategory, setStartCategory] = useState("Gaming")

  const [scheduleTitle, setScheduleTitle] = useState("")
  const [scheduleCategory, setScheduleCategory] = useState("Gaming")
  const [scheduleDate, setScheduleDate] = useState("")

  const [inviteEmails, setInviteEmails] = useState("")

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  useEffect(() => {
    loadDashboardData()

    // Poll for updates every 30s for "real-time" status
    const id = setInterval(() => {
      loadDashboardData()
    }, 30000)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // 1) fetch current user (real)
      const meRes = await fetch("/api/me")
 
      let resolvedUserId: string | number | undefined

      let me: any | null = null

      if (meRes.ok) {
        me = await meRes.json()
        setUser(me)
        resolvedUserId = me?.id
      } else {
        setUser(null)
      }

 
      // 2) fetch dashboard data via authenticated session (cookies)
      const [statsRes, streamsRes, activityRes, achievementsRes, goalsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/streams?limit=12"),
        fetch("/api/dashboard/activity?limit=10"),
        fetch("/api/dashboard/achievements"),
        fetch("/api/dashboard/goals"),

 
      const effectiveUserId = resolvedUserId || user?.id || undefined

      const userId = me?.id || user?.id || undefined


      // 2) fetch dashboard data using real user id when available
      const headers: Record<string, string> = {}
      if (effectiveUserId) headers["x-user-id"] = String(effectiveUserId)

      const [statsRes, streamsRes, activityRes, achievementsRes, goalsRes] = await Promise.all([
        fetch("/api/dashboard/stats", { headers }),
        fetch("/api/dashboard/streams/recent?limit=12", { headers }),
        fetch("/api/dashboard/activity?limit=10", { headers }),
        fetch("/api/dashboard/achievements", { headers }),
        fetch("/api/dashboard/goals", { headers }),

      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      } else {
        setStats(null)
      }

      if (streamsRes.ok) {
        const streamsData = (await streamsRes.json()) as DashboardRecentStreamsResponse
        setRecentStreams(Array.isArray(streamsData.streams) ? streamsData.streams : [])
      } else {
        setRecentStreams([])
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setActivities(activityData)
      } else {
        setActivities([])
      }

      if (achievementsRes.ok) {
        const ach = await achievementsRes.json()
        setAchievements(ach)
      } else {
        // fallback sample achievements computed from stats
        setAchievements([
          { title: "First Stream", description: "Completed your first live stream", unlocked: true },
          {
            title: "100 Followers",
            description: "Reached 100 followers",
            unlocked: stats?.followers ? stats.followers >= 100 : false,
          },
          {
            title: "Viral Content",
            description: "Stream reached 10K views",
            unlocked: stats?.totalViews ? stats.totalViews >= 10000 : false,
          },
        ])
      }

      if (goalsRes.ok) {
        const goals = await goalsRes.json()
        setMonthlyGoals(goals)
      } else {
        setMonthlyGoals([
          { name: "Streaming Hours", current: 45, target: 60, unit: "hours" },
          { name: "New Followers", current: stats?.followers || 0, target: 300, unit: "followers" },
          { name: "Revenue Goal", current: stats?.revenue || 0, target: 2000, unit: "$" },
        ])
      }

      setLastUpdatedAt(Date.now())
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Actions
  const handleStartStreaming = async () => {
    try {
      setIsLoading(true)
      const payload = { title: startTitle || "Untitled Stream", category: startCategory }
      const res = await fetch("/api/dashboard/streams/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const started = (await res.json()) as StartStreamResponse
        toast({ title: "Stream started", description: `${started.title} is now ${started.status}.` })
        setStartDialogOpen(false)
        // optimistic refresh
        await loadDashboardData()
      } else {
        const err = await res.text()
        toast({ title: "Failed to start", description: err || "Unknown error", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Unable to start stream", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScheduleStream = async () => {
    try {
      setIsLoading(true)
      const payload = { title: scheduleTitle || "Scheduled Stream", category: scheduleCategory, startsAt: scheduleDate }
      const res = await fetch("/api/dashboard/streams/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast({ title: "Scheduled", description: "Stream scheduled successfully." })
        setScheduleDialogOpen(false)
        await loadDashboardData()
      } else {
        const err = await res.text()
        toast({ title: "Failed to schedule", description: err || "Unknown error", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Unable to schedule stream", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteCollaborators = async () => {
    try {
      setIsLoading(true)
      const emails = inviteEmails.split(",").map((e) => e.trim()).filter(Boolean)
 
      const res = await fetch("/api/collaborators/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      })
      if (res.ok) {
        toast({ title: "Invites sent", description: `${emails.length} collaborator(s) invited.` })

      const targetStreamId = recentStreams[0]?.id

      if (!targetStreamId) {
        toast({ title: "Invite failed", description: "No stream available to invite collaborators to.", variant: "destructive" })
        return
      }

      const inviteResults = await Promise.all(
        emails.map(async (email) => {
          const response = await fetch("/api/dashboard/streams/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(user?.id ? { "x-user-id": String(user.id) } : {}) },
            body: JSON.stringify({ streamId: targetStreamId, email }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText || `Failed to invite ${email}`)
          }

          return (await response.json()) as InviteCollaboratorResponse
        }),
      )

      if (inviteResults.length > 0) {
        toast({ title: "Invites sent", description: `${inviteResults.length} collaborator(s) invited.` })

        setInviteDialogOpen(false)
        setInviteEmails("")
      } else {
        toast({ title: "Invite failed", description: "No collaborator invites were sent.", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Unable to send invites", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const statsCards = stats
    ? [
        {
          title: "Total Views",
          value: stats.totalViews?.toLocaleString?.() ?? stats.totalViews ?? 0,
          icon: <Eye />,
          description: "from last month",
          trend: { value: stats.trends?.views ?? 0, isPositive: (stats.trends?.views ?? 0) >= 0 },
        },
        {
          title: "Followers",
          value: stats.followers?.toLocaleString?.() ?? stats.followers ?? 0,
          icon: <Users />,
          description: "from last month",
          trend: { value: stats.trends?.followers ?? 0, isPositive: (stats.trends?.followers ?? 0) >= 0 },
        },
        {
          title: "Live Streams",
          value: stats.liveStreams?.toString?.() ?? stats.liveStreams ?? 0,
          icon: <Video />,
          description: "this month",
          trend: { value: stats.trends?.streams ?? 0, isPositive: (stats.trends?.streams ?? 0) >= 0 },
        },
        {
          title: "Revenue",
          value: `$${(stats.revenue ?? 0).toLocaleString?.() ?? stats.revenue ?? 0}`,
          icon: <DollarSign />,
          description: "this month",
          trend: { value: stats.trends?.revenue ?? 0, isPositive: (stats.trends?.revenue ?? 0) >= 0 },
        },
      ]
    : []

  const anyLive = recentStreams.some((s) => s.status === "live")
  const liveStream = recentStreams.find((s) => s.status === "live")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
              {getGreeting()}{user ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            {user && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
          </div>
          <p className="text-muted-foreground">
            {anyLive
              ? `You are live now: "${liveStream?.title}" — ${liveStream?.viewers?.toLocaleString?.() ?? liveStream?.viewers} viewers`
              : "Welcome back! Here's what's happening with your streams."}
            {lastUpdatedAt && !isLoading && (
              <span className="ml-2 text-xs text-muted-foreground">· updated {new Date(lastUpdatedAt).toLocaleTimeString()}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Target className="mr-2 h-4 w-4" />
                Quick Actions
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Quick Actions</SheetTitle>
                <SheetDescription>Quickly access common streaming actions and tools.</SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500">
                      <Video className="mr-2 h-4 w-4" />
                      Start New Stream
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Start Live Stream</DialogTitle>
                      <DialogDescription>Configure your stream settings and go live in seconds.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stream Title</label>
                        <input
                          value={startTitle}
                          onChange={(e) => setStartTitle(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Enter your stream title..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                          value={startCategory}
                          onChange={(e) => setStartCategory(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option>Gaming</option>
                          <option>Education</option>
                          <option>Technology</option>
                          <option>Entertainment</option>
                        </select>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500"
                        onClick={handleStartStreaming}
                      >
                        Start Streaming
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Stream
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule Stream</DialogTitle>
                      <DialogDescription>Pick a date and time to schedule your stream.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stream Title</label>
                        <input
                          value={scheduleTitle}
                          onChange={(e) => setScheduleTitle(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Enter your stream title..."
                        />
                      </div>
                         <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                          value={scheduleCategory}
                          onChange={(e) => setScheduleCategory(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option>Gaming</option>
                          <option>Education</option>
                          <option>Technology</option>
                          <option>Entertainment</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Date & Time</label>
                        <input
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          type="datetime-local"
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <Button className="w-full" onClick={handleScheduleStream}>
                        Schedule Stream
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Users className="mr-2 h-4 w-4" />
                      Invite Collaborators
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite Collaborators</DialogTitle>
                      <DialogDescription>Invite by email (comma separated)</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Emails</label>
                        <input
                          value={inviteEmails}
                          onChange={(e) => setInviteEmails(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="alice@example.com, bob@example.com"
                        />
                      </div>
                      <Button className="w-full" onClick={handleInviteCollaborators}>
                        Send Invites
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => loadDashboardData()}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500">
                <Video className="mr-2 h-4 w-4" />
                Quick Go Live
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Quick Start</DialogTitle>
                <DialogDescription>Start streaming with a title and category in one click.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream Title</label>
                  <input
                    value={startTitle}
                    onChange={(e) => setStartTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter your stream title..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={startCategory}
                    onChange={(e) => setStartCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option>Gaming</option>
                    <option>Education</option>
                    <option>Technology</option>
                    <option>Entertainment</option>
                  </select>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500"
                  onClick={handleStartStreaming}
                >
                  Start Streaming
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : statsCards.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                description={stat.description}
                trend={stat.trend}
              />
                ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Streams */}
        <div className="lg:col-span-2">
          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Recent Streams
                </CardTitle>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>All Streams</DrawerTitle>
                      <DrawerDescription>View and manage all your streams in one place.</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {recentStreams.map((stream) => (
                            <CarouselItem key={stream.id} className="md:basis-1/2 lg:basis-1/3">
                              <StreamCard stream={stream} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-border/40">
                      <div className="aspect-video bg-gray-200 animate-pulse" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {recentStreams.slice(0, 4).map((stream) => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <div>
          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-3 w-3/4 mb-1" />
                          <Skeleton className="h-2 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  activities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements & Goals */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>Your streaming milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${achievement.unlocked ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-amber-400 text-white">
                      <Star className="mr-1 h-3 w-3" />
                      Unlocked
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

          <Card className="border-border/40 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Monthly Goals
            </CardTitle>
            <CardDescription>Track your progress towards monthly targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {monthlyGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{goal.name}</span>
                    <span className="text-muted-foreground">
                      {goal.unit === "$"
                        ? `$${goal.current}/$${goal.target}`
                        : `${goal.current}/${goal.target} ${goal.unit}`}
                    </span>
                  </div>
                  <Progress value={Math.min(100, ((goal.current ?? 0) / (goal.target || 1)) * 100)} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
