"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Wifi, Bell, Shield, Mic, Video } from "lucide-react"

export default function HostSettingsPanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4 text-orange-500" />
          Host Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4" /> Stream Quality
            </Label>
            <Badge variant="secondary">Auto</Badge>
          </div>
          <Select defaultValue="1080p">
            <SelectTrigger>
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="1440p">1440p</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Mic className="h-4 w-4" /> Microphone Gain
            </Label>
            <span className="text-xs text-muted-foreground">75%</span>
          </div>
          <Slider defaultValue={[75]} max={100} step={1} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <Label className="flex items-center gap-2 text-sm">
              <Wifi className="h-4 w-4" /> Low-latency mode
            </Label>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" /> Live notifications
            </Label>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" /> Moderation safeguards
            </Label>
            <Switch defaultChecked />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
