import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function StreamNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Stream not found</h1>
      <p className="text-muted-foreground">This stream link may be outdated, unavailable, or no longer exists.</p>
      <Button asChild>
        <Link href="/dashboard">Return to dashboard</Link>
      </Button>
    </div>
  )
}
