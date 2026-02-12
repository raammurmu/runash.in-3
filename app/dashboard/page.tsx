"use client"

import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard"
import { StreamQuickAccess } from "@/components/dashboard/stream-quick-access"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <EnhancedDashboard />
        </div>
        <div>
          <StreamQuickAccess />
        </div>
      </div>
    </div>
  )
}
