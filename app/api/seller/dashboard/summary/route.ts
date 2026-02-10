import { NextResponse } from "next/server"
import { getSql } from "@/lib/db/neon"
import { DashboardService } from "@/lib/dashboard-service"

export async function GET(request: Request) {
  try {
    const userId = Number(request.headers.get("x-user-id") || 1)
    const sql = getSql()

    const [orderMetrics] = await sql/* sql */`
      SELECT
        COALESCE(SUM(total), 0) AS revenue,
        COUNT(*) AS total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now())) AS monthly_orders
      FROM public.orders
      WHERE user_id = ${userId}
    `

    const [productMetrics] = await sql/* sql */`
      SELECT
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE stock <= 0) AS out_of_stock,
        COALESCE(SUM(stock), 0) AS total_stock,
        COALESCE(SUM(sales), 0) AS total_units_sold
      FROM public.products
      WHERE user_id = ${userId}
    `

    const streams = await DashboardService.getRecentStreams(userId, 4)

    return NextResponse.json({
      revenue: Number(orderMetrics?.revenue || 0),
      totalOrders: Number(orderMetrics?.total_orders || 0),
      pendingOrders: Number(orderMetrics?.pending_orders || 0),
      monthlyOrders: Number(orderMetrics?.monthly_orders || 0),
      totalProducts: Number(productMetrics?.total_products || 0),
      outOfStock: Number(productMetrics?.out_of_stock || 0),
      totalStock: Number(productMetrics?.total_stock || 0),
      unitsSold: Number(productMetrics?.total_units_sold || 0),
      recentStreams: streams,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch seller summary" }, { status: 500 })
  }
}
