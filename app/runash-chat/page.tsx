"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import Hero from "@/components/home/hero"
import ProductCarousel from "@/components/home/products-carousel"
import AgentCard from "@/components/home/agent-card"
import CTASection from "@/components/home/cta-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  Bot,
  Camera,
  CreditCard,
  Leaf,
  PackageSearch,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Upload,
  User,
  Zap,
  LogIn,
  LogOut,
  PanelRight,
  Sidebar,
} from "lucide-react"

type ChatPreviewMessage = {
  id: string | number
  role: "assistant" | "user"
  content: string
  created_at?: string
}

type ChatProduct = {
  id: string
  name: string
  price: number
  image: string
  sustainability_score: number
}

type LiveAgent = {
  id: string
  name: string
  tagline: string
  avatar: string
  online: boolean
}

type ChatQuickPrompt = {
  id: string
  label: string
  description: string
  prompt: string
  icon: React.ComponentType<{ className?: string }>
}

type CurrentUser = {
  id: string
  name: string
  avatar: string | null
  email: string | null
  role: string | null
}

export default function RunashChatPage() {
  const router = useRouter()
  const { data: authSession, status: authStatus } = useSession()
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [messagesPreview, setMessagesPreview] = useState<ChatPreviewMessage[]>([])
  const [loadingSession, setLoadingSession] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [products, setProducts] = useState<ChatProduct[]>([])
  const [agents, setAgents] = useState<LiveAgent[]>([])
  const [attachmentName, setAttachmentName] = useState("")
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [productDemoOpen, setProductDemoOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false)

  const quickPrompts: ChatQuickPrompt[] = useMemo(
    () => [
      {
        id: "bundle",
        label: "Build Bundle",
        description: "Create high-conversion bundles with upsells",
        prompt: "Create a high-converting organic breakfast bundle and suggest two upsells under $30.",
        icon: ShoppingCart,
      },
      {
        id: "checkout",
        label: "Checkout Assist",
        description: "Guide payment and reduce checkout drop-off",
        prompt: "Act as checkout assistant and help complete a secure payment with cart summary and next steps.",
        icon: CreditCard,
      },
      {
        id: "order-followup",
        label: "Post-Purchase",
        description: "Handle order updates and support questions",
        prompt: "Handle a post-purchase support request: order tracking, ETA, and return options.",
        icon: PackageSearch,
      },
    ],
    [],
  )

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setLoadingSession(false)
      setCurrentUser(null)
      return
    }

    ;(async () => {
      setLoadingSession(true)
      try {
        const meRes = await fetch("/api/me")
        if (meRes.ok) {
          const me = (await meRes.json()) as CurrentUser
          setCurrentUser(me)
        }

        const res = await fetch("/api/sessions/recent")
        if (!res.ok) throw new Error("no recent session")
        const data = await res.json()
        if (data?.id) {
          setSessionId(data.id)
          const msgs = await fetch(`/api/messages/session/${data.id}?limit=4`)
          if (msgs.ok) {
            const jl = await msgs.json()
            setMessagesPreview(Array.isArray(jl) ? (jl as ChatPreviewMessage[]) : [])
          }
        }
      } catch {
        // ignore and allow starting a new session
      } finally {
        setLoadingSession(false)
      }
    })()

    ;(async () => {
      try {
        const res = await fetch("/api/products?limit=8")
        if (!res.ok) throw new Error("no products")
        const data = await res.json()
        setProducts(Array.isArray(data) ? (data as ChatProduct[]) : [])
      } catch {
        setProducts([
          { id: "p-1", name: "Organic Quinoa", price: 12.99, image: "/placeholder.svg?height=160&width=240", sustainability_score: 9 },
          { id: "p-2", name: "Organic Avocado (2pcs)", price: 8.99, image: "/placeholder.svg?height=160&width=240", sustainability_score: 8 },
          { id: "p-3", name: "Reusable Produce Bags (5-pack)", price: 6.5, image: "/placeholder.svg?height=160&width=240", sustainability_score: 10 },
        ])
      }
    })()

    setAgents([
      {
        id: "a1",
        name: "Runa — Live Commerce Host",
        tagline: "Product discovery, live demos & upsells",
        avatar: "/placeholder.svg?height=96&width=96",
        online: true,
      },
      {
        id: "a2",
        name: "Ash — Sustainability Expert",
        tagline: "Recipes, sourcing & carbon tips",
        avatar: "/placeholder.svg?height=96&width=96",
        online: false,
      },
      {
        id: "a3",
        name: "Murmur — Retail Ops",
        tagline: "Inventory, pricing & automation",
        avatar: "/placeholder.svg?height=96&width=96",
        online: true,
      },
    ])
  }, [authStatus])

  function startChatWithPrompt(initialPrompt?: string) {
    ;(async () => {
      try {
        let sid = sessionId
        if (!sid) {
          const res = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Live Agent" }),
          })
          const created = await res.json()
          sid = created?.id
          setSessionId(sid ?? null)
        }

        if (initialPrompt) {
          const cleanPrompt = initialPrompt.trim()
          if (cleanPrompt) {
            localStorage.setItem("runash_initial_prompt", cleanPrompt)
          }
        }

        router.push(sid ? `/chat?sessionId=${sid}` : "/chat")
      } catch {
        router.push("/chat")
      }
    })()
  }

  useEffect(() => {
    if (authStatus !== "authenticated") return
    if (!sessionId) return

    const autoStart = localStorage.getItem("runash_auto_start")
    if (autoStart !== "1") return

    localStorage.removeItem("runash_auto_start")
    router.push(`/chat?sessionId=${sessionId}`)
  }, [authStatus, sessionId, router])

  const relativeTime = (timestamp?: string) => {
    if (!timestamp) return "just now"
    const delta = Date.now() - new Date(timestamp).getTime()
    if (Number.isNaN(delta)) return "just now"
    const minutes = Math.max(Math.round(delta / 60000), 0)
    if (minutes < 1) return "now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.round(hours / 24)}d ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 dark:from-gray-950 dark:to-gray-900">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-gray-950/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-orange-600 to-yellow-500 p-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-2xl font-bold text-transparent">RunAsh Live Commerce</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agentic shopping experiences — live demos, recommendations, and checkout assist</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authStatus === "authenticated" ? (
              <Badge variant="secondary" className="max-w-[220px] truncate">
                {currentUser?.email || authSession?.user?.email || "Signed in"}
              </Badge>
            ) : (
              <Badge variant="outline">Guest mode</Badge>
            )}

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Suggestions
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Popular agent suggestions</div>
                  {quickPrompts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="w-full rounded-md border p-2 text-left text-xs transition-colors hover:bg-orange-50 dark:hover:bg-gray-900"
                      onClick={() => startChatWithPrompt(item.prompt)}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-gray-500">{item.description}</div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost">Upgrade</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upgrade dialog card</DialogTitle>
                  <DialogDescription>Unlock advanced commerce agents, payment orchestration, and premium support workflows.</DialogDescription>
                </DialogHeader>
                <Card className="p-4">
                  <div className="mb-2 text-sm font-semibold">Pro commerce plan includes:</div>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li>• Agentic upsell automation with custom prompts</li>
                    <li>• Live checkout assistant + handoff to RunAsh Pay</li>
                    <li>• Advanced operator profile and performance insights</li>
                  </ul>
                </Card>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>Maybe later</Button>
                  <Button className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white" onClick={() => router.push("/pricing")}>Get Started</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Profile">
                  <User className="h-4 w-4" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent align="end">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentUser?.avatar || authSession?.user?.image || "/placeholder-user.jpg"} alt="Profile" />
                    <AvatarFallback>RA</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-semibold">{currentUser?.name || authSession?.user?.name || "RunAsh Operator"}</div>
                    <div className="text-xs text-gray-500">{currentUser?.email || "Profile, settings, and agent preferences"}</div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            {authStatus === "authenticated" ? (
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <Button variant="outline" onClick={() => signIn(undefined, { callbackUrl: "/runash-chat" })}>
                <LogIn className="mr-2 h-4 w-4" /> Login with RunAsh
              </Button>
            )}

            <Button
              onClick={() => {
                if (authStatus !== "authenticated") {
                  signIn(undefined, { callbackUrl: "/runash-chat" })
                  return
                }
                startChatWithPrompt()
              }}
              className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white"
            >
              Live Agent Start
            </Button>

            <Button
              variant="outline"
              onClick={() => setDesktopSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex"
            >
              {desktopSidebarCollapsed ? (
                <>
                  <Sidebar className="mr-2 h-4 w-4" /> Show Sidebar
                </>
              ) : (
                <>
                  <PanelRight className="mr-2 h-4 w-4" /> Hide Sidebar
                </>
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Sidebar className="mr-2 h-4 w-4" /> Sidebar
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90vw] overflow-y-auto sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Chat Sidebar</SheetTitle>
                  <SheetDescription>Suggestions, mini preview, and commerce playbook.</SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-4">
                  <Card className="p-4">
                    <h4 className="mb-2 font-semibold">Quick actions</h4>
                    <div className="space-y-2">
                      {quickPrompts.map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => startChatWithPrompt(item.prompt)}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="mb-2 font-semibold">Mini Chat Preview</h4>
                    <ScrollArea className="max-h-56 rounded-md border p-3">
                      <div className="space-y-2">
                        {loadingSession && <div className="text-sm text-gray-500">Loading preview...</div>}
                        {!loadingSession && messagesPreview.length === 0 && (
                          <div className="text-sm text-gray-600">No messages yet.</div>
                        )}
                        {messagesPreview.map((message) => (
                          <div key={message.id} className="rounded-md border p-2 text-xs">
                            <p className="line-clamp-3 text-gray-700 dark:text-gray-300">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className={`container mx-auto grid grid-cols-1 gap-6 px-4 py-10 ${desktopSidebarCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}>
        <section className="space-y-6 lg:col-span-2">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{authStatus === "authenticated" ? "Authenticated session active" : "Login recommended"}</AlertTitle>
            <AlertDescription>
              {authStatus === "authenticated"
                ? "You are signed in. Commerce and payment actions can be linked to your user session."
                : "Sign in with your RunAsh account to enable full session history, secure payment handoff, and personalized agent responses."}
            </AlertDescription>
          </Alert>

          <Hero
            title="Turn browsers into buyers with human-like live agents"
            subtitle="Host guided shopping sessions, demo products, recommend bundles, and convert with context-aware AI — all linked to your inventory and payment flows."
            primaryAction={() => startChatWithPrompt("Start a live commerce session: show popular organic breakfast bundles and recommend upsells")}
            secondaryAction={() => setProductDemoOpen(true)}
          />

          <Card className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Featured products</h3>
              <Button variant="outline" size="sm" onClick={() => setProductDemoOpen(true)}>
                <PlayCircle className="mr-2 h-4 w-4" /> Product demo
              </Button>
            </div>
            <ProductCarousel items={products} />
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Agents</h3>
              <div className="text-sm text-gray-500">Hosted & AI-assisted</div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onStart={() => startChatWithPrompt(`Connect me to ${agent.name} for product recommendations and live demos`)}
                />
              ))}
            </div>
          </Card>

          <CTASection
            title="Go agentic — scale live commerce"
            bullets={[
              "AI-powered live selling: product demos, recommendations, and checkout assistance",
              "Seamless session continuity — switch from marketing to live support without losing context",
              "Integrate with Neon DB inventory, OpenAI, and your payment provider",
            ]}
            onAction={() => router.push("/get-started")}
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => router.push("/get-started")}>Get Started</Button>
            <Button variant="outline" onClick={() => router.push("/payment/runash-pay")}>Open RunAsh Pay</Button>
          </div>
        </section>

        <aside className={`space-y-6 ${desktopSidebarCollapsed ? "hidden" : "hidden lg:block"}`}>
          <Card className="p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold">Mini Chat Preview</h4>
                <div className="text-xs text-gray-500">ChatGPT-style continuity for commerce, profile, and payment journeys.</div>
              </div>
              <Badge variant="secondary" className="whitespace-nowrap">
                {sessionId ? `Session #${sessionId}` : "New session"}
              </Badge>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border bg-orange-50 p-2 dark:bg-gray-900">
                <div className="font-medium text-orange-700 dark:text-orange-400">Messages</div>
                <div className="text-gray-600 dark:text-gray-400">{messagesPreview.length || 0} in preview</div>
              </div>
              <div className="rounded-md border bg-green-50 p-2 dark:bg-gray-900">
                <div className="font-medium text-green-700 dark:text-green-400">Agent mode</div>
                <div className="text-gray-600 dark:text-gray-400">Commerce + payment</div>
              </div>
            </div>

            <ScrollArea className="max-h-64 rounded-md border p-3">
              <div className="space-y-2">
                {loadingSession && <div className="text-sm text-gray-500">Loading preview...</div>}
                {!loadingSession && messagesPreview.length === 0 && (
                  <div className="text-sm text-gray-600">No messages yet — start a session to see previews</div>
                )}
                {messagesPreview.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-md border p-2 text-xs ${message.role === "user" ? "bg-orange-50 dark:bg-gray-900" : "bg-white dark:bg-gray-900"}`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`font-medium ${message.role === "assistant" ? "text-orange-700 dark:text-orange-400" : "text-gray-700 dark:text-gray-200"}`}>
                        {message.role === "assistant" ? "RunAsh Agent" : "You"}
                      </span>
                      <span className="text-[11px] text-gray-500">{relativeTime(message.created_at)}</span>
                    </div>
                    <p className="line-clamp-3 text-gray-700 dark:text-gray-300">{message.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-3 space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Quick agent prompts</div>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => startChatWithPrompt(item.prompt)}
                      className="flex items-start gap-2 rounded-md border p-2 text-left transition-colors hover:bg-orange-50 dark:hover:bg-gray-900"
                    >
                      <Icon className="mt-0.5 h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-xs font-medium">{item.label}</div>
                        <div className="text-[11px] text-gray-500">{item.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask the agent like Codex… (Tip: /bundle, /checkout, /support)"
                className="min-h-[88px]"
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Enter to send in chat after redirect • Shift+Enter for multiline</span>
                <span>{prompt.length} chars</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setPrompt(`${prompt}${prompt ? "\n" : ""}/bundle `)}>
                  /bundle
                </Button>
                <Button variant="outline" type="button" onClick={() => setPrompt(`${prompt}${prompt ? "\n" : ""}/checkout `)}>
                  /checkout
                </Button>
                <Button variant="outline" type="button" onClick={() => setPrompt(`${prompt}${prompt ? "\n" : ""}/support `)}>
                  /support
                </Button>
              </div>
              <Button
                onClick={() => {
                  if (authStatus !== "authenticated") {
                    signIn(undefined, { callbackUrl: "/runash-chat" })
                    return
                  }
                  const cleanPrompt = prompt.trim()
                  if (!cleanPrompt) return
                  localStorage.setItem("runash_initial_prompt", cleanPrompt)
                  startChatWithPrompt(cleanPrompt)
                }}
                disabled={!prompt.trim()}
                className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white"
              >
                Ask & Continue
              </Button>
            </div>

            <div className="mt-3 flex gap-3 text-xs text-gray-500">
              <span className="flex items-center"><Leaf className="mr-1 h-3 w-3 text-green-500" /> Organic Focus</span>
              <span className="flex items-center"><Sparkles className="mr-1 h-3 w-3 text-orange-500" /> Agentic AI</span>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="mb-2 font-semibold">Upload screenshot attachment</h4>
            <p className="mb-3 text-xs text-gray-500">Attach screenshots so the agent can debug checkout, cart, or product flow issues faster.</p>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" /> Add attachment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Attachment dialog card</DialogTitle>
                  <DialogDescription>Upload a screenshot (PNG/JPG) and continue to the live agent flow.</DialogDescription>
                </DialogHeader>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => setAttachmentName(event.target.files?.[0]?.name ?? "")}
                />
                {attachmentName && <p className="text-xs text-gray-500">Selected: {attachmentName}</p>}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAttachmentName("")}>Clear</Button>
                  <Button className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white" onClick={() => startChatWithPrompt("I uploaded a screenshot. Analyze the issue and suggest next steps.")}>Use in Agent Chat</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" className="mt-2 h-auto p-0 text-xs text-gray-500">
                  <Camera className="mr-1 h-3 w-3" /> Screenshot upload tips
                </Button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold">Best screenshot format</div>
                  <p>Include cart total, selected payment method, and any error banner in one frame for faster diagnostics.</p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </Card>

          <Card className="p-4">
            <h4 className="mb-2 font-semibold">Commerce Agent Playbook</h4>
            <ul className="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Secure handoff for payment and order assistance</li>
              <li className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-orange-500" /> Context-aware product recommendations and bundles</li>
              <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-500" /> Checkout help with guided next actions</li>
            </ul>

            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => router.push("/payment/runash-pay")}>Open RunAsh Pay</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 text-white">Launch Agent Flow</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Launch live agent flow?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will open full chat and preload a payment-ready prompt. You can still review and edit before sending.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => startChatWithPrompt("Help me complete checkout with best payment option and order confirmation steps.")}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="mb-2 font-semibold">Why RunAsh for Live Commerce?</h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Convert with guided shopping flows</li>
              <li>Reduce returns with live product education</li>
              <li>Boost AOV with context-aware upsells</li>
              <li>Run profile-aware follow-ups and payment reminders</li>
            </ul>
          </Card>
        </aside>
      </main>

      <Dialog open={productDemoOpen} onOpenChange={setProductDemoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product demo workflow</DialogTitle>
            <DialogDescription>Start a guided demo with chat, suggestions, and payment handoff in one live sequence.</DialogDescription>
          </DialogHeader>
          <Card className="p-4 text-sm">
            <p className="mb-2 font-semibold">Demo steps</p>
            <ol className="list-decimal space-y-1 pl-5 text-gray-600 dark:text-gray-300">
              <li>Show featured product benefits and social proof.</li>
              <li>Offer two relevant bundles via quick suggestions.</li>
              <li>Handoff to checkout assistant and open RunAsh Pay.</li>
            </ol>
          </Card>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDemoOpen(false)}>Close</Button>
            <Button className="bg-gradient-to-r from-orange-600 to-yellow-500 text-white" onClick={() => startChatWithPrompt("Start product demo mode with guided script and payment handoff.")}>Start Demo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => {
          if (authStatus !== "authenticated") {
            localStorage.setItem("runash_auto_start", "1")
            signIn(undefined, { callbackUrl: "/runash-chat" })
            return
          }
          startChatWithPrompt("Start an agentic commerce session and optimize cart-to-payment conversion.")
        }}
        className="fixed bottom-5 right-5 rounded-full bg-gradient-to-r from-orange-600 to-yellow-500 px-6 text-white shadow-lg"
      >
        <Zap className="mr-2 h-4 w-4" /> Start Live Agent
      </Button>
    </div>
  )
}
