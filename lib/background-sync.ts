export interface SyncData {
  id: string
  type: "stream" | "recording" | "settings" | "template"
  data: any
  timestamp: number
  userId: string
  action: "create" | "update" | "delete"
}

export interface SyncStatus {
  isOnline: boolean
  lastSync: number
  pendingChanges: number
  syncInProgress: boolean
}

export class BackgroundSync {
  private static instance: BackgroundSync
  private syncQueue: SyncData[] = []
  private isOnline: boolean = navigator.onLine
  private syncInProgress = false
  private statusListeners: ((status: SyncStatus) => void)[] = []
  private lastSync: number = Date.now()
  private syncInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.initializeEventListeners()
    this.startPeriodicSync()
    this.loadQueueFromStorage()
  }

  public static getInstance(): BackgroundSync {
    if (!BackgroundSync.instance) {
      BackgroundSync.instance = new BackgroundSync()
    }
    return BackgroundSync.instance
  }

  private initializeEventListeners(): void {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
      this.notifyStatusListeners()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.notifyStatusListeners()
    })

    // Listen for page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline) {
        this.processSyncQueue()
      }
    })
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processSyncQueue()
      }
    }, 30000) // Sync every 30 seconds
  }

  public addToSyncQueue(data: Omit<SyncData, "id" | "timestamp" | "userId">): void {
    const syncData: SyncData = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: "current-user-id", // This would come from auth context
    }

    this.syncQueue.push(syncData)
    this.saveQueueToStorage()

    if (this.isOnline) {
      this.processSyncQueue()
    }

    this.notifyStatusListeners()
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0 || !this.isOnline) {
      return
    }

    this.syncInProgress = true
    this.notifyStatusListeners()

    let batch: SyncData[] = [] // Declare batch variable
    try {
      batch = this.syncQueue.splice(0, 10) // Process in batches of 10

      for (const item of batch) {
        await this.syncItem(item)
      }

      this.lastSync = Date.now()
      this.saveQueueToStorage()
    } catch (error) {
      console.error("Sync failed:", error)
      // Re-add failed items to queue
      this.syncQueue.unshift(...batch)
    } finally {
      this.syncInProgress = false
      this.notifyStatusListeners()
    }
  }

  private async syncItem(item: SyncData): Promise<void> {
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      // Handle any conflicts or updates from server
      const result = await response.json()
      if (result.conflict) {
        await this.handleConflict(item, result.serverData)
      }
    } catch (error) {
      console.error("Failed to sync item:", error)
      throw error
    }
  }

  private async handleConflict(localData: SyncData, serverData: any): Promise<void> {
    // Simple conflict resolution: server wins
    // In a real app, you might want more sophisticated conflict resolution
    console.warn("Sync conflict detected, using server data:", { localData, serverData })

    // Emit conflict event for UI to handle
    window.dispatchEvent(
      new CustomEvent("sync-conflict", {
        detail: { localData, serverData },
      }),
    )
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem("sync-queue", JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error("Failed to save sync queue to storage:", error)
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem("sync-queue")
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load sync queue from storage:", error)
      this.syncQueue = []
    }
  }

  public getStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingChanges: this.syncQueue.length,
      syncInProgress: this.syncInProgress,
    }
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(callback)
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback)
    }
  }

  private notifyStatusListeners(): void {
    const status = this.getStatus()
    this.statusListeners.forEach((listener) => listener(status))
  }

  public forceSync(): Promise<void> {
    return this.processSyncQueue()
  }

  // Deprecated alias for backward compatibility; prefer forceSync().
  // TODO: Remove forcSync() in a future cleanup after callsites migrate.
  public forcSync(): Promise<void> {
    return this.forceSync()
  }

  public clearQueue(): void {
    this.syncQueue = []
    this.saveQueueToStorage()
    this.notifyStatusListeners()
  }

  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    window.removeEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
      this.notifyStatusListeners()
    })
    window.removeEventListener("offline", () => {
      this.isOnline = false
      this.notifyStatusListeners()
    })
  }
}
