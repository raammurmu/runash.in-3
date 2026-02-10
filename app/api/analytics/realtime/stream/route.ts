import type { NextRequest } from "next/server";
import { getStreamRealtimeMetrics } from "@/lib/analytics/stream-realtime";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamId = searchParams.get("streamId");

  if (!streamId) {
    return new Response("Missing streamId", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendUpdate = async () => {
        const startedAt = Date.now();

        try {
          const analyticsData = await getStreamRealtimeMetrics(streamId);

          const data = `data: ${JSON.stringify({
            totalViews: analyticsData.totalViews,
            currentViewers: analyticsData.currentViewers,
            peakViewers: analyticsData.peakViewers,
            averageViewers: analyticsData.averageViewers,
            watchTime: analyticsData.watchTime,
            chatMessages: analyticsData.chatMessages,
            newFollowers: analyticsData.newFollowers,
            donations: analyticsData.donations,
            engagement: analyticsData.engagement,
            streamHealth: analyticsData.streamHealth,
            revenue: analyticsData.revenue,
            subscriptions: analyticsData.subscriptions,
          })}\n\n`;

          controller.enqueue(encoder.encode(data));

          console.info("[analytics.realtime.stream] update_sent", {
            streamId,
            latencyMs: Date.now() - startedAt,
            freshnessMs: analyticsData.freshnessMs,
            sources: analyticsData.sources,
          });
        } catch (error) {
          console.error("[analytics.realtime.stream] update_error", {
            streamId,
            latencyMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : "unknown_error",
          });
        }
      };

      const interval = setInterval(sendUpdate, 5000);
      sendUpdate();

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
