import { NextResponse } from "next/server"
import { getSql } from "@/lib/db/neon"
import { executeIdempotentMutation, getIdempotencyKeyFromHeaders } from "@/lib/idempotency"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get("status") || "all"
    const search = (url.searchParams.get("q") || "").toLowerCase()
    const userId = Number(req.headers.get("x-user-id") || 1)

    const sql = getSql()
    const orders = await sql /* sql */`
      SELECT o.id, o.buyer_name, o.buyer_email, o.buyer_phone, o.shipping_address, o.payment_method,
             o.status, o.total, o.created_at,
             COALESCE(json_agg(json_build_object('name', oi.name, 'quantity', oi.quantity, 'price', oi.price))
                      FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM public.orders o
      LEFT JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ${userId}
        AND (${status === "all"} OR o.status = ${status})
        AND (${search === ""} OR LOWER(o.buyer_name) LIKE ${"%" + search + "%"} OR LOWER(o.buyer_email) LIKE ${"%" + search + "%"})
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 200
    `
    return NextResponse.json(orders)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const idempotencyKey = getIdempotencyKeyFromHeaders(req.headers)
    if (!idempotencyKey) {
      return NextResponse.json({ error: "Missing required header: idempotency-key" }, { status: 400 })
    }

    const body = await req.json()
    const userId = Number(req.headers.get("x-user-id") || 1)
    const sql = getSql()

    const { buyer_name, buyer_email, buyer_phone, shipping_address, payment_method, items = [] } = body
    const total = items.reduce((sum: number, it: any) => sum + Number(it.price) * Number(it.quantity), 0)

    const result = await executeIdempotentMutation({
      idempotencyKey,
      scope: `orders:create:${userId}`,
      requestHash: JSON.stringify({ buyer_name, buyer_email, buyer_phone, shipping_address, payment_method, items }),
      execute: async () => {
        const [order] =
          await sql /* sql */`INSERT INTO public.orders (user_id, buyer_name, buyer_email, buyer_phone, shipping_address, payment_method, total)
                          VALUES (${userId}, ${buyer_name}, ${buyer_email}, ${buyer_phone}, ${shipping_address}, ${payment_method}, ${total})
                          RETURNING id, status, total, created_at`

        for (const it of items) {
          await sql /* sql */`
            INSERT INTO public.order_items (order_id, product_id, name, quantity, price)
            VALUES (${order.id}, ${it.product_id || null}, ${it.name}, ${it.quantity}, ${it.price})
          `
          if (it.product_id) {
            await sql /* sql */`
              UPDATE public.products
              SET stock = GREATEST(0, stock - ${it.quantity}), sales = sales + ${it.quantity}
              WHERE id = ${it.product_id}
            `
          }
        }

        return {
          statusCode: 201,
          response: { id: order.id, total, status: order.status },
        }
      },
    })

    return NextResponse.json(result.response, { status: result.statusCode })
  } catch (e: any) {
    if (e instanceof Error && e.message === "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD") {
      return NextResponse.json({ error: "Idempotency key reuse detected with a different payload" }, { status: 409 })
    }

    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
