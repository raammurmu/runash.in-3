"use client"

import { Button } from "@/components/ui/button"
import { Leaf, ChefHat, Lightbulb, Zap, ShoppingCart, Search } from "lucide-react"
import type { QuickAction } from "@/types/runash-chat"

interface QuickActionsProps {
  actions: QuickAction[]
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "leaf":
        return <Leaf className="h-4 w-4" />
      case "chef-hat":
        return <ChefHat className="h-4 w-4" />
      case "lightbulb":
        return <Lightbulb className="h-4 w-4" />
      case "zap":
        return <Zap className="h-4 w-4" />
      case "shopping-cart":
        return <ShoppingCart className="h-4 w-4" />
      case "search":
        return <Search className="h-4 w-4" />
      default:
        return <Leaf className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "product":
        return "bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "recipe":
        return "bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
      case "tip":
        return "bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "automation":
        return "bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "search":
        return "bg-cyan-100 hover:bg-cyan-200 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            onClick={action.action}
            className={`justify-start h-auto p-3 ${getCategoryColor(action.category)}`}
          >
            <div className="flex flex-col items-center space-y-1 text-center">
              {getIcon(action.icon)}
              <span className="text-xs font-medium">{action.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}
