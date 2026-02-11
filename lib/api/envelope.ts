import { type NextRequest, NextResponse } from "next/server"

export type ApiMeta = Record<string, unknown>

export type ApiEnvelopeError = {
  code: string
  message: string
  details?: unknown
}

export type ApiSuccessEnvelope<T> = {
  success: true
  data: T
  error: null
  requestId: string
  meta?: ApiMeta
}

export type ApiErrorEnvelope = {
  success: false
  data: null
  error: ApiEnvelopeError
  requestId: string
  meta?: ApiMeta
}

type EnvelopeOptions = {
  status?: number
  meta?: ApiMeta
  legacy?: Record<string, unknown>
}

function sanitizeLegacy(legacy?: Record<string, unknown>) {
  if (!legacy) {
    return {}
  }

  const { success, data, error, requestId, meta, ...safeLegacy } = legacy
  void success
  void data
  void error
  void requestId
  void meta

  return safeLegacy
}

export function resolveRequestId(request: NextRequest) {
  return request.headers.get("x-request-id") || request.headers.get("x-correlation-id") || crypto.randomUUID()
}

export function respondSuccess<T>(request: NextRequest, data: T, options: EnvelopeOptions = {}) {
  const requestId = resolveRequestId(request)
  const envelope: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    error: null,
    requestId,
    ...(options.meta ? { meta: options.meta } : {}),
  }

  return NextResponse.json({ ...envelope, ...sanitizeLegacy(options.legacy) }, { status: options.status ?? 200 })
}

export function respondError(
  request: NextRequest,
  error: ApiEnvelopeError,
  options: EnvelopeOptions = {},
) {
  const requestId = resolveRequestId(request)
  const envelope: ApiErrorEnvelope = {
    success: false,
    data: null,
    error,
    requestId,
    ...(options.meta ? { meta: options.meta } : {}),
  }

  return NextResponse.json({ ...envelope, ...sanitizeLegacy(options.legacy) }, { status: options.status ?? 500 })
}
