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
