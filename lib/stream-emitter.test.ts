import assert from "node:assert/strict"
import test from "node:test"
import { StreamEmitter } from "./stream-emitter.ts"

function createMockResponse() {
  const writes: string[] = []
  let ended = false

  return {
    writes,
    get ended() {
      return ended
    },
    res: {
      write(chunk: string) {
        writes.push(chunk)
      },
      end() {
        ended = true
      },
    },
  }
}

function createThrowingOnFirstWriteResponse() {
  const writes: string[] = []
  let writeCalls = 0
  let endCalls = 0

  return {
    writes,
    get endCalls() {
      return endCalls
    },
    res: {
      write(chunk: string) {
        writeCalls += 1
        if (writeCalls === 1) {
          throw new Error("socket closed")
        }

        writes.push(chunk)
      },
      end() {
        endCalls += 1
      },
    },
  }
}

test("attaches clients, publishes updates, and detaches clients", () => {
  const emitter = new StreamEmitter()
  const first = createMockResponse()
  const second = createMockResponse()

  const firstId = emitter.addClient(first.res)
  emitter.addClient(second.res)

  const snapshot = { viewers: 42 }
  emitter.publish(snapshot)

  assert.deepEqual(emitter.getLatest(), snapshot)
  assert.equal(first.writes.join(""), 'event: metrics\ndata: {"viewers":42}\n\n')
  assert.equal(second.writes.join(""), 'event: metrics\ndata: {"viewers":42}\n\n')

  emitter.removeClient(firstId)
  emitter.publish({ viewers: 50 })

  assert.equal(first.ended, true)
  assert.equal(first.writes.join(""), 'event: metrics\ndata: {"viewers":42}\n\n')
  assert.equal(
    second.writes.join(""),
    'event: metrics\ndata: {"viewers":42}\n\nevent: metrics\ndata: {"viewers":50}\n\n',
  )
})

test("removes clients whose write fails and ends them once", () => {
  const emitter = new StreamEmitter()
  const throwingClient = createThrowingOnFirstWriteResponse()
  const healthyClient = createMockResponse()

  const failingClientId = emitter.addClient(throwingClient.res)
  emitter.addClient(healthyClient.res)

  emitter.broadcast({ viewers: 7 })

  const internalClients = (emitter as unknown as { clients: Map<number, unknown> }).clients
  assert.equal(internalClients.has(failingClientId), false)
  assert.equal(throwingClient.endCalls, 1)
  assert.equal(healthyClient.writes.join(""), 'event: metrics\ndata: {"viewers":7}\n\n')
})

test("broadcast supports non-default event names", () => {
  const emitter = new StreamEmitter()
  const client = createMockResponse()

  emitter.addClient(client.res)
  emitter.broadcast({ id: "abc" }, "inventory-update")

  assert.equal(client.writes.join(""), 'event: inventory-update\ndata: {"id":"abc"}\n\n')
})

test("broadcast serializes nested payloads consistently in SSE output", () => {
  const emitter = new StreamEmitter()
  const client = createMockResponse()

  emitter.addClient(client.res)
  const payload = {
    storefront: {
      id: "shop-1",
      metrics: {
        activeUsers: 12,
        segments: ["vip", "new"],
      },
    },
  }

  emitter.broadcast(payload)
  emitter.broadcast(payload)

  const expectedFrame =
    'event: metrics\ndata: {"storefront":{"id":"shop-1","metrics":{"activeUsers":12,"segments":["vip","new"]}}}\n\n'
  assert.equal(client.writes.join(""), `${expectedFrame}${expectedFrame}`)
})
