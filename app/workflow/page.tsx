'use client'

import React, { useState } from 'react'
import { WorkflowBuilder } from '@/components/workflow/workflow-builder'
import { WorkflowMarketplace } from '@/components/workflow/workflow-marketplace'
import { WorkflowMonitor } from '@/components/workflow/workflow-monitor'
import { Workflow, WorkflowTemplate, WorkflowExecution } from '@/lib/workflow/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, LayoutGrid } from 'lucide-react'

export default function WorkflowPage() {
  const [activeTab, setActiveTab] = useState('builder')
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | undefined>()
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | undefined>()

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setCurrentWorkflow(template.workflow)
    setActiveTab('builder')
  }

  const handleSaveWorkflow = (workflow: Workflow) => {
    setCurrentWorkflow(workflow)
    console.log('Workflow saved:', workflow)
  }

  const handleExecuteWorkflow = (workflow: Workflow) => {
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: workflow.id,
      status: 'running',
      nodeResults: {},
      errors: [],
      progress: 0,
      startTime: new Date(),
    }
    setCurrentExecution(execution)
    setActiveTab('monitor')
    
    // Simulate execution progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 25
      if (progress >= 100) {
        progress = 100
        execution.status = 'completed'
        execution.endTime = new Date()
        clearInterval(interval)
      }
      execution.progress = progress
      setCurrentExecution({ ...execution })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 border-b bg-card">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflow Studio</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI-driven video workflows
            </p>
          </div>
          <Button>
            <Plus size={16} className="mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <LayoutGrid size={16} />
              Builder
            </TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            <WorkflowBuilder
              workflow={currentWorkflow}
              onSave={handleSaveWorkflow}
              onExecute={handleExecuteWorkflow}
            />
          </TabsContent>

          <TabsContent value="marketplace" className="mt-6">
            <WorkflowMarketplace onSelectTemplate={handleSelectTemplate} />
          </TabsContent>

          <TabsContent value="monitor" className="mt-6">
            <WorkflowMonitor execution={currentExecution} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
