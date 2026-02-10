import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStreamRealtimeMetrics } from "@/lib/analytics/stream-realtime";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json(
        { error: "Stream ID required" },
        { status: 400 },
      );
    }

    const data = await getStreamRealtimeMetrics(streamId, session.user.id);

    const metrics = {
      viewerCount: data.currentViewers,
      streamHealth: data.streamHealth,
      bitrate: data.bitrate,
      fps: data.fps,
      droppedFrames: data.droppedFrames,
      bandwidth: data.bandwidth,
      timestamp: data.timestamp,
    };

    console.info("[streams.metrics] served", {
      streamId,
      latencyMs: Date.now() - startedAt,
      freshnessMs: data.freshnessMs,
      sources: data.sources,
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("[streams.metrics] error", {
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
