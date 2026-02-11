import { executeWithRetry } from "@/lib/resilience"

export type JobStatus = "queued" | "processing" | "completed" | "failed" | "dead-letter"

export type QueueJob<TPayload = Record<string, unknown>> = {
  id: string
  name: string
  payload: TPayload
  attempts: number
  maxAttempts: number
  status: JobStatus
  createdAt: string
  updatedAt: string
  lastError?: string
}

type Processor = (payload: Record<string, unknown>) => Promise<void>

type ProcessorOptions = {
  timeoutMs?: number
  maxAttempts?: number
}

type RegisteredProcessor = {
  run: Processor
  timeoutMs: number
  maxAttempts: number
}

class InMemoryJobQueue {
  private jobs: QueueJob[] = []
  private deadLetterJobs: QueueJob[] = []
  private processors = new Map<string, RegisteredProcessor>()
  private processing = false

  registerProcessor(name: string, processor: Processor, options: ProcessorOptions = {}) {
    this.processors.set(name, {
      run: processor,
      timeoutMs: options.timeoutMs ?? 20_000,
      maxAttempts: options.maxAttempts ?? 3,
    })
  }

  enqueue(name: string, payload: Record<string, unknown>, maxAttempts?: number): QueueJob {
    const processor = this.processors.get(name)
    const effectiveAttempts = maxAttempts ?? processor?.maxAttempts ?? 3
    const job: QueueJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      name,
      payload,
      attempts: 0,
      maxAttempts: effectiveAttempts,
      status: "queued",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.jobs.push(job)
    this.kickoff()
    return job
  }

  replayDeadLetter(jobId: string): QueueJob | null {
    const idx = this.deadLetterJobs.findIndex((job) => job.id === jobId)
    if (idx === -1) return null

    const failed = this.deadLetterJobs.splice(idx, 1)[0]
    failed.status = "queued"
    failed.attempts = 0
    failed.lastError = undefined
    failed.updatedAt = new Date().toISOString()

    this.kickoff()
    return failed
  }

  private kickoff() {
    if (this.processing) return
    this.processing = true
    void this.drain()
  }

  private async drain() {
    while (true) {
      const next = this.jobs.find((job) => job.status === "queued")
      if (!next) {
        this.processing = false
        return
      }

      const processor = this.processors.get(next.name)
      if (!processor) {
        next.status = "dead-letter"
        next.lastError = `Missing processor for job '${next.name}'`
        next.updatedAt = new Date().toISOString()
        this.deadLetterJobs.unshift({ ...next })
        continue
      }

      next.status = "processing"
      next.updatedAt = new Date().toISOString()

      try {
        await executeWithRetry(
          async () => {
            next.attempts += 1
            next.updatedAt = new Date().toISOString()
            await processor.run(next.payload)
          },
          {
            maxAttempts: next.maxAttempts,
            baseDelayMs: 400,
            maxDelayMs: 2500,
            jitterRatio: 0.25,
            timeoutMs: processor.timeoutMs,
          },
        )

        next.status = "completed"
        next.updatedAt = new Date().toISOString()
      } catch (error) {
        next.status = "dead-letter"
        next.lastError = error instanceof Error ? error.message : "Unknown worker error"
        next.updatedAt = new Date().toISOString()
        this.deadLetterJobs.unshift({ ...next })
      }
    }
  }

  getMetrics() {
    const statusCounts = this.jobs.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] ?? 0) + 1
        return acc
      },
      {} as Record<JobStatus, number>,
    )

    return {
      totals: {
        jobs: this.jobs.length,
        deadLetter: this.deadLetterJobs.length,
      },
      statusCounts,
      recentDeadLetters: this.deadLetterJobs.slice(0, 25),
      recentJobs: this.jobs.slice(-25).reverse(),
    }
  }
}

export const jobQueue = new InMemoryJobQueue()
