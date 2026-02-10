"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react"

type PayoutResponse = {
  availableBalance: number
  totalEarned: number
  deliveredOrders: number
  pendingOrders: number
  nextPayoutDate: string
  history: Array<{
    id: string
    date: string
    amount: number
    status: string
    method: string
    ordersCount: number
  }>
}

const fetcher = (url: string) =>
  fetch(url, { headers: { "x-user-id": "1" } }).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error("Failed to load payouts")),
  )

export function PayoutManager() {
  const { data, error, isLoading, mutate } = useSWR<PayoutResponse>("/api/seller/payouts", fetcher)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${Number(data?.availableBalance || 0).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Ready for weekly settlement</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.nextPayoutDate ? format(new Date(data.nextPayoutDate), "MMM dd") : "—"}</div>
            <p className="text-sm text-muted-foreground">Automatic transfer window</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${Number(data?.totalEarned || 0).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">All-time completed seller revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Derived weekly settlement snapshots from order data</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => mutate()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export (Soon)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground mb-3">Loading payout history…</p>}
          {error && <p className="text-sm text-red-600 mb-3">Unable to load payout history right now.</p>}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.history || []).map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>{format(new Date(payout.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell className="font-bold">${Number(payout.amount).toFixed(2)}</TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell>{payout.ordersCount}</TableCell>
                    <TableCell>
                      <Badge className={payout.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                        {payout.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
