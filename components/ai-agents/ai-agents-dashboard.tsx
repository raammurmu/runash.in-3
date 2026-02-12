"use client"

import { useState } from "react"
import { useAIAgents } from "@/lib/hooks/use-ai-agents"
import { AgentsList } from "@/components/ai-agents/agents-lists"
import { CreateAgentDialog } from "@/components/ai-agents/create-agent-dialog"
import { AgentDetailDialog } from "@/components/ai-agents/agent--detail-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock user ID until auth is fully implemented
const MOCK_USER_ID = "user-123"

export function AIAgentsDashboard() {
  const { agents, loading, error, createAgent, updateAgent, deleteAgent, toggleAgentStatus } = useAIAgents(MOCK_USER_ID)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId)

  const handleCreateAgent = async (agentData: any) => {
    const { data, error } = await createAgent(agentData)
    if (error) {
      toast({
        title: "Error creating agent",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Agent created",
      description: `${agentData.name} has been created successfully.`,
    })
    setIsCreateDialogOpen(false)
  }

  const handleUpdateAgent = async (id: string, updates: any) => {
    const { error } = await updateAgent(id, updates)
    if (error) {
      toast({
        title: "Error updating agent",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Agent updated",
      description: "The agent has been updated successfully.",
    })
    setSelectedAgentId(null)
  }

  const handleDeleteAgent = async (id: string) => {
    const { error } = await deleteAgent(id)
    if (error) {
      toast({
        title: "Error deleting agent",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Agent deleted",
      description: "The agent has been deleted successfully.",
    })
    setSelectedAgentId(null)
  }

  const handleToggleStatus = async (id: string, enabled: boolean) => {
    const { error } = await toggleAgentStatus(id, enabled)
    if (error) {
      toast({
        title: "Error updating agent status",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: enabled ? "Agent activated" : "Agent deactivated",
      description: enabled ? "The agent is now active and ready to use." : "The agent has been deactivated.",
    })
  }

  const filteredAgents = agents.filter((agent) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return agent.enabled
    if (activeTab === "disabled") return !agent.enabled
    if (activeTab === "sales") return agent.type === "sales"
    if (activeTab === "engagement") return agent.type === "engagement"
    if (activeTab === "analytics") return agent.type === "analytics"
    if (activeTab === "moderation") return agent.type === "moderation"
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">
            Create and manage AI agents to automate tasks during your live streams.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full max-w-3xl">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Active
            </TabsTrigger>
            <TabsTrigger value="disabled" className="text-xs sm:text-sm">
              Disabled
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-xs sm:text-sm">
              Sales
            </TabsTrigger>
            <TabsTrigger value="engagement" className="hidden md:block text-xs sm:text-sm">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="analytics" className="hidden md:block text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="moderation" className="hidden md:block text-xs sm:text-sm">
              Moderation
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <AgentsList
            agents={filteredAgents}
            isLoading={loading}
            onSelect={setSelectedAgentId}
            onToggleStatus={handleToggleStatus}
          />
        </TabsContent>
      </Tabs>

      <CreateAgentDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateAgent} />

      {selectedAgent && (
        <AgentDetailDialog
          agent={selectedAgent}
          open={!!selectedAgentId}
          onOpenChange={(open) => !open && setSelectedAgentId(null)}
          onUpdate={(updates) => handleUpdateAgent(selectedAgent.id, updates)}
          onDelete={() => handleDeleteAgent(selectedAgent.id)}
        />
      )}
    </div>
  )
}
