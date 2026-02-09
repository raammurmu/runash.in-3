import type { PlatformTestResult } from "@/lib/streaming-platform-test";

export interface StreamingPlatform {
  id: string;
  name: string;
  platform_type:
    | "twitch"
    | "youtube"
    | "facebook"
    | "tiktok"
    | "instagram"
    | "linkedin"
    | "custom";
  rtmp_url: string;
  stream_key: string;
  is_active: boolean;
  is_connected: boolean;
  connection_status: "connected" | "disconnected" | "error" | "testing";
  last_connected?: string;
  settings: PlatformSettings;
  oauth_token?: string;
  refresh_token?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  bitrate: number;
  resolution: { width: number; height: number };
  fps: number;
  audio_bitrate: number;
  enable_chat_relay: boolean;
  enable_auto_title: boolean;
  enable_auto_description: boolean;
  custom_title?: string;
  custom_description?: string;
  category?: string;
  tags?: string[];
  privacy: "public" | "private" | "unlisted";
  enable_recording: boolean;
  enable_notifications: boolean;
}

export interface PlatformAnalytics {
  platform_id: string;
  viewers: number;
  chat_messages: number;
  likes: number;
  shares: number;
  followers_gained: number;
  watch_time: number;
  peak_viewers: number;
  engagement_rate: number;
  stream_health: "excellent" | "good" | "fair" | "poor";
  bitrate_actual: number;
  fps_actual: number;
  dropped_frames: number;
  timestamp: string;
}

export interface MultiStreamSession {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  platforms: string[];
  status: "scheduled" | "live" | "ended" | "error";
  start_time?: string;
  end_time?: string;
  total_viewers: number;
  peak_viewers: number;
  duration: number;
  settings: {
    master_bitrate: number;
    master_resolution: { width: number; height: number };
    master_fps: number;
    enable_adaptive_bitrate: boolean;
    enable_auto_failover: boolean;
  };
}

export class MultiPlatformService {
  private static instance: MultiPlatformService;

  private constructor() {}

  public static getInstance(): MultiPlatformService {
    if (!MultiPlatformService.instance) {
      MultiPlatformService.instance = new MultiPlatformService();
    }
    return MultiPlatformService.instance;
  }

  // Platform Management
  public async getUserPlatforms(): Promise<StreamingPlatform[]> {
    try {
      const response = await fetch("/api/streaming/platforms");
      if (!response.ok) throw new Error("Failed to fetch platforms");
      const { platforms } = await response.json();
      return platforms;
    } catch (error) {
      console.error("Failed to fetch platforms:", error);
      return [];
    }
  }

  public async addPlatform(
    platformData: Omit<StreamingPlatform, "id" | "created_at" | "updated_at">,
  ): Promise<StreamingPlatform> {
    try {
      const response = await fetch("/api/streaming/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(platformData),
      });
      if (!response.ok) throw new Error("Failed to add platform");
      return await response.json();
    } catch (error) {
      console.error("Failed to add platform:", error);
      throw error;
    }
  }

  public async updatePlatform(
    platformId: string,
    updates: Partial<StreamingPlatform>,
  ): Promise<StreamingPlatform> {
    try {
      const response = await fetch(`/api/streaming/platforms/${platformId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update platform");
      return await response.json();
    } catch (error) {
      console.error("Failed to update platform:", error);
      throw error;
    }
  }

  public async deletePlatform(platformId: string): Promise<void> {
    try {
      const response = await fetch(`/api/streaming/platforms/${platformId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete platform");
    } catch (error) {
      console.error("Failed to delete platform:", error);
      throw error;
    }
  }

  // Platform Authentication
  public async authenticatePlatform(
    platform: string,
  ): Promise<{ auth_url: string }> {
    try {
      const response = await fetch(
        `/api/streaming/platforms/auth/${platform}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error("Failed to initiate authentication");
      return await response.json();
    } catch (error) {
      console.error("Failed to authenticate platform:", error);
      throw error;
    }
  }

  public async handleOAuthCallback(
    platform: string,
    code: string,
    state: string,
  ): Promise<StreamingPlatform> {
    try {
      const response = await fetch(
        `/api/streaming/platforms/auth/${platform}/callback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state }),
        },
      );
      if (!response.ok) throw new Error("Failed to complete authentication");
      return await response.json();
    } catch (error) {
      console.error("Failed to handle OAuth callback:", error);
      throw error;
    }
  }

  // Connection Testing
  public async testPlatformConnection(
    platformId: string,
  ): Promise<PlatformTestResult> {
    try {
      const response = await fetch(
        `/api/streaming/platforms/${platformId}/test`,
        {
          method: "POST",
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          status: "failed",
          success: false,
          message: payload?.message || "Failed to test connection",
          actionableRemediation: payload?.actionableRemediation || [
            "Try again in a few moments.",
          ],
          diagnostics: {
            network: payload?.diagnostics?.network || "unknown",
            auth: payload?.diagnostics?.auth || "unknown",
            endpointReachability:
              payload?.diagnostics?.endpointReachability || "unknown",
            latency: payload?.diagnostics?.latency ?? null,
          },
          checkedAt: payload?.checkedAt || new Date().toISOString(),
        };
      }

      return payload as PlatformTestResult;
    } catch (error) {
      console.error("Failed to test platform connection:", error);
      return {
        status: "failed",
        success: false,
        message: "Connection test failed",
        actionableRemediation: ["Check your network connection and retry."],
        diagnostics: {
          network: "failed",
          auth: "unknown",
          endpointReachability: "unknown",
          latency: null,
        },
        checkedAt: new Date().toISOString(),
      };
    }
  }

  // Multi-Stream Management
  public async startMultiStream(
    sessionData: Omit<MultiStreamSession, "id" | "status" | "start_time">,
  ): Promise<MultiStreamSession> {
    try {
      const response = await fetch("/api/streaming/multi-stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });
      if (!response.ok) throw new Error("Failed to start multi-stream");
      return await response.json();
    } catch (error) {
      console.error("Failed to start multi-stream:", error);
      throw error;
    }
  }

  public async stopMultiStream(sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `/api/streaming/multi-stream/${sessionId}/stop`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error("Failed to stop multi-stream");
    } catch (error) {
      console.error("Failed to stop multi-stream:", error);
      throw error;
    }
  }

  // Real-time Analytics
  public async getPlatformAnalytics(
    platformId: string,
    timeRange = "1h",
  ): Promise<PlatformAnalytics[]> {
    try {
      const response = await fetch(
        `/api/streaming/platforms/${platformId}/analytics?range=${timeRange}`,
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const { analytics } = await response.json();
      return analytics;
    } catch (error) {
      console.error("Failed to fetch platform analytics:", error);
      return [];
    }
  }

  public async getMultiStreamAnalytics(sessionId: string): Promise<{
    session: MultiStreamSession;
    platforms: (PlatformAnalytics & { platform_name: string })[];
    aggregated: {
      total_viewers: number;
      total_chat_messages: number;
      total_engagement: number;
      average_stream_health: string;
    };
  }> {
    try {
      const response = await fetch(
        `/api/streaming/multi-stream/${sessionId}/analytics`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch multi-stream analytics");
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch multi-stream analytics:", error);
      throw error;
    }
  }

  // Platform-Specific Features
  public async updateStreamTitle(
    platformId: string,
    title: string,
  ): Promise<void> {
    try {
      const response = await fetch(
        `/api/streaming/platforms/${platformId}/title`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        },
      );
      if (!response.ok) throw new Error("Failed to update stream title");
    } catch (error) {
      console.error("Failed to update stream title:", error);
      throw error;
    }
  }

  public async updateStreamCategory(
    platformId: string,
    category: string,
  ): Promise<void> {
    try {
      const response = await fetch(
        `/api/streaming/platforms/${platformId}/category`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        },
      );
      if (!response.ok) throw new Error("Failed to update stream category");
    } catch (error) {
      console.error("Failed to update stream category:", error);
      throw error;
    }
  }

  // Chat Relay
  public async enableChatRelay(platforms: string[]): Promise<void> {
    try {
      const response = await fetch("/api/streaming/chat/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms }),
      });
      if (!response.ok) throw new Error("Failed to enable chat relay");
    } catch (error) {
      console.error("Failed to enable chat relay:", error);
      throw error;
    }
  }

  // Bandwidth Optimization
  public async optimizeBandwidth(platforms: string[]): Promise<{
    recommendations: {
      platform_id: string;
      recommended_bitrate: number;
      recommended_resolution: { width: number; height: number };
      recommended_fps: number;
      reason: string;
    }[];
    total_bandwidth_required: number;
    optimization_savings: number;
  }> {
    try {
      const response = await fetch("/api/streaming/optimize-bandwidth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms }),
      });
      if (!response.ok) throw new Error("Failed to optimize bandwidth");
      return await response.json();
    } catch (error) {
      console.error("Failed to optimize bandwidth:", error);
      throw error;
    }
  }

  // Platform Templates
  public async getPlatformTemplates(): Promise<{
    [platform: string]: {
      name: string;
      recommended_settings: PlatformSettings;
      requirements: {
        min_bitrate: number;
        max_bitrate: number;
        supported_resolutions: { width: number; height: number }[];
        supported_fps: number[];
      };
    };
  }> {
    try {
      const response = await fetch("/api/streaming/platform-templates");
      if (!response.ok) throw new Error("Failed to fetch platform templates");
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch platform templates:", error);
      return {};
    }
  }
}
