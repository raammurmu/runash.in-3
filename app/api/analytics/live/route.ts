import type { NextRequest } from "next/server"
import { streamEmitter } from "@/lib/stream-emitter"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendMetrics = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      // send initial snapshot when available
      const snapshot = streamEmitter.getLatest()
      if (snapshot) {
        sendMetrics(snapshot)
      }

      const unsubscribe = streamEmitter.subscribe((payload) => {
        sendMetrics(payload)
      })

      // heartbeat every 20s
      const ping = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`))
      }, 20_000)

      request.signal.addEventListener("abort", () => {
        clearInterval(ping)
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "Content-Type": "text/event-stream; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
