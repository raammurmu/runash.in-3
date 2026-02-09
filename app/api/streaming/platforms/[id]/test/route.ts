import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Database } from "@/lib/database";
import { logAudit, withRateLimit } from "@/lib/api-utils";
import type {
  PlatformTestDiagnosticStatus,
  PlatformTestResult,
} from "@/lib/streaming-platform-test";

const STREAM_TEST_RATE_LIMIT = 10;
const STREAM_TEST_RATE_WINDOW_MS = 5 * 60 * 1000;
const STREAM_VALIDATION_TIMEOUT_MS = 5000;

interface StreamingPlatformRow {
  id: string;
  name: string;
  platform_type: string;
  rtmp_url: string;
  stream_key: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await withRateLimit(
      req,
      STREAM_TEST_RATE_LIMIT,
      STREAM_TEST_RATE_WINDOW_MS,
    );
    if (!rateLimit.allowed) {
      await logAudit(
        session.user.id,
        "stream_platform_test_rate_limited",
        "streaming_platform",
        {
          platformId: params.id,
          retryAfter: rateLimit.retryAfter,
        },
      );

      return NextResponse.json(
        {
          status: "failed",
          success: false,
          message:
            "Too many connection tests. Please wait before trying again.",
          actionableRemediation: [
            "Wait for the cooldown period and retry.",
            "Run one test after each credential update.",
          ],
          diagnostics: {
            network: "unknown",
            auth: "unknown",
            endpointReachability: "unknown",
            latency: null,
          },
          checkedAt: new Date().toISOString(),
        } satisfies PlatformTestResult,
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter ?? 60),
          },
        },
      );
    }

    const platformId = params.id;
    const platform = await Database.query(
      `SELECT * FROM streaming_platforms WHERE id = $1 AND user_id = $2`,
      [platformId, session.user.id],
    );

    if (!platform[0]) {
      return NextResponse.json(
        { error: "Platform not found" },
        { status: 404 },
      );
    }

    const testResult = await testRTMPConnection(
      platform[0] as StreamingPlatformRow,
    );

    await Database.query(
      `UPDATE streaming_platforms
       SET is_connected = $1, last_connected = $2, connection_status = $3
       WHERE id = $4`,
      [
        testResult.status === "passed",
        testResult.status === "passed" ? new Date() : null,
        testResult.status === "passed" ? "connected" : "error",
        platformId,
      ],
    );

    await logAudit(
      session.user.id,
      "stream_platform_test",
      "streaming_platform",
      {
        platformId,
        status: testResult.status,
        diagnostics: testResult.diagnostics,
        message: testResult.message,
      },
    );

    return NextResponse.json(testResult);
  } catch (error) {
    console.error("Test platform connection error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function testRTMPConnection(
  platform: StreamingPlatformRow,
): Promise<PlatformTestResult> {
  const checkedAt = new Date().toISOString();

  const validation = validatePlatformConfig(platform);
  if (!validation.valid) {
    return {
      status: "failed",
      success: false,
      message: validation.message,
      actionableRemediation: validation.actionableRemediation,
      diagnostics: {
        network: "unknown",
        auth: validation.authStatus,
        endpointReachability: validation.endpointStatus,
        latency: null,
      },
      checkedAt,
    };
  }

  return probeValidationService(platform, checkedAt);
}

function validatePlatformConfig(platform: StreamingPlatformRow): {
  valid: boolean;
  message: string;
  actionableRemediation: string[];
  authStatus: PlatformTestDiagnosticStatus;
  endpointStatus: PlatformTestDiagnosticStatus;
} {
  const rtmpUrl = platform.rtmp_url?.trim() || "";
  const streamKey = platform.stream_key?.trim() || "";

  if (!rtmpUrl) {
    return {
      valid: false,
      message: "RTMP URL is required.",
      actionableRemediation: [
        "Set a valid RTMP URL (example: rtmp://live.example.com/app).",
      ],
      authStatus: "unknown",
      endpointStatus: "failed",
    };
  }

  const rtmpPattern = /^rtmps?:\/\/[a-zA-Z0-9.-]+(?::\d{2,5})?(?:\/[\w.-]+)*$/;
  if (!rtmpPattern.test(rtmpUrl)) {
    return {
      valid: false,
      message: "RTMP URL format is invalid.",
      actionableRemediation: [
        "Use an RTMP/RTMPS URL with a host and app path.",
        "Confirm there are no trailing spaces or unsupported query params.",
      ],
      authStatus: "unknown",
      endpointStatus: "failed",
    };
  }

  if (!streamKey) {
    return {
      valid: false,
      message: "Stream key is required.",
      actionableRemediation: [
        "Paste the stream key from your platform's live settings.",
      ],
      authStatus: "failed",
      endpointStatus: "unknown",
    };
  }

  const streamKeyPattern = /^[A-Za-z0-9_\-.:=+/]{8,256}$/;
  if (!streamKeyPattern.test(streamKey)) {
    return {
      valid: false,
      message: "Stream key format is invalid.",
      actionableRemediation: [
        "Use the exact stream key issued by the destination platform.",
        "Ensure the key has no spaces or unsupported symbols.",
      ],
      authStatus: "failed",
      endpointStatus: "unknown",
    };
  }

  return {
    valid: true,
    message: "Validation passed",
    actionableRemediation: [],
    authStatus: "passed",
    endpointStatus: "passed",
  };
}

async function probeValidationService(
  platform: StreamingPlatformRow,
  checkedAt: string,
): Promise<PlatformTestResult> {
  const serviceUrl = process.env.STREAM_VALIDATION_SERVICE_URL;
  if (!serviceUrl) {
    return {
      status: "failed",
      success: false,
      message: "Streaming validation service is not configured.",
      actionableRemediation: [
        "Set STREAM_VALIDATION_SERVICE_URL to the controlled probe endpoint.",
        "Retry once the validation service is available.",
      ],
      diagnostics: {
        network: "unknown",
        auth: "unknown",
        endpointReachability: "unknown",
        latency: null,
      },
      checkedAt,
    };
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    STREAM_VALIDATION_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      `${serviceUrl.replace(/\/$/, "")}/probe/rtmp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformId: platform.id,
          platformType: platform.platform_type,
          rtmpUrl: platform.rtmp_url,
          streamKey: platform.stream_key,
        }),
        signal: controller.signal,
      },
    );

    const payload = await response.json().catch(() => null);
    const latency = Date.now() - start;

    if (!response.ok) {
      return {
        status: "failed",
        success: false,
        message: payload?.message || "Failed to validate RTMP endpoint.",
        actionableRemediation: payload?.actionableRemediation || [
          "Confirm endpoint access from the streaming infrastructure.",
          "Verify credentials and destination live-state.",
        ],
        diagnostics: {
          network: normalizeDiagnostic(payload?.diagnostics?.network, "failed"),
          auth: normalizeDiagnostic(payload?.diagnostics?.auth, "unknown"),
          endpointReachability: normalizeDiagnostic(
            payload?.diagnostics?.endpointReachability,
            "failed",
          ),
          latency,
        },
        checkedAt,
      };
    }

    return {
      status: payload?.status === "passed" ? "passed" : "failed",
      success: payload?.status === "passed",
      message: payload?.message || "Connection validation completed.",
      actionableRemediation: payload?.actionableRemediation || [],
      diagnostics: {
        network: normalizeDiagnostic(payload?.diagnostics?.network, "passed"),
        auth: normalizeDiagnostic(payload?.diagnostics?.auth, "passed"),
        endpointReachability: normalizeDiagnostic(
          payload?.diagnostics?.endpointReachability,
          "passed",
        ),
        latency:
          typeof payload?.diagnostics?.latency === "number"
            ? payload.diagnostics.latency
            : latency,
      },
      checkedAt,
    };
  } catch (error) {
    const isAbort = error instanceof Error && error.name === "AbortError";
    return {
      status: "failed",
      success: false,
      message: isAbort
        ? "Validation timed out while probing RTMP endpoint."
        : "Unable to reach validation service.",
      actionableRemediation: [
        "Check network egress from the API to the validation service.",
        "Ensure the validation service is healthy and reachable.",
      ],
      diagnostics: {
        network: "failed",
        auth: "unknown",
        endpointReachability: "failed",
        latency: null,
      },
      checkedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeDiagnostic(
  value: unknown,
  fallback: PlatformTestDiagnosticStatus,
): PlatformTestDiagnosticStatus {
  return value === "passed" || value === "failed" || value === "unknown"
    ? value
    : fallback;
}
