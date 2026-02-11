import { type NextRequest, NextResponse } from "next/server"
import { EmailBounceHandler } from "@/lib/email-bounce-handler"
import { checkReplay, ensureTimestampWithinTolerance, verifyHmacSignature } from "@/lib/webhook-security"
import { generateCorrelationId, logEvent, serializeError, withRequestContext } from "@/lib/observability"

export async function POST(request: NextRequest) {
  const correlationId = request.headers.get("x-correlation-id") || generateCorrelationId()
  const requestId = request.headers.get("x-request-id") || generateCorrelationId()

  return withRequestContext({ correlationId, requestId, route: "/api/email/webhook/bounce" }, async () => {
    try {
      const rawBody = await request.text()
      const signingSecret = process.env.EMAIL_WEBHOOK_SIGNING_SECRET
      const signature = request.headers.get("x-webhook-signature")
      const timestamp = request.headers.get("x-webhook-timestamp")
      const webhookId = request.headers.get("x-webhook-id") || request.headers.get("x-event-id")

      if (signingSecret) {
        if (!ensureTimestampWithinTolerance(timestamp)) {
          return NextResponse.json({ error: "Webhook timestamp is outside tolerance" }, { status: 400 })
        }

        if (!verifyHmacSignature(rawBody, signingSecret, signature)) {
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
        }
      }

      if (webhookId && !checkReplay(webhookId)) {
        return NextResponse.json({ error: "Duplicate webhook delivery" }, { status: 409 })
      }

      const body = JSON.parse(rawBody)
      const bounceEvents = await parseBounceWebhook(body)

      let processed = 0
      let errors = 0

      for (const bounceEvent of bounceEvents) {
        try {
          const success = await EmailBounceHandler.processBounce(bounceEvent)
          if (success) {
            processed++
          } else {
            errors++
          }
        } catch (error) {
          logEvent("error", "Error processing bounce event", { error: serializeError(error) })
          errors++
        }
      }

      logEvent("info", "Bounce webhook processed", { processed, errors, eventCount: bounceEvents.length })

      return NextResponse.json({
        success: true,
        processed,
        errors,
      })
    } catch (error) {
      logEvent("error", "Error processing bounce webhook", { error: serializeError(error) })
      return NextResponse.json({ error: "Failed to process bounce webhook" }, { status: 500 })
    }
  })
}

async function parseBounceWebhook(
  body: any,
): Promise<
  Array<{
    message_id: string
    recipient_email: string
    bounce_type: "hard" | "soft" | "complaint"
    bounce_subtype?: string
    reason: string
    diagnostic_code?: string
    timestamp: Date
    raw_data?: Record<string, any>
  }>
> {
  const events: any[] = []

  if (body.Type === "Notification" && body.Message) {
    const message = JSON.parse(body.Message)

    if (message.notificationType === "Bounce") {
      const bounce = message.bounce
      for (const recipient of bounce.bouncedRecipients) {
        events.push({
          message_id: message.mail.messageId || `unknown_${Date.now()}`,
          recipient_email: recipient.emailAddress,
          bounce_type: bounce.bounceType === "Permanent" ? "hard" : "soft",
          bounce_subtype: bounce.bounceSubType,
          reason: recipient.diagnosticCode || bounce.bounceSubType,
          diagnostic_code: recipient.diagnosticCode,
          timestamp: new Date(bounce.timestamp),
          raw_data: message,
        })
      }
    } else if (message.notificationType === "Complaint") {
      for (const recipient of message.complaint.complainedRecipients) {
        events.push({
          message_id: message.mail.messageId || `unknown_${Date.now()}`,
          recipient_email: recipient.emailAddress,
          bounce_type: "complaint" as const,
          reason: "Spam complaint",
          timestamp: new Date(message.complaint.timestamp),
          raw_data: message,
        })
      }
    }
  } else if (Array.isArray(body)) {
    for (const event of body) {
      if (event.event === "bounce" || event.event === "dropped") {
        events.push({
          message_id: event.sg_message_id || `unknown_${Date.now()}`,
          recipient_email: event.email,
          bounce_type: event.type === "bounce" ? "hard" : "soft",
          reason: event.reason || "Unknown bounce",
          timestamp: new Date(event.timestamp * 1000),
          raw_data: event,
        })
      } else if (event.event === "spamreport") {
        events.push({
          message_id: event.sg_message_id || `unknown_${Date.now()}`,
          recipient_email: event.email,
          bounce_type: "complaint" as const,
          reason: "Spam complaint",
          timestamp: new Date(event.timestamp * 1000),
          raw_data: event,
        })
      }
    }
  } else if (body["event-data"]) {
    const eventData = body["event-data"]
    if (eventData.event === "failed" || eventData.event === "complained") {
      events.push({
        message_id: eventData.message?.headers?.["message-id"] || `unknown_${Date.now()}`,
        recipient_email: eventData.recipient,
        bounce_type:
          eventData.event === "complained" ? "complaint" : eventData.severity === "permanent" ? "hard" : "soft",
        reason: eventData["delivery-status"]?.description || "Unknown bounce",
        diagnostic_code: eventData["delivery-status"]?.code,
        timestamp: new Date(eventData.timestamp * 1000),
        raw_data: eventData,
      })
    }
  } else if (body.email && body.event) {
    events.push({
      message_id: body.message_id || `unknown_${Date.now()}`,
      recipient_email: body.email,
      bounce_type: body.bounce_type || "hard",
      reason: body.reason || "Unknown bounce",
      timestamp: new Date(body.timestamp || Date.now()),
      raw_data: body,
    })
  }

  return events
}
