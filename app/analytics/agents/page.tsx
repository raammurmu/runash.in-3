import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Header } from "@/components/header"
import { AnalyticsDashboard } from "@/components/ai-agents/analytics/analytics-dashboard"

export default function AgentsAnalyticsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          </div>
          <AnalyticsDashboard />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
