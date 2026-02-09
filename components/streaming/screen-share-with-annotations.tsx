"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Monitor, Layout, X, Maximize2, Minimize2, Settings, PenTool } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import AnnotationManager from "./annotation/annotation-manager"

interface ScreenShareWithAnnotationsProps {
  isStreaming: boolean
}

export default function ScreenShareWithAnnotations({ isStreaming }: ScreenShareWithAnnotationsProps) {
  const [isSharing, setIsSharing] = useState(isStreaming)
  const [availableScreens, setAvailableScreens] = useState<string[]>([])
  const [selectedScreen, setSelectedScreen] = useState<string>("entire-screen")
  const [frameRate, setFrameRate] = useState<number>(30)
  const [showCursor, setShowCursor] = useState<boolean>(true)
  const [audioCapture, setAudioCapture] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [annotationsEnabled, setAnnotationsEnabled] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update isSharing when parent streaming state changes
  useEffect(() => {
    setIsSharing(isStreaming)
  }, [isStreaming])

  // Start screen sharing
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

      // Handle stream ending (user clicks "Stop sharing")
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopScreenShare()
      })

      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setIsSharing(true)
    } catch (error) {
      console.error("Error starting screen share:", error)
    }
  }

  // Stop screen sharing
  const stopScreenShare = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsSharing(false)
    setAnnotationsEnabled(false)
  }

  // Toggle screen sharing
  const toggleScreenShare = () => {
    if (isSharing) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Toggle annotations
  const toggleAnnotations = () => {
    setAnnotationsEnabled((prev) => !prev)
  }

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Monitor className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-medium">Screen Sharing</h3>
        </div>

        <div className="flex items-center space-x-2">
          {isSharing && (
            <Button
              variant={annotationsEnabled ? "secondary" : "outline"}
              size="sm"
              onClick={toggleAnnotations}
              className={
                annotationsEnabled ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : ""
              }
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
                <DialogTitle>Screen Sharing Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="screen-select">Share</Label>
                  <Select value={selectedScreen} onValueChange={setSelectedScreen}>
                    <SelectTrigger id="screen-select">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="frame-rate">Frame Rate: {frameRate} fps</Label>
                  </div>
                  <Slider
                    id="frame-rate"
                    min={15}
                    max={60}
                    step={5}
                    value={[frameRate]}
                    onValueChange={(value) => setFrameRate(value[0])}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="show-cursor">Show Cursor</Label>
                  <Switch id="show-cursor" checked={showCursor} onCheckedChange={setShowCursor} />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="audio-capture">Capture System Audio</Label>
                  <Switch id="audio-capture" checked={audioCapture} onCheckedChange={setAudioCapture} />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={isSharing ? "destructive" : "default"}
            onClick={toggleScreenShare}
            className={isSharing ? "" : "bg-gradient-to-r from-orange-600 to-yellow-500 hover:opacity-90"}
          >
            {isSharing ? "Stop Sharing" : "Start Sharing"}
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
        {isSharing ? (
          <div className="aspect-video relative">
            <video ref={videoRef} className="w-full h-full object-contain" autoPlay playsInline />

            {/* Annotation Layer */}
            {annotationsEnabled && <AnnotationManager containerRef={containerRef} isActive={annotationsEnabled} />}

            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button
                variant="secondary"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={stopScreenShare}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layout className="h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium mb-2">No screen being shared</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                Share your screen for tutorials and demonstrations
              </p>
              <Button
                onClick={startScreenShare}
                className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:opacity-90"
              >
                Start Screen Sharing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {isSharing && (
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 text-sm text-orange-800 dark:text-orange-300 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p>You are currently sharing your screen. {annotationsEnabled && "Annotation tools are enabled."}</p>
          </div>
        </div>
      )}
    </div>
  )
}
