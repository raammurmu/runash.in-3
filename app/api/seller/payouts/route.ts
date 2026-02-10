import { NextResponse } from "next/server"
import { getSql } from "@/lib/db/neon"

export async function GET(request: Request) {
  try {
    const userId = Number(request.headers.get("x-user-id") || 1)
    const sql = getSql()

    const [summary] = await sql/* sql */`
      SELECT
        COALESCE(SUM(total), 0) AS total_earned,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 0) AS available_balance,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders
      FROM public.orders
      WHERE user_id = ${userId}
    `

    const history = await sql/* sql */`
      SELECT
        date_trunc('week', created_at) AS payout_week,
        COALESCE(SUM(total), 0) AS amount,
        COUNT(*) AS orders_count,
        CASE
          WHEN date_trunc('week', created_at) < date_trunc('week', now()) THEN 'completed'
          ELSE 'processing'
        END AS status
      FROM public.orders
      WHERE user_id = ${userId}
        AND status IN ('processing', 'shipped', 'delivered')
      GROUP BY 1
      ORDER BY payout_week DESC
      LIMIT 12
    `

    return NextResponse.json({
      availableBalance: Number(summary?.available_balance || 0),
      totalEarned: Number(summary?.total_earned || 0),
      deliveredOrders: Number(summary?.delivered_orders || 0),
      pendingOrders: Number(summary?.pending_orders || 0),
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      history: history.map((row: any, index: number) => ({
        id: `${row.payout_week}-${index}`,
        date: row.payout_week,
        amount: Number(row.amount || 0),
        status: row.status,
        method: "Bank Transfer",
        ordersCount: Number(row.orders_count || 0),
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load payouts" }, { status: 500 })
  }
}
