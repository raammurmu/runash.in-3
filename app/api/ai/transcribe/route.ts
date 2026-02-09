import { NextResponse } from "next/server"

interface TranscriptionRequest {
  language?: string
  audioBase64?: string | null
  mimeType?: string | null
}

const languageMap: Record<string, string> = {
  "en-US": "en",
  "es-ES": "es",
  "hi-IN": "hi",
  "fr-FR": "fr",
}

function decodeBase64Audio(base64: string) {
  try {
    return Buffer.from(base64, "base64")
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as TranscriptionRequest
  const language = body.language ?? "en-US"

  if (!body.audioBase64) {
    return NextResponse.json({
      language,
      text: "",
      source: "fallback",
      reason: "audio_required",
    })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      {
        language,
        text: "",
        source: "fallback",
        reason: "missing_transcription_provider",
      },
      { status: 503 },
    )
  }

  try {
    const audioBuffer = decodeBase64Audio(body.audioBase64)
    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ language, text: "", source: "fallback", reason: "invalid_audio_payload" }, { status: 400 })
    }

    const extension = body.mimeType?.includes("mp4") ? "m4a" : "webm"
    const blob = new Blob([audioBuffer], { type: body.mimeType ?? "audio/webm" })

    const formData = new FormData()
    formData.append("model", "whisper-1")
    formData.append("file", blob, `chunk.${extension}`)
    formData.append("language", languageMap[language] ?? "en")

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!transcriptionResponse.ok) {
      return NextResponse.json({ language, text: "", source: "fallback", reason: "transcription_failed" }, { status: 502 })
    }

    const data = (await transcriptionResponse.json()) as { text?: string }

    return NextResponse.json({
      language,
      text: data.text?.trim() ?? "",
      source: "fallback",
    })
  } catch {
    return NextResponse.json({ language, text: "", source: "fallback", reason: "transcription_error" }, { status: 500 })
  }
}
