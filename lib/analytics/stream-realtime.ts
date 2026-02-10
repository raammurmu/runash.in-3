import { getSql } from "@/lib/db/neon";

type StreamHealth = "Excellent" | "Good" | "Fair" | "Poor";

type StreamRealtimePayload = {
  totalViews: number;
  currentViewers: number;
  peakViewers: number;
  averageViewers: number;
  watchTime: number;
  chatMessages: number;
  newFollowers: number;
  donations: number;
  engagement: number;
  streamHealth: StreamHealth;
  revenue: number;
  subscriptions: number;
  bitrate: number;
  fps: number;
  droppedFrames: number;
  bandwidth: number;
  timestamp: string;
  freshnessMs: number;
  sources: string[];
};

async function tableExists(tableName: string) {
  const sql = getSql();
  const [row] = await sql<
    { exists: string | null }[]
  >`SELECT to_regclass(${`public.${tableName}`})::text as exists`;
  return Boolean(row?.exists);
}

function calculateStreamHealth(
  bitrate: number,
  droppedFrames: number,
): StreamHealth {
  if (droppedFrames > 3 || bitrate < 2000) return "Poor";
  if (droppedFrames > 1 || bitrate < 2200) return "Fair";
  if (droppedFrames > 0 || bitrate < 2400) return "Good";
  return "Excellent";
}

export async function getStreamRealtimeMetrics(
  streamId: string,
  userId?: string,
): Promise<StreamRealtimePayload> {
  const sql = getSql();
  const now = new Date();

  const payload: StreamRealtimePayload = {
    totalViews: 0,
    currentViewers: 0,
    peakViewers: 0,
    averageViewers: 0,
    watchTime: 0,
    chatMessages: 0,
    newFollowers: 0,
    donations: 0,
    engagement: 0,
    streamHealth: "Poor",
    revenue: 0,
    subscriptions: 0,
    bitrate: 0,
    fps: 0,
    droppedFrames: 0,
    bandwidth: 0,
    timestamp: now.toISOString(),
    freshnessMs: Number.POSITIVE_INFINITY,
    sources: [],
  };

  const timestamps: Date[] = [];

  const streamRows = userId
    ? await sql<any[]>`
      SELECT id, user_id, COALESCE(viewer_count, 0) as viewer_count, COALESCE(max_viewers, 0) as max_viewers,
      COALESCE(total_revenue, 0) as total_revenue, updated_at, created_at
      FROM streams
      WHERE id = ${streamId} AND user_id = ${userId}
      LIMIT 1
    `
    : await sql<any[]>`
      SELECT id, user_id, COALESCE(viewer_count, 0) as viewer_count, COALESCE(max_viewers, 0) as max_viewers,
      COALESCE(total_revenue, 0) as total_revenue, updated_at, created_at
      FROM streams
      WHERE id = ${streamId}
      LIMIT 1
    `;

  const stream = streamRows[0];
  if (!stream) {
    return payload;
  }

  payload.currentViewers = Number(stream.viewer_count ?? 0);
  payload.peakViewers = Number(stream.max_viewers ?? 0);
  payload.revenue = Number(stream.total_revenue ?? 0);
  payload.sources.push("streams");
  if (stream.updated_at || stream.created_at) {
    timestamps.push(new Date(stream.updated_at ?? stream.created_at));
  }

  if (await tableExists("stream_viewers")) {
    const [viewers] = await sql<any[]>`
      SELECT COUNT(*)::int as count, MAX(COALESCE(updated_at, joined_at, created_at)) as latest_at
      FROM stream_viewers
      WHERE stream_id = ${streamId} AND left_at IS NULL
    `;
    payload.currentViewers = Number(viewers?.count ?? payload.currentViewers);
    if (viewers?.latest_at) timestamps.push(new Date(viewers.latest_at));
    payload.sources.push("stream_viewers");
  }

  if (await tableExists("stream_metrics")) {
    const [metric] = await sql<any[]>`
      SELECT viewer_count, engagement_rate, revenue, chat_messages, new_followers, timestamp
      FROM stream_metrics
      WHERE stream_id = ${streamId}
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    if (metric) {
      payload.currentViewers = Number(
        metric.viewer_count ?? payload.currentViewers,
      );
      payload.engagement = Number(metric.engagement_rate ?? payload.engagement);
      payload.chatMessages = Number(
        metric.chat_messages ?? payload.chatMessages,
      );
      payload.newFollowers = Number(
        metric.new_followers ?? payload.newFollowers,
      );
      payload.revenue = Number(metric.revenue ?? payload.revenue);
      timestamps.push(new Date(metric.timestamp));
      payload.sources.push("stream_metrics");
    }
  }

  if (await tableExists("stream_analytics")) {
    const [analytics] = await sql<any[]>`
      SELECT
        COALESCE(SUM(total_views), 0)::int as total_views,
        COALESCE(MAX(peak_viewers), 0)::int as peak_viewers,
        COALESCE(AVG(average_viewers), 0)::numeric as average_viewers,
        COALESCE(SUM(watch_time), 0)::int as watch_time,
        COALESCE(SUM(chat_messages), 0)::int as chat_messages,
        COALESCE(SUM(new_followers), 0)::int as new_followers,
        COALESCE(SUM(donations), 0)::numeric as donations,
        COALESCE(AVG(engagement), 0)::numeric as engagement,
        COALESCE(AVG(bitrate), 0)::int as bitrate,
        COALESCE(AVG(fps), 0)::int as fps,
        COALESCE(AVG(dropped_frames), 0)::int as dropped_frames,
        COALESCE(AVG(bandwidth), 0)::int as bandwidth,
        MAX(created_at) as latest_at
      FROM stream_analytics
      WHERE stream_id = ${streamId}
    `;

    if (analytics) {
      payload.totalViews = Number(analytics.total_views ?? payload.totalViews);
      payload.peakViewers = Math.max(
        payload.peakViewers,
        Number(analytics.peak_viewers ?? 0),
      );
      payload.averageViewers = Math.round(
        Number(analytics.average_viewers ?? payload.averageViewers),
      );
      payload.watchTime = Number(analytics.watch_time ?? payload.watchTime);
      payload.chatMessages = Math.max(
        payload.chatMessages,
        Number(analytics.chat_messages ?? 0),
      );
      payload.newFollowers = Math.max(
        payload.newFollowers,
        Number(analytics.new_followers ?? 0),
      );
      payload.donations = Number(analytics.donations ?? payload.donations);
      payload.engagement = Number(analytics.engagement ?? payload.engagement);
      payload.bitrate = Number(analytics.bitrate ?? payload.bitrate);
      payload.fps = Number(analytics.fps ?? payload.fps);
      payload.droppedFrames = Number(
        analytics.dropped_frames ?? payload.droppedFrames,
      );
      payload.bandwidth = Number(analytics.bandwidth ?? payload.bandwidth);
      if (analytics.latest_at) timestamps.push(new Date(analytics.latest_at));
      payload.sources.push("stream_analytics");
    }
  }

  if (await tableExists("chat_messages")) {
    const [chat] = await sql<any[]>`
      SELECT COUNT(*)::int as count, MAX(COALESCE(created_at, timestamp)) as latest_at
      FROM chat_messages
      WHERE stream_id = ${streamId}
    `;
    payload.chatMessages = Math.max(
      payload.chatMessages,
      Number(chat?.count ?? 0),
    );
    if (chat?.latest_at) timestamps.push(new Date(chat.latest_at));
    payload.sources.push("chat_messages");
  }

  if (await tableExists("payment_transactions")) {
    const [revenue] = await sql<any[]>`
      SELECT COALESCE(SUM(amount), 0)::numeric as total_revenue, MAX(created_at) as latest_at
      FROM payment_transactions
      WHERE stream_id = ${streamId}
        AND status = 'succeeded'
    `;
    payload.revenue = Math.max(
      payload.revenue,
      Number(revenue?.total_revenue ?? 0),
    );
    if (revenue?.latest_at) timestamps.push(new Date(revenue.latest_at));
    payload.sources.push("payment_transactions");
  }

  if (await tableExists("user_subscriptions")) {
    const subRows = userId
      ? await sql<any[]>`
          SELECT COUNT(*)::int as count, MAX(updated_at) as latest_at
          FROM user_subscriptions
          WHERE user_id = ${userId} AND status = 'active'
        `
      : await sql<any[]>`
          SELECT COUNT(*)::int as count, MAX(updated_at) as latest_at
          FROM user_subscriptions
          WHERE status = 'active'
        `;

    const subscriptions = subRows[0];
    payload.subscriptions = Number(subscriptions?.count ?? 0);
    if (subscriptions?.latest_at)
      timestamps.push(new Date(subscriptions.latest_at));
    payload.sources.push("user_subscriptions");
  }

  payload.streamHealth = calculateStreamHealth(
    payload.bitrate,
    payload.droppedFrames,
  );

  const latestSample = timestamps
    .filter((value) => Number.isFinite(value.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  payload.freshnessMs = latestSample
    ? now.getTime() - latestSample.getTime()
    : Number.POSITIVE_INFINITY;
  payload.timestamp = latestSample?.toISOString() ?? now.toISOString();

  return payload;
}
