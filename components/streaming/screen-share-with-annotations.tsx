"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Monitor, Layout, X, Maximize2, Minimize2, Settings, PenTool, Languages, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import AnnotationManager from "./annotation/annotation-manager"
import {
  defaultMediaAIPipelineSettings,
  MediaAIPipeline,
  type MediaAIPipelineSettings,
  type CaptionPacket,
} from "@/services/media-ai-pipeline"

interface ScreenShareWithAnnotationsProps {
 
  isActive?: boolean
  isStreaming?: boolean
  onStart?: (stream: MediaStream) => void
  onStop?: () => void
  onSettingsChange?: (settings: MediaAIPipelineSettings) => void
  initialSettings?: MediaAIPipelineSettings
}

const languages = [
  { value: "en-US", label: "English" },
  { value: "es-ES", label: "Spanish" },
  { value: "hi-IN", label: "Hindi" },
  { value: "fr-FR", label: "French" },
]

export default function ScreenShareWithAnnotations({
  isActive,
  isStreaming,
  onStart = () => undefined,
  onStop = () => undefined,
  onSettingsChange,
  initialSettings,
}: ScreenShareWithAnnotationsProps) {
  const aiPipeline = useMemo(() => new MediaAIPipeline(), [])
  const [isSharing, setIsSharing] = useState(isActive ?? isStreaming ?? false)
  const [availableScreens, setAvailableScreens] = useState<string[]>([])

  const [selectedScreen, setSelectedScreen] = useState<string>("entire-screen")
  const [frameRate, setFrameRate] = useState<number>(30)
  const [showCursor, setShowCursor] = useState<boolean>(true)
  const [audioCapture, setAudioCapture] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [annotationsEnabled, setAnnotationsEnabled] = useState<boolean>(false)
  const [aiSettings, setAiSettings] = useState<MediaAIPipelineSettings>(
    initialSettings ?? aiPipeline.restoreSettings() ?? defaultMediaAIPipelineSettings,
  )
  const [latestCaption, setLatestCaption] = useState<CaptionPacket | null>(null)
  const [pipelineWarning, setPipelineWarning] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const captionCleanupRef = useRef<(() => void) | null>(null)

  const capabilities = aiPipeline.getCapabilities()

  useEffect(() => {
    setIsSharing(isActive ?? isStreaming ?? false)
  }, [isActive, isStreaming])

  useEffect(() => {
    if (!initialSettings) return

    setAiSettings((previous) => {
      const mergedSettings = { ...previous, ...initialSettings }
      const hasChanges = (Object.keys(mergedSettings) as Array<keyof MediaAIPipelineSettings>).some(
        (key) => mergedSettings[key] !== previous[key],
      )

      return hasChanges ? mergedSettings : previous
    })
  }, [initialSettings])

  useEffect(() => {
    aiPipeline.persistSettings(aiSettings)
    onSettingsChange?.(aiSettings)
  }, [aiSettings, aiPipeline, onSettingsChange])

  useEffect(() => {
    if (!isSharing || !videoRef.current || !canvasRef.current) return

    let raf = 0
    const draw = () => {
      if (!videoRef.current || !canvasRef.current) return
      aiPipeline.processVideoFrame(videoRef.current, canvasRef.current, aiSettings)
      raf = requestAnimationFrame(draw)
    }

    const onPlay = () => {
      cancelAnimationFrame(raf)
      draw()
    }

    videoRef.current.addEventListener("play", onPlay)
    if (!videoRef.current.paused) onPlay()

    return () => {
      videoRef.current?.removeEventListener("play", onPlay)
      cancelAnimationFrame(raf)
    }
  }, [isSharing, aiSettings, aiPipeline])

 
  useEffect(() => {
    if (!aiSettings.captionsEnabled || !isSharing) {
      captionCleanupRef.current?.()
      captionCleanupRef.current = null
      return
    }

    captionCleanupRef.current = aiPipeline.startCaptions(
      aiSettings.captionLanguage,
      (packet) => setLatestCaption(packet),
      (error) => setPipelineWarning(error),
      (videoRef.current?.srcObject as MediaStream | null) ?? null,
    )

    return () => {
      captionCleanupRef.current?.()
      captionCleanupRef.current = null
    }
  }, [aiSettings.captionsEnabled, aiSettings.captionLanguage, isSharing, aiPipeline])
  const startScreenShare = async () => {
    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          cursor: showCursor ? "always" : "never",
          frameRate: { ideal: frameRate, max: 60 },
        },
        audio: audioCapture,
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
      const enhancedStream = await aiPipeline.enhanceAudio(stream, aiSettings.audioDenoise)

      enhancedStream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopScreenShare()
      })

      if (videoRef.current) {
        videoRef.current.srcObject = enhancedStream
        await videoRef.current.play()
      }

      setIsSharing(true)
 
      onStart(enhancedStream)

    } catch (error) {
      setPipelineWarning("Unable to start screen share on this browser/device.")
      console.error("Error starting screen share:", error)
    }
  }

  const stopScreenShare = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    captionCleanupRef.current?.()
    captionCleanupRef.current = null
    setIsSharing(false)
    setAnnotationsEnabled(false)
 
    setLatestCaption(null)
    onStop()

  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setPipelineWarning("Fullscreen is not available on this browser.")
      })
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const updateAiSetting = <T extends keyof MediaAIPipelineSettings>(key: T, value: MediaAIPipelineSettings[T]) => {
    setAiSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Monitor className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-medium">Screen Sharing + AI Pipeline</h3>
        </div>

        <div className="flex items-center space-x-2">
          {isSharing && (
            <Button
              variant={annotationsEnabled ? "secondary" : "outline"}
              size="sm"
              onClick={() => setAnnotationsEnabled((prev) => !prev)}
            >
              <PenTool className="h-4 w-4 mr-2" />
              {annotationsEnabled ? "Annotations On" : "Annotations"}
            </Button>
          )}

          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Production Pipeline Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Share</Label>
                  <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select what to share" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entire-screen">Entire Screen</SelectItem>
                      <SelectItem value="application-window">Application Window</SelectItem>
                      <SelectItem value="browser-tab">Browser Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frame Rate: {frameRate} fps</Label>
                  <Slider min={15} max={60} step={5} value={[frameRate]} onValueChange={(v) => setFrameRate(v[0])} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between"><Label>Auto-framing</Label><Switch checked={aiSettings.autoFraming} onCheckedChange={(v) => updateAiSetting("autoFraming", v)} /></div>
                  <div className="flex items-center justify-between"><Label>Beautify</Label><Switch checked={aiSettings.beautify} onCheckedChange={(v) => updateAiSetting("beautify", v)} /></div>
                  <div className="flex items-center justify-between"><Label>Light correction</Label><Switch checked={aiSettings.lightCorrection} onCheckedChange={(v) => updateAiSetting("lightCorrection", v)} /></div>
                  <div className="flex items-center justify-between"><Label>Audio denoise</Label><Switch checked={aiSettings.audioDenoise} onCheckedChange={(v) => updateAiSetting("audioDenoise", v)} /></div>
                  <div className="flex items-center justify-between"><Label>Live captions</Label><Switch checked={aiSettings.captionsEnabled} onCheckedChange={(v) => updateAiSetting("captionsEnabled", v)} /></div>
                  <div className="flex items-center justify-between"><Label>Adaptive quality</Label><Switch checked={aiSettings.adaptiveQuality} onCheckedChange={(v) => updateAiSetting("adaptiveQuality", v)} /></div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Languages className="h-4 w-4" /> Caption Language</Label>
                  <Select value={aiSettings.captionLanguage} onValueChange={(v) => updateAiSetting("captionLanguage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quality mode</Label>
                  <Select
                    value={aiSettings.qualityMode}
                    onValueChange={(v) => updateAiSetting("qualityMode", v as MediaAIPipelineSettings["qualityMode"])}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label>Show Cursor</Label>
                  <Switch checked={showCursor} onCheckedChange={setShowCursor} />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label>Capture System Audio</Label>
                  <Switch checked={audioCapture} onCheckedChange={setAudioCapture} />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={isSharing ? "destructive" : "default"}
            onClick={isSharing ? stopScreenShare : startScreenShare}
            className={isSharing ? "" : "bg-gradient-to-r from-orange-600 to-yellow-500 hover:opacity-90"}
          >
            {isSharing ? "Stop Sharing" : "Start Sharing"}
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden h-[calc(100%-3rem)] min-h-[320px]">
        {isSharing ? (
          <div className="h-full relative">
            <video ref={videoRef} className="hidden" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {aiSettings.captionsEnabled && latestCaption?.text && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/65 text-white text-sm rounded px-3 py-1.5 max-w-[80%] text-center">
                {latestCaption.text}
              </div>
            )}

            {annotationsEnabled && <AnnotationManager containerRef={containerRef} isActive={annotationsEnabled} />}

            <div className="absolute top-3 right-3 bg-black/50 rounded-full px-3 py-1 text-xs text-white flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Pipeline Active
            </div>

            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button variant="secondary" size="icon" className="bg-black/50 text-white" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button variant="secondary" size="icon" className="bg-black/50 text-white" onClick={stopScreenShare}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 h-full">
            <CardContent className="flex flex-col items-center justify-center py-12 h-full">
              <Layout className="h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium mb-2">No screen being shared</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                Start sharing to run segmentation, auto-framing, denoise, and live captions.
              </p>
              <Button onClick={startScreenShare} className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:opacity-90">
                Start Screen Sharing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="text-xs rounded-md border bg-muted/30 p-2 flex flex-wrap gap-x-4 gap-y-1">
        <span>Worker: {capabilities.worker ? "available" : "fallback"}</span>
        <span>OffscreenCanvas: {capabilities.offscreenCanvas ? "available" : "fallback"}</span>
        <span>Web Speech: {capabilities.webSpeech ? "native" : "server fallback"}</span>
        {pipelineWarning && <span className="text-amber-600">{pipelineWarning}</span>}
      </div>
    </div>
  )
}
