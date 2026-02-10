"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import GridLayout, { type Layout } from "react-grid-layout"
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { WidgetLibrary } from "@/components/analytics/custom/widget-library"
import { WidgetRenderer } from "@/components/analytics/custom/widget-renderer"
import { DashboardTemplates } from "@/components/analytics/custom/dashboard-templates"
import { WidgetConfigDialog } from "@/components/analytics/custom/widget-config-dialog"
import type { Dashboard, DashboardWidget } from "@/types/custom-dashboard"
import {
  Plus,
  Save,
  Share2,
  Download,
  Upload,
  Settings,
  Grid3x3,
  MoreVertical,
  Copy,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react"

const DRAFT_STORAGE_KEY = "custom-dashboard-draft"

const createDefaultDashboard = (): Dashboard => ({
  id: "",
  name: "My Custom Dashboard",
  description: "A personalized analytics dashboard",
  widgets: [],
  layout: {
    cols: 12,
    rowHeight: 80,
    compactType: "vertical",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isShared: false,
  sharedWith: [],
})

export default function CustomDashboardBuilder() {
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard>(createDefaultDashboard())
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [isEditMode, setIsEditMode] = useState(true)
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null)
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false)
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)
  const [isDashboardSettingsOpen, setIsDashboardSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/analytics/custom-dashboards", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Unable to load dashboards")
      }

      const data = (await response.json()) as { dashboards: Dashboard[] }
      if (data.dashboards.length > 0) {
        setCurrentDashboard(data.dashboards[0])
        return
      }

      const draft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (draft) {
        const parsedDraft = JSON.parse(draft) as Dashboard
        setCurrentDashboard({ ...parsedDraft, id: "" })
      }
    } catch (error) {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (draft) {
        const parsedDraft = JSON.parse(draft) as Dashboard
        setCurrentDashboard({ ...parsedDraft, id: "" })
      }
      toast.error("Failed to load dashboards")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (currentDashboard.name) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(currentDashboard))
    }
  }, [currentDashboard])

  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      setLayouts(newLayout)

      const updatedWidgets = currentDashboard.widgets.map((widget) => {
        const layoutItem = newLayout.find((l) => l.i === widget.id)
        if (layoutItem) {
          return {
            ...widget,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          }
        }
        return widget
      })

      setCurrentDashboard((prev) => ({
        ...prev,
        widgets: updatedWidgets,
        updatedAt: new Date().toISOString(),
      }))
    },
    [currentDashboard.widgets],
  )

  const handleAddWidget = useCallback((widget: Partial<DashboardWidget>) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      x: 0,
      y: 0,
      w: 4,
      h: 3,
      ...widget,
    } as DashboardWidget

    setCurrentDashboard((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date().toISOString(),
    }))

    setIsWidgetLibraryOpen(false)
    toast.success("Widget added to dashboard")
  }, [])

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
      updatedAt: new Date().toISOString(),
    }))
    toast.success("Widget removed from dashboard")
  }, [])

  const handleDuplicateWidget = useCallback(
    (widget: DashboardWidget) => {
      const newWidget: DashboardWidget = {
        ...widget,
        id: `widget-${Date.now()}`,
        x: (widget.x + widget.w) % currentDashboard.layout.cols,
        y: widget.y,
      }

      setCurrentDashboard((prev) => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
        updatedAt: new Date().toISOString(),
      }))
      toast.success("Widget duplicated")
    },
    [currentDashboard.layout.cols],
  )

  const handleConfigureWidget = useCallback((widget: DashboardWidget) => {
    setSelectedWidget(widget)
    setIsConfigDialogOpen(true)
  }, [])

  const handleSaveWidgetConfig = useCallback((updatedWidget: DashboardWidget) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w)),
      updatedAt: new Date().toISOString(),
    }))
    setIsConfigDialogOpen(false)
    toast.success("Widget configuration saved")
  }, [])

  const handleSaveDashboard = useCallback(async () => {
    try {
      const payload = {
        name: currentDashboard.name,
        description: currentDashboard.description,
        widgets: currentDashboard.widgets,
        layout: currentDashboard.layout,
        isShared: currentDashboard.isShared ?? false,
        sharedWith: currentDashboard.sharedWith ?? [],
      }

      const isExistingDashboard = Boolean(currentDashboard.id)
      const endpoint = isExistingDashboard
        ? `/api/analytics/custom-dashboards/${currentDashboard.id}`
        : "/api/analytics/custom-dashboards"
      const method = isExistingDashboard ? "PATCH" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Unable to save dashboard")
      }

      const data = (await response.json()) as { dashboard: Dashboard }
      setCurrentDashboard(data.dashboard)
      toast.success("Dashboard saved successfully")
    } catch (error) {
      toast.error("Failed to save dashboard")
    }
  }, [currentDashboard])

  const handleExportDashboard = useCallback(() => {
    const dataStr = JSON.stringify(currentDashboard, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${currentDashboard.name.toLowerCase().replace(/\s+/g, "-")}-dashboard.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast.success("Dashboard exported successfully")
  }, [currentDashboard])

  const handleImportDashboard = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dashboard = JSON.parse(e.target?.result as string) as Dashboard
        setCurrentDashboard({
          ...dashboard,
          id: "",
          updatedAt: new Date().toISOString(),
        })
        toast.success("Dashboard imported. Click Save to persist.")
      } catch (error) {
        toast.error("Failed to import dashboard")
      }
    }
    reader.readAsText(file)
  }, [])

  const handleLoadTemplate = useCallback((template: { name: string; widgets: DashboardWidget[] }) => {
    setCurrentDashboard((prev) => ({
      ...prev,
      widgets: template.widgets,
      updatedAt: new Date().toISOString(),
    }))
    toast.success(`Template "${template.name}" loaded`)
  }, [])

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading dashboard...</div>
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold">{currentDashboard.name}</h1>
                <p className="text-sm text-muted-foreground">{currentDashboard.description}</p>
              </div>
              <Badge variant={isEditMode ? "default" : "secondary"}>{isEditMode ? "Edit Mode" : "View Mode"}</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Lock
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>

              <Sheet open={isWidgetLibraryOpen} onOpenChange={setIsWidgetLibraryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!isEditMode}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Widget
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Widget Library</SheetTitle>
                    <SheetDescription>Choose from our collection of analytics widgets</SheetDescription>
                  </SheetHeader>
                  <WidgetLibrary onAddWidget={handleAddWidget} />
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    Templates
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Dashboard Templates</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DashboardTemplates onLoadTemplate={handleLoadTemplate} />
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={handleSaveDashboard}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsDashboardSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportDashboard}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <label>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Dashboard
                      <input type="file" accept=".json" className="hidden" onChange={handleImportDashboard} />
                    </label>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto bg-muted/30">
          {currentDashboard.widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-4 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Grid3x3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold">Start Building Your Dashboard</h2>
                <p className="text-muted-foreground">
                  Add widgets from the library or choose a template to get started with your custom analytics dashboard.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsWidgetLibraryOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Widget
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Grid3x3 className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-[200px]">
                      <DashboardTemplates onLoadTemplate={handleLoadTemplate} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ) : (
            <GridLayout
              className="layout"
              layout={layouts}
              cols={currentDashboard.layout.cols}
              rowHeight={currentDashboard.layout.rowHeight}
              width={1200}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              onLayoutChange={handleLayoutChange}
              compactType={currentDashboard.layout.compactType}
              preventCollision={currentDashboard.layout.preventCollision}
            >
              {currentDashboard.widgets.map((widget) => (
                <div key={widget.id} data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h }}>
                  <Card className="h-full relative group">
                    {isEditMode && (
                      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleConfigureWidget(widget)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateWidget(widget)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleRemoveWidget(widget.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <WidgetRenderer widget={widget} isEditMode={isEditMode} />
                  </Card>
                </div>
              ))}
            </GridLayout>
          )}
        </div>

        {selectedWidget && (
          <WidgetConfigDialog
            widget={selectedWidget}
            open={isConfigDialogOpen}
            onOpenChange={setIsConfigDialogOpen}
            onSave={handleSaveWidgetConfig}
          />
        )}

        <Dialog open={isDashboardSettingsOpen} onOpenChange={setIsDashboardSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dashboard Settings</DialogTitle>
              <DialogDescription>Configure your dashboard layout and preferences</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dashboard Name</label>
                <Input
                  value={currentDashboard.name}
                  onChange={(e) => setCurrentDashboard((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={currentDashboard.description}
                  onChange={(e) => setCurrentDashboard((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shared dashboard</label>
                <Button
                  variant={currentDashboard.isShared ? "default" : "outline"}
                  onClick={() =>
                    setCurrentDashboard((prev) => ({
                      ...prev,
                      isShared: !prev.isShared,
                    }))
                  }
                >
                  {currentDashboard.isShared ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Shared With (user IDs, comma-separated)</label>
                <Input
                  value={(currentDashboard.sharedWith ?? []).join(",")}
                  onChange={(e) =>
                    setCurrentDashboard((prev) => ({
                      ...prev,
                      sharedWith: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Grid Columns</label>
                <Input
                  type="number"
                  value={currentDashboard.layout.cols}
                  onChange={(e) =>
                    setCurrentDashboard((prev) => ({
                      ...prev,
                      layout: { ...prev.layout, cols: Number.parseInt(e.target.value) || 12 },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Row Height (px)</label>
                <Input
                  type="number"
                  value={currentDashboard.layout.rowHeight}
                  onChange={(e) =>
                    setCurrentDashboard((prev) => ({
                      ...prev,
                      layout: { ...prev.layout, rowHeight: Number.parseInt(e.target.value) || 80 },
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDashboardSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsDashboardSettingsOpen(false)
                  toast.success("Dashboard settings updated")
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  )
}
