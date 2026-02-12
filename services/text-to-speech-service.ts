"use client"

export interface TTSSettings {
  voice?: SpeechSynthesisVoice
  rate: number
  pitch: number
  volume: number
}

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null
  private supported = false
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis
      this.supported = true
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return []
    return this.synth.getVoices()
  }

  speak(
    text: string,
    settings: TTSSettings = { rate: 1, pitch: 1, volume: 1 },
    onEnd?: () => void,
    onError?: (error: string) => void,
  ) {
    if (!this.synth) {
      onError?.("Text-to-speech is not supported in this browser")
      return
    }

    // Stop any current speech
    this.stop()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    utterance.volume = settings.volume

    if (settings.voice) {
      utterance.voice = settings.voice
    }

    utterance.onend = () => {
      this.currentUtterance = null
      onEnd?.()
    }

    utterance.onerror = (event) => {
      this.currentUtterance = null
      onError?.(`Speech synthesis error: ${event.error}`)
    }

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
      this.currentUtterance = null
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause()
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume()
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false
  }

  isSupported(): boolean {
    return this.supported
  }
}
