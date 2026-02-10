import { WorkflowStudio } from "@/components/workflow-kit/workflow-studio"

export default function WorkflowKitPage() {
  return (
    <main className="container mx-auto space-y-6 p-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">RunAsh AI Workflow Kit</h1>
        <p className="text-sm text-muted-foreground">
          Build AI-driven live video workflows using composable nodes for ingest, enhancement, automation, and streaming.
        </p>
      </section>

      <WorkflowStudio />
    </main>
  )
}
