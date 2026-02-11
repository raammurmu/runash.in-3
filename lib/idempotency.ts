export type IdempotencyRecord<T> = {
  key: string
  scope: string
  requestHash: string
  statusCode: number
  response: T
  createdAt: number
}

type InFlightRecord<T> = {
  key: string
  scope: string
  requestHash: string
  promise: Promise<IdempotencyRecord<T>>
}

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24

const completedRecords = new Map<string, IdempotencyRecord<unknown>>()
const inFlightRecords = new Map<string, InFlightRecord<unknown>>()

function mapKey(scope: string, idempotencyKey: string) {
  return `${scope}:${idempotencyKey}`
}

export function getIdempotencyKeyFromHeaders(headers: Headers): string | null {
  const key = headers.get("idempotency-key")?.trim()
  return key ? key : null
}

export async function executeIdempotentMutation<T>(params: {
  idempotencyKey: string
  scope: string
  requestHash: string
  ttlMs?: number
  execute: () => Promise<{ statusCode: number; response: T }>
}): Promise<{ statusCode: number; response: T; replayed: boolean }> {
  const { idempotencyKey, scope, requestHash, execute, ttlMs = DEFAULT_TTL_MS } = params
  const key = mapKey(scope, idempotencyKey)
  const now = Date.now()

  const existing = completedRecords.get(key) as IdempotencyRecord<T> | undefined
  if (existing && now - existing.createdAt <= ttlMs) {
    if (existing.requestHash !== requestHash) {
      throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD")
    }

    return {
      statusCode: existing.statusCode,
      response: existing.response,
      replayed: true,
    }
  }

  const inflight = inFlightRecords.get(key) as InFlightRecord<T> | undefined
  if (inflight) {
    if (inflight.requestHash !== requestHash) {
      throw new Error("IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD")
    }

    const settled = await inflight.promise
    return {
      statusCode: settled.statusCode,
      response: settled.response,
      replayed: true,
    }
  }

  const promise = (async () => {
    const result = await execute()
    const record: IdempotencyRecord<T> = {
      key: idempotencyKey,
      scope,
      requestHash,
      statusCode: result.statusCode,
      response: result.response,
      createdAt: Date.now(),
    }
    completedRecords.set(key, record)
    return record
  })()

  inFlightRecords.set(key, { key: idempotencyKey, scope, requestHash, promise })

  try {
    const settled = await promise
    return {
      statusCode: settled.statusCode,
      response: settled.response,
      replayed: false,
    }
  } finally {
    inFlightRecords.delete(key)
  }
}
