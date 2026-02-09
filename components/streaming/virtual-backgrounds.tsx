"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Upload, Search, Check, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface VirtualBackgroundsProps {
  onSelectBackground?: (background: string | null) => void
  onBlurBackground?: (amount: number) => void
  selectedBackground?: string | null
  blurAmount?: number
}

export default function VirtualBackgrounds({
  onSelectBackground,
  onBlurBackground,
  selectedBackground,
  blurAmount,
}: VirtualBackgroundsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("featured")

  // Background categories
  const categories = [
    { id: "featured", name: "Featured" },
    { id: "office", name: "Office" },
    { id: "nature", name: "Nature" },
    { id: "abstract", name: "Abstract" },
    { id: "gradients", name: "Gradients" },
    { id: "tech", name: "Tech" },
    { id: "custom", name: "My Uploads" },
  ]

  // Background collections
  const backgrounds = {
    featured: [
      { id: "featured-1", url: "/backgrounds/office-modern.jpg", name: "Modern Office" },
      { id: "featured-2", url: "/backgrounds/abstract-orange.jpg", name: "RunAsh Orange" },
      { id: "featured-3", url: "/backgrounds/tech-workspace.jpg", name: "Tech Workspace" },
      { id: "featured-4", url: "/backgrounds/gradient-warm.jpg", name: "Warm Gradient" },
      { id: "featured-5", url: "/backgrounds/library.jpg", name: "Library" },
      { id: "featured-6", url: "/backgrounds/minimal-desk.jpg", name: "Minimal Desk" },
    ],
    office: [
      { id: "office-1", url: "/backgrounds/office-modern.jpg", name: "Modern Office" },
      { id: "office-2", url: "/backgrounds/office-bookshelf.jpg", name: "Office Bookshelf" },
      { id: "office-3", url: "/backgrounds/office-window.jpg", name: "Office Window" },
      { id: "office-4", url: "/backgrounds/office-minimal.jpg", name: "Minimal Office" },
      { id: "office-5", url: "/backgrounds/office-plants.jpg", name: "Office with Plants" },
      { id: "office-6", url: "/backgrounds/office-dark.jpg", name: "Dark Office" },
    ],
    nature: [
      { id: "nature-1", url: "/backgrounds/nature-forest.jpg", name: "Forest" },
      { id: "nature-2", url: "/backgrounds/nature-mountains.jpg", name: "Mountains" },
      { id: "nature-3", url: "/backgrounds/nature-beach.jpg", name: "Beach" },
      { id: "nature-4", url: "/backgrounds/nature-sunset.jpg", name: "Sunset" },
      { id: "nature-5", url: "/backgrounds/nature-lake.jpg", name: "Lake" },
      { id: "nature-6", url: "/backgrounds/nature-autumn.jpg", name: "Autumn" },
    ],
    abstract: [
      { id: "abstract-1", url: "/backgrounds/abstract-orange.jpg", name: "Orange Abstract" },
      { id: "abstract-2", url: "/backgrounds/abstract-blue.jpg", name: "Blue Abstract" },
      { id: "abstract-3", url: "/backgrounds/abstract-geometric.jpg", name: "Geometric" },
      { id: "abstract-4", url: "/backgrounds/abstract-waves.jpg", name: "Waves" },
      { id: "abstract-5", url: "/backgrounds/abstract-particles.jpg", name: "Particles" },
      { id: "abstract-6", url: "/backgrounds/abstract-light.jpg", name: "Light Trails" },
    ],
    gradients: [
      { id: "gradient-1", url: "/backgrounds/gradient-warm.jpg", name: "Warm Gradient" },
      { id: "gradient-2", url: "/backgrounds/gradient-cool.jpg", name: "Cool Gradient" },
      { id: "gradient-3", url: "/backgrounds/gradient-orange.jpg", name: "Orange Gradient" },
      { id: "gradient-4", url: "/backgrounds/gradient-purple.jpg", name: "Purple Gradient" },
      { id: "gradient-5", url: "/backgrounds/gradient-sunset.jpg", name: "Sunset Gradient" },
      { id: "gradient-6", url: "/backgrounds/gradient-dark.jpg", name: "Dark Gradient" },
    ],
    tech: [
      { id: "tech-1", url: "/backgrounds/tech-workspace.jpg", name: "Tech Workspace" },
      { id: "tech-2", url: "/backgrounds/tech-code.jpg", name: "Code" },
      { id: "tech-3", url: "/backgrounds/tech-circuit.jpg", name: "Circuit" },
      { id: "tech-4", url: "/backgrounds/tech-data.jpg", name: "Data Visualization" },
      { id: "tech-5", url: "/backgrounds/tech-server.jpg", name: "Server Room" },
      { id: "tech-6", url: "/backgrounds/tech-minimal.jpg", name: "Minimal Tech" },
    ],
    custom: [
      // This would be populated with user uploads in a real application
    ],
  }

  // Filter backgrounds based on search query
  const filteredBackgrounds = backgrounds[activeCategory as keyof typeof backgrounds]?.filter((bg) =>
    bg.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleBackgroundSelect = (url: string) => {
    onSelectBackground?.(url === selectedBackground ? null : url)
  }

  const handleBlurChange = (value: number[]) => {
    onBlurBackground?.(value[0])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real application, this would upload the file to a server
    // and add it to the user's custom backgrounds
    console.log("File uploaded:", e.target.files?.[0])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Virtual Backgrounds</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Generate
          </Button>
          <label htmlFor="upload-background" className="cursor-pointer">
            <div className="flex items-center space-x-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </div>
            <Input id="upload-background" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          type="search"
          placeholder="Search backgrounds..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="featured" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 h-auto">
          {categories.slice(0, 4).map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-3 h-auto mt-2">
          {categories.slice(4).map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(backgrounds).map((categoryId) => (
          <TabsContent key={categoryId} value={categoryId} className="mt-4">
            {filteredBackgrounds && filteredBackgrounds.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {filteredBackgrounds.map((background) => (
                  <div
                    key={background.id}
                    className={cn(
                      "relative aspect-video rounded-md overflow-hidden cursor-pointer border-2",
                      selectedBackground === background.url
                        ? "border-orange-500"
                        : "border-transparent hover:border-orange-300",
                    )}
                    onClick={() => handleBackgroundSelect(background.url)}
                  >
                    <img
                      src={background.url || "/placeholder.svg"}
                      alt={background.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">{background.name}</span>
                    </div>
                    {selectedBackground === background.url && (
                      <div className="absolute top-2 right-2 bg-orange-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No backgrounds found</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <Label htmlFor="blur-slider">Background Blur</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => onSelectBackground?.(null)}
            disabled={!selectedBackground}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
        <Slider
          id="blur-slider"
          defaultValue={[blurAmount ?? 0]}
          max={20}
          step={1}
          onValueChange={handleBlurChange}
          disabled={!selectedBackground}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>None</span>
          <span>Max</span>
        </div>
      </div>
    </div>
  )
}
