export type RetryOptions = {
  maxAttempts: number
  baseDelayMs: number
  maxDelayMs: number
  jitterRatio?: number
  timeoutMs?: number
  isRetryableError?: (error: unknown) => boolean
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

export async function executeWithRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const {
    maxAttempts,
    baseDelayMs,
    maxDelayMs,
    jitterRatio = 0.2,
    timeoutMs,
    isRetryableError = () => true,
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const task = fn()
      return timeoutMs ? await withTimeout(task, timeoutMs, `Operation timed out after ${timeoutMs}ms`) : await task
    } catch (error) {
      lastError = error
      const shouldRetry = attempt < maxAttempts && isRetryableError(error)
      if (!shouldRetry) {
        throw error
      }

      const expDelay = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1))
      const jitter = expDelay * jitterRatio * Math.random()
      await sleep(Math.round(expDelay + jitter))
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Operation failed")
}
