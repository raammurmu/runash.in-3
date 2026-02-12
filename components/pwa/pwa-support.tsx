"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export function PWASupport() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)

    window.addEventListener("online", onOnline)
    window.addEventListener("offline", onOffline)

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // No-op: PWA enhancements are best-effort.
      })
    }

    return () => {
      window.removeEventListener("online", onOnline)
      window.removeEventListener("offline", onOffline)
    }
  }, [])

  return (
    <>
      {isOffline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800 shadow">
          <WifiOff className="h-4 w-4" />
          You are offline. Viewing cached storefront experience.
        </div>
      )}
      <InstallPrompt />
    </>
  )
}
