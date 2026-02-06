'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface LiveStreamContextType {
  isStreaming: boolean
  setIsStreaming: (value: boolean) => void
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined)

export function LiveStreamProvider({ children }: { children: ReactNode }) {
  const [isStreaming, setIsStreaming] = React.useState(false)

  return (
    <LiveStreamContext.Provider value={{ isStreaming, setIsStreaming }}>
      {children}
    </LiveStreamContext.Provider>
  )
}

export function useLiveStream() {
  const context = useContext(LiveStreamContext)
  if (context === undefined) {
    throw new Error('useLiveStream must be used within LiveStreamProvider')
  }
  return context
}
