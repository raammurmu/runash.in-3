const SENSITIVE_ACTION_PATTERNS = [/payment/i, /checkout/i, /account/i, /send/i, /wire/i, /refund/i]
const PROMPT_INJECTION_PATTERNS = [/ignore previous/i, /reveal system prompt/i, /disable safeguards/i, /bypass/i]

export function detectPromptInjection(input: string): { flagged: boolean; reasons: string[] } {
  const reasons = PROMPT_INJECTION_PATTERNS.filter((pattern) => pattern.test(input)).map((pattern) => pattern.source)
  return {
    flagged: reasons.length > 0,
    reasons,
  }
}

export function classifyActionRisk(actionType: string): "low" | "high" {
  return SENSITIVE_ACTION_PATTERNS.some((pattern) => pattern.test(actionType)) ? "high" : "low"
}

export function requiresConfirmation(actionType: string): boolean {
  return classifyActionRisk(actionType) === "high"
}
