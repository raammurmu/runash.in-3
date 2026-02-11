"use client"

import { useState, useEffect, useCallback } from "react"
import { BackgroundSync, type SyncStatus, type SyncData } from "@/lib/background-sync"

export function useBackgroundSync() {
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

  const addToSyncQueue = useCallback((data: Omit<SyncData, "id" | "timestamp" | "userId">) => {
    const sync = BackgroundSync.getInstance()
    sync.addToSyncQueue(data)
  }, [])

  const forceSync = useCallback(async () => {
    const sync = BackgroundSync.getInstance()
    await sync.forceSync()
  }, [])

  const clearQueue = useCallback(() => {
    const sync = BackgroundSync.getInstance()
    sync.clearQueue()
  }, [])

  return {
    status,
    addToSyncQueue,
    forceSync,
    clearQueue,
  }
}

export function useSyncedState<T>(initialValue: T, syncKey: string, syncType: SyncData["type"]) {
  const [value, setValue] = useState<T>(initialValue)
  const { addToSyncQueue } = useBackgroundSync()

  const setSyncedValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const updatedValue = typeof newValue === "function" ? (newValue as (prev: T) => T)(prev) : newValue

        // Add to sync queue
        addToSyncQueue({
          type: syncType,
          data: {
            id: syncKey,
            value: updatedValue,
          },
          action: "update",
        })

        return updatedValue
      })
    },
    [addToSyncQueue, syncKey, syncType],
  )

  return [value, setSyncedValue] as const
}

export function useOfflineQueue() {
  const { status, addToSyncQueue } = useBackgroundSync()

  const queueAction = useCallback(
    (type: SyncData["type"], action: SyncData["action"], data: any) => {
      addToSyncQueue({ type, action, data })
    },
    [addToSyncQueue],
  )

  return {
    isOnline: status.isOnline,
    pendingChanges: status.pendingChanges,
    queueAction,
  }
}
