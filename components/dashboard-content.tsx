"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import { StreamsDashboard } from "@/components/streams/streams-dashboard"
import { ProductsCatalog } from "@/components/products/product-catalog"
import { AIAgentsDashboard } from "@/components/ai-agents/ai-agents-dashboard"
import { AutomationDashboard } from "@/components/automation/automation-dashboard"
import { TemplateRenderer } from "@/components/template-renderer"
import { useAnalytics } from "@/lib/hooks/use-analytics"
import { useStreams } from "@/lib/hooks/use-streams"
import { useProducts } from "@/lib/hooks/use-products"
import { useAuth } from "@/lib/hooks/use-auth"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { Users, DollarSign, PlayCircle, Package, Activity } from "lucide-react"

export function DashboardContent() {
  const { user } = useAuth()
  const { totals, loading: analyticsLoading, error: analyticsError } = useAnalytics(user?.id)
  const { streams, loading: streamsLoading } = useStreams(user?.id)
  const { products, loading: productsLoading } = useProducts(user?.id)

  const isLoading = analyticsLoading || streamsLoading || productsLoading

  if (analyticsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-gray-600 mb-4">{analyticsError}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{user?.email || "User"}</Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : formatCurrency(totals.revenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : formatNumber(totals.viewers)}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : streams.filter((s) => s.status === "live").length}
            </div>
            <p className="text-xs text-muted-foreground">{streams.length} total streams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : products.length}</div>
            <p className="text-xs text-muted-foreground">{products.filter((p) => p.in_stock).length} in stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Examples */}
      {!isLoading && streams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Stream Performance</CardTitle>
            <CardDescription>Template-rendered stream summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {streams.slice(0, 3).map((stream) => (
                <TemplateRenderer
                  key={stream.id}
                  templateId="stream-summary"
                  data={{
                    title: stream.title || "Untitled Stream",
                    viewers: stream.stream_metrics?.[0]?.viewers_count || 0,
                    revenue: stream.stream_metrics?.[0]?.revenue || 0,
                    duration: stream.duration || "0:00",
                    engagement: stream.stream_metrics?.[0]?.engagement_rate || 0,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="streams">Streams</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="ai-agents">AI Agents</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <AnalyticsDashboard />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest streams and products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {streams.slice(0, 3).map((stream) => (
                    <div key={stream.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{stream.title}</p>
                        <p className="text-sm text-muted-foreground">{stream.status}</p>
                      </div>
                      <div className="ml-auto font-medium">
                        {stream.stream_metrics?.[0]?.viewers_count || 0} viewers
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="streams">
          <StreamsDashboard />
        </TabsContent>

        <TabsContent value="products">
          <ProductsCatalog />
        </TabsContent>

        <TabsContent value="ai-agents">
          <AIAgentsDashboard />
        </TabsContent>

        <TabsContent value="automation">
          <AutomationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
