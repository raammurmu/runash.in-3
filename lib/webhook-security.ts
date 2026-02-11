import crypto from "node:crypto"

const replayStore = new Map<string, number>()
const DEFAULT_TOLERANCE_SECONDS = 300
const DEFAULT_REPLAY_TTL_MS = 24 * 60 * 60 * 1000

function cleanupReplayStore(now: number): void {
  for (const [eventId, expiresAt] of replayStore.entries()) {
    if (expiresAt <= now) {
      replayStore.delete(eventId)
    }
  }
}

export function ensureTimestampWithinTolerance(
  timestampHeader: string | null,
  toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
): boolean {
  if (!timestampHeader) {
    return false
  }

  const timestamp = Number(timestampHeader)
  if (!Number.isFinite(timestamp)) {
    return false
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  return Math.abs(nowSeconds - timestamp) <= toleranceSeconds
}

export function checkReplay(eventId: string, ttlMs = DEFAULT_REPLAY_TTL_MS): boolean {
  const now = Date.now()
  cleanupReplayStore(now)

  if (replayStore.has(eventId)) {
    return false
  }

  replayStore.set(eventId, now + ttlMs)
  return true
}

export function verifyHmacSignature(payload: string, secret: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) {
    return false
  }

  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader))
  } catch {
    return false
  }
}
