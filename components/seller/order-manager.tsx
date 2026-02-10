"use client"

import { type ReactNode, useMemo, useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Search, Eye, Package, Truck, CheckCircle, Clock, DollarSign, Mail, Calendar, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type OrderItem = { name: string; quantity: number; price: number }
type SellerOrder = {
  id: number
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  shipping_address: string
  status: string
  total: number
  created_at: string
  items: OrderItem[]
}

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-user-id": "1" } }).then((r) => {
    if (!r.ok) throw new Error("Failed to load orders")
    return r.json()
  })

export function OrderManager() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null)

  const {
    data: orders = [],
    error,
    isLoading,
    mutate,
  } = useSWR<SellerOrder[]>(`/api/orders?status=${selectedStatus}&q=${encodeURIComponent(searchTerm)}`, fetcher)

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      revenue,
    }
  }, [orders])

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-user-id": "1" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update order")
      await mutate()
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev))
      toast({ title: "Order updated", description: `Order #${orderId} marked as ${newStatus}.` })
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not update order.", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "delivered") return "bg-green-500"
    if (status === "processing") return "bg-blue-500"
    if (status === "shipped") return "bg-purple-500"
    if (status === "pending") return "bg-yellow-500"
    return "bg-gray-500"
  }

  return (
    <div className="space-y-6">
      {isLoading && <div className="text-sm text-muted-foreground">Loading orders…</div>}
      {error && <div className="text-sm text-red-600">Failed to load orders. Please try again.</div>}

      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Order Manager</h2>
          <p className="text-muted-foreground">Track and update seller order lifecycle</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="h-4 w-4 mr-2" />
          Export (Soon)
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by buyer name/email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Orders" value={stats.total.toString()} icon={<Package className="h-8 w-8 text-orange-500" />} />
        <MetricCard label="Pending" value={stats.pending.toString()} icon={<Clock className="h-8 w-8 text-yellow-500" />} />
        <MetricCard label="Shipped" value={stats.shipped.toString()} icon={<Truck className="h-8 w-8 text-purple-500" />} />
        <MetricCard
          label="Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={<DollarSign className="h-8 w-8 text-green-500" />}
        />
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <Badge className={`${getStatusBadge(order.status)} text-white`}>{order.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" />{order.buyer_email}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{format(new Date(order.created_at), "MMM dd, yyyy HH:mm")}</span>
                  <span>{order.items.length} items</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="font-bold text-lg mr-2">${Number(order.total || 0).toFixed(2)}</div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
                      <DialogDescription>Order details and status updates.</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Buyer</p>
                            <p>{selectedOrder.buyer_name}</p>
                            <p>{selectedOrder.buyer_email}</p>
                          </div>
                          <div>
                            <p className="font-medium">Shipping Address</p>
                            <p>{selectedOrder.shipping_address || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={`${item.name}-${idx}`} className="flex items-center justify-between bg-muted/50 rounded p-2 text-sm">
                              <span>{item.name} × {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Select
                            value={selectedOrder.status}
                            onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                          >
                            <SelectTrigger className="w-56">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={() => updateOrderStatus(selectedOrder.id, "processing")}>Mark processing</Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardContent className="p-12 text-center text-muted-foreground">No orders found for selected filters.</CardContent>
        </Card>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}
