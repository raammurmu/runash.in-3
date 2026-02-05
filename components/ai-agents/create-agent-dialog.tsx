"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Bot, MessageSquare, ShoppingCart, BarChart3 } from "lucide-react"

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateAgentDialog({ open, onOpenChange, onSubmit }: CreateAgentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "sales" as "sales" | "engagement" | "analytics" | "moderation",
    description: "",
    enabled: true,
    status: "active" as "active" | "idle" | "disabled",
    performance_score: 100,
    tasks_completed: 0,
    current_task: null,
    settings: {},
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setFormData({
        name: "",
        type: "sales",
        description: "",
        enabled: true,
        status: "active",
        performance_score: 100,
        tasks_completed: 0,
        current_task: null,
        settings: {},
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "sales":
        return <ShoppingCart className="h-4 w-4" />
      case "engagement":
        return <MessageSquare className="h-4 w-4" />
      case "analytics":
        return <BarChart3 className="h-4 w-4" />
      case "moderation":
        return <Bot className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New AI Agent</DialogTitle>
            <DialogDescription>Configure your AI agent to automate tasks during your live streams.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Sales Assistant"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Agent Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">
                    <div className="flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Sales
                    </div>
                  </SelectItem>
                  <SelectItem value="engagement">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Engagement
                    </div>
                  </SelectItem>
                  <SelectItem value="analytics">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </div>
                  </SelectItem>
                  <SelectItem value="moderation">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2" />
                      Moderation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe what this agent does..."
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enabled">Activate Agent</Label>
                <div className="text-sm text-muted-foreground">Agent will be ready to use immediately</div>
              </div>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => {
                  handleChange("enabled", checked)
                  handleChange("status", checked ? "active" : "disabled")
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
