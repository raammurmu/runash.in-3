"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { UserPreferences, ProductCategory } from "@/types/runash-chat"

interface UserPreferencesDialogProps {
  preferences: UserPreferences
  onSave: (preferences: UserPreferences) => void
  onClose: () => void
}

export default function UserPreferencesDialog({ preferences, onSave, onClose }: UserPreferencesDialogProps) {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences)

  const dietaryOptions = ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "Nut-free", "Keto", "Paleo", "Low-carb"]

  const categoryOptions: { value: ProductCategory; label: string }[] = [
    { value: "fruits-vegetables", label: "Fruits & Vegetables" },
    { value: "grains-cereals", label: "Grains & Cereals" },
    { value: "dairy-alternatives", label: "Dairy Alternatives" },
    { value: "meat-alternatives", label: "Meat Alternatives" },
    { value: "pantry-staples", label: "Pantry Staples" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
    { value: "personal-care", label: "Personal Care" },
    { value: "household", label: "Household" },
    { value: "supplements", label: "Supplements" },
  ]

  const businessTypes = [
    { value: "retail", label: "Retail Store" },
    { value: "restaurant", label: "Restaurant" },
    { value: "farm", label: "Farm/Producer" },
    { value: "distributor", label: "Distributor" },
  ]

  const handleSave = () => {
    onSave(localPreferences)
    onClose()
  }

  const handleDietaryChange = (restriction: string, checked: boolean) => {
    setLocalPreferences((prev) => ({
      ...prev,
      dietaryRestrictions: checked
        ? [...prev.dietaryRestrictions, restriction]
        : prev.dietaryRestrictions.filter((r) => r !== restriction),
    }))
  }

  const handleCategoryChange = (category: ProductCategory, checked: boolean) => {
    setLocalPreferences((prev) => ({
      ...prev,
      preferredCategories: checked
        ? [...prev.preferredCategories, category]
        : prev.preferredCategories.filter((c) => c !== category),
    }))
  }

  const handleReset = () => {
    setLocalPreferences({
      dietaryRestrictions: [],
      sustainabilityPriority: "medium",
      budgetRange: [0, 100],
      preferredCategories: [],
      cookingSkillLevel: "intermediate",
      businessType: undefined,
    })
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Experience</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dietary Restrictions */}
          <div>
            <Label className="text-base font-medium">Dietary Restrictions</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {dietaryOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={localPreferences.dietaryRestrictions.includes(option)}
                    onCheckedChange={(checked) => handleDietaryChange(option, checked as boolean)}
                  />
                  <Label htmlFor={option} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sustainability Priority */}
          <div>
            <Label className="text-base font-medium">Sustainability Priority</Label>
            <RadioGroup
              value={localPreferences.sustainabilityPriority}
              onValueChange={(value) =>
                setLocalPreferences((prev) => ({
                  ...prev,
                  sustainabilityPriority: value as "low" | "medium" | "high",
                }))
              }
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low - Price is most important</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium - Balance price and sustainability</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High - Sustainability is top priority</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Budget Range */}
          <div>
            <Label className="text-base font-medium">Budget Range (per item)</Label>
            <div className="mt-2">
              <Slider
                value={localPreferences.budgetRange}
                onValueChange={(value) =>
                  setLocalPreferences((prev) => ({
                    ...prev,
                    budgetRange: value as [number, number],
                  }))
                }
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>${localPreferences.budgetRange[0]}</span>
                <span>${localPreferences.budgetRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Preferred Categories */}
          <div>
            <Label className="text-base font-medium">Preferred Product Categories</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {categoryOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={localPreferences.preferredCategories.includes(option.value)}
                    onCheckedChange={(checked) => handleCategoryChange(option.value, checked as boolean)}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Skill Level */}
          <div>
            <Label className="text-base font-medium">Cooking Skill Level</Label>
            <Select
              value={localPreferences.cookingSkillLevel}
              onValueChange={(value) =>
                setLocalPreferences((prev) => ({
                  ...prev,
                  cookingSkillLevel: value as "beginner" | "intermediate" | "advanced",
                }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - Simple recipes only</SelectItem>
                <SelectItem value="intermediate">Intermediate - Moderate complexity</SelectItem>
                <SelectItem value="advanced">Advanced - Complex recipes welcome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Type (Optional) */}
          <div>
            <Label className="text-base font-medium">Business Type (Optional)</Label>
            <Select
              value={localPreferences.businessType || "no-business"}
              onValueChange={(value) =>
                setLocalPreferences((prev) => ({
                  ...prev,
                  businessType:
                    value === "no-business"
                      ? undefined
                      : (value as "retail" | "restaurant" | "farm" | "distributor"),
                }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select if you have a business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-business">No business</SelectItem>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white"
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
