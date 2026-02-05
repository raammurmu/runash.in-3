import { AppSidebar } from "@/components/agents/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/components/agents/header"
import { AIAgentsDashboard } from "@/components/ai-agents/ai-agents-dashboard"

export const metadata = {
  title: "AI Agents - RunAsh Dashboard",
  description: "Manage your AI agents for live streaming and product automation",
}

export default function AIAgentsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6">
          <AIAgentsDashboard />
        </main>
      </SidebarInset>
    </>
  )
}



