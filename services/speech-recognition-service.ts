"use client"

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export class SpeechRecognitionService {
  private recognition: any = null
  private supported = false

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.supported = true
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "en-US"
    this.recognition.maxAlternatives = 1
  }

  startListening(onResult: (result: SpeechRecognitionResult) => void, onError: (error: string) => void) {
    if (!this.supported) {
      onError("Speech recognition is not supported in this browser")
      return
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      onResult({
        transcript: result[0].transcript,
        confidence: result[0].confidence,
        isFinal: result.isFinal,
      })
    }

    this.recognition.onerror = (event: any) => {
      onError(`Speech recognition error: ${event.error}`)
    }

    this.recognition.start()
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  isSupported() {
    return this.supported
  }
}
