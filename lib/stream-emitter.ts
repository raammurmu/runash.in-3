import type { NextApiResponse } from "next"

type SSEClient = {
  id: number
  res: Pick<NextApiResponse, "write" | "end">
}

export type StreamSnapshot = Record<string, unknown>

export class StreamEmitter {
  private clients = new Map<number, SSEClient>()
  private latest: StreamSnapshot | null = null
  private nextClientId = 1

  addClient(res: Pick<NextApiResponse, "write" | "end">): number {
    const id = this.nextClientId++
    this.clients.set(id, { id, res })
    return id
  }

  removeClient(clientId: number): void {
    const client = this.clients.get(clientId)
    if (!client) {
      return
    }

    this.clients.delete(clientId)
    try {
      client.res.end()
    } catch {
      // noop: socket may already be closed.
    }
  }

  getLatest(): StreamSnapshot | null {
    return this.latest
  }

  publish(snapshot: StreamSnapshot, event = "metrics"): void {
    this.latest = snapshot
    this.broadcast(snapshot, event)
  }

  broadcast(payload: unknown, event = "metrics"): void {
    const serialized = JSON.stringify(payload)

    for (const [clientId, client] of this.clients) {
      try {
        client.res.write(`event: ${event}\n`)
        client.res.write(`data: ${serialized}\n\n`)
      } catch {
        this.clients.delete(clientId)
        try {
          client.res.end()
        } catch {
          // noop: socket may already be closed.
        }
      }
    }
  }
}

export const streamEmitter = new StreamEmitter()
