import assert from "node:assert/strict"
import test from "node:test"
import { detectPromptInjection } from "./agents-safety.ts"

test("does not flag normal content", () => {
  const result = detectPromptInjection("Summarize this stream topic")
  assert.equal(result.flagged, false)
})
