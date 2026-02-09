type LiveMetrics = {
  timestamp: string
  viewers: number
  chatActivity: number
  device: string
  latency: number
  quality: string
  streamFrom: string
  deliverFrom: string
  player: string
}

type Listener = (payload: LiveMetrics) => void

class StreamEmitter {
  private listeners = new Map<number, Listener>()
  private id = 0
  private latest: LiveMetrics | null = null

  constructor() {
    this.latest = this.buildSample()
    setInterval(() => {
      this.emit(this.buildSample())
    }, 5_000)
  }

  subscribe(listener: Listener) {
    const listenerId = ++this.id
    this.listeners.set(listenerId, listener)
    return () => {
      this.listeners.delete(listenerId)
    }
  }

  getLatest() {
    return this.latest
  }

  private emit(payload: LiveMetrics) {
    this.latest = payload
    for (const listener of this.listeners.values()) {
      listener(payload)
    }
  }

  private buildSample(): LiveMetrics {
    const viewers = 900 + Math.floor(Math.random() * 300)
    return {
      timestamp: new Date().toISOString(),
      viewers,
      chatActivity: Math.floor(viewers * 0.2),
      device: Math.random() > 0.5 ? "desktop" : "mobile",
      latency: 80 + Math.floor(Math.random() * 70),
      quality: Math.random() > 0.4 ? "1080p" : "720p",
      streamFrom: "us-east-1",
      deliverFrom: "cdn-edge-5",
      player: "hlsjs",
    }
  }
}

const globalStreamEmitter = globalThis as typeof globalThis & {
  __streamEmitter?: StreamEmitter
}

export const streamEmitter = globalStreamEmitter.__streamEmitter ?? new StreamEmitter()
if (!globalStreamEmitter.__streamEmitter) {
  globalStreamEmitter.__streamEmitter = streamEmitter
}
