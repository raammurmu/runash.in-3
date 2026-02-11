"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { BackgroundSync, type SyncStatus } from "@/lib/background-sync"

interface SyncStatusProps {
  className?: string
}

export default function SyncStatusComponent({ className }: SyncStatusProps) {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: Date.now(),
    pendingChanges: 0,
    syncInProgress: false,
  })

  useEffect(() => {
    const sync = BackgroundSync.getInstance()
    setStatus(sync.getStatus())

    const unsubscribe = sync.onStatusChange(setStatus)
    return unsubscribe
  }, [])

  const handleForceSync = async () => {
    const sync = BackgroundSync.getInstance()
    await sync.forceSync()
  }

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />
    }
    if (status.syncInProgress) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    }
    if (status.pendingChanges > 0) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (!status.isOnline) {
      return "Offline"
    }
    if (status.syncInProgress) {
      return "Syncing..."
    }
    if (status.pendingChanges > 0) {
      return `${status.pendingChanges} pending`
    }
    return "Synced"
  }

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!status.isOnline) return "destructive"
    if (status.syncInProgress) return "default"
    if (status.pendingChanges > 0) return "secondary"
    return "outline"
  }

  const formatLastSync = () => {
    const now = Date.now()
    const diff = now - status.lastSync
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>

      {status.isOnline && !status.syncInProgress && (
        <Button variant="ghost" size="sm" onClick={handleForceSync} className="h-6 px-2 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Sync
        </Button>
      )}

      <div className="text-xs text-gray-500">Last sync: {formatLastSync()}</div>

      {!status.isOnline && (
        <div className="flex items-center text-xs text-red-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          Changes will sync when online
        </div>
      )}
    </div>
  )
}
