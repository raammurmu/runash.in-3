"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DollarSign, Users, TrendingUp, Video, ShoppingCart, BarChart3, Clock, Play, Settings } from "lucide-react"
import { SellerAnalytics } from "@/components/seller/seller-analytics"
import { LiveStreamManager } from "@/components/seller/live-stream-manager"
import { ProductManager } from "@/components/seller/product-manager"
import { OrderManager } from "@/components/seller/order-manager"
import { BusinessSettings } from "@/components/seller/business-settings"
import { InventoryManager } from "@/components/seller/inventory-manager"
import { PayoutManager } from "@/components/seller/payout-manager"

type SellerSummary = {
  revenue: number
  totalOrders: number
  pendingOrders: number
  monthlyOrders: number
  totalProducts: number
  outOfStock: number
  totalStock: number
  unitsSold: number
  recentStreams: Array<{ id: string; title: string; date: string; viewers: number }>
}

const sellerFetcher = (url: string) =>
  fetch(url, { headers: { "x-user-id": "1" } }).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(`Failed to load: ${url}`)),
  )

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const {
    data: perms,
    error: permsError,
    isLoading: permsLoading,
  } = useSWR("/api/auth/permissions", (url) =>
    fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load permissions")))),
  )

  const { data: summary, isLoading: summaryLoading } = useSWR<SellerSummary>("/api/seller/dashboard/summary", sellerFetcher)

  const stats = useMemo(
    () => [
      { title: "Total Revenue", value: `$${Number(summary?.revenue || 0).toFixed(2)}`, icon: DollarSign },
      { title: "Orders", value: String(summary?.totalOrders || 0), icon: ShoppingCart },
      { title: "Products", value: String(summary?.totalProducts || 0), icon: Users },
      { title: "Units Sold", value: String(summary?.unitsSold || 0), icon: Clock },
    ],
    [summary],
  )

  if (permsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading seller dashboard...</div>
  }

  if (permsError || (perms && perms.role !== "seller")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Not authorized</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">You don&apos;t have permission to access the Seller Dashboard.</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Production-ready command center for catalog, orders, and streams.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              <Video className="h-4 w-4 mr-2" />
              Go Live
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryLoading ? "..." : stat.value}</div>
                <p className="text-xs text-muted-foreground inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  Live operational data
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 overflow-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="streams">Streams</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-orange-500" />Recent Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(summary?.recentStreams || []).map((stream) => (
                      <div key={stream.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{stream.title}</p>
                            <p className="text-sm text-muted-foreground">{stream.date}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{stream.viewers} viewers</p>
                        </div>
                      </div>
                    ))}
                    {!summary?.recentStreams?.length && (
                      <p className="text-sm text-muted-foreground">No streams yet. Start your first live session.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />Operations Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <HealthRow label="Inventory availability" value={Math.max(0, 100 - (summary?.outOfStock || 0) * 10)} />
                  <HealthRow label="Order throughput" value={Math.min(100, (summary?.monthlyOrders || 0) * 5)} />
                  <HealthRow label="Backlog control" value={Math.max(0, 100 - (summary?.pendingOrders || 0) * 5)} />
                  <HealthRow label="Catalog coverage" value={Math.min(100, (summary?.totalProducts || 0) * 8)} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="streams"><LiveStreamManager /></TabsContent>
          <TabsContent value="products"><ProductManager /></TabsContent>
          <TabsContent value="inventory"><InventoryManager /></TabsContent>
          <TabsContent value="orders"><OrderManager /></TabsContent>
          <TabsContent value="payouts"><PayoutManager /></TabsContent>
          <TabsContent value="analytics"><SellerAnalytics /></TabsContent>
          <TabsContent value="business"><BusinessSettings /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function HealthRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}
