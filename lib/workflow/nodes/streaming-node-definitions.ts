import { NodeDefinition } from './registry'

export const streamingNodeDefinitions: Record<string, NodeDefinition> = {
  'stream-multi': {
    id: 'stream-multi',
    type: 'streaming',
    label: 'Multi-Stream',
    category: 'Streaming',
    inputs: {
      video: { type: 'video', required: true },
      platforms: { type: 'array', default: ['youtube', 'twitch'] },
      streamKeys: { type: 'object', required: true },
    },
    outputs: {
      status: { type: 'object' },
    },
    description: 'Broadcast to multiple platforms simultaneously',
    color: '#FFB84D',
  },
  'stream-record': {
    id: 'stream-record',
    type: 'streaming',
    label: 'Record Stream',
    category: 'Streaming',
    inputs: {
      video: { type: 'video', required: true },
      quality: { type: 'string', default: 'high' },
      format: { type: 'string', default: 'mp4' },
    },
    outputs: {
      video: { type: 'video' },
      metadata: { type: 'object' },
    },
    description: 'Record live stream to file',
    color: '#FFB84D',
  },
  'stream-overlay': {
    id: 'stream-overlay',
    type: 'streaming',
    label: 'Stream Overlay',
    category: 'Streaming',
    inputs: {
      video: { type: 'video', required: true },
      overlayType: { type: 'string', default: 'webcam' },
      position: { type: 'string', default: 'bottom-right' },
      size: { type: 'string', default: 'small' },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Add webcam or screen overlay to stream',
    color: '#FFB84D',
  },
  'stream-chat': {
    id: 'stream-chat',
    type: 'streaming',
    label: 'Live Chat',
    category: 'Streaming',
    inputs: {
      platform: { type: 'string', required: true },
      slowMode: { type: 'boolean', default: false },
      emoteOnly: { type: 'boolean', default: false },
    },
    outputs: {
      messages: { type: 'array' },
    },
    description: 'Enable and manage live chat',
    color: '#FFB84D',
  },
  'stream-analytics': {
    id: 'stream-analytics',
    type: 'streaming',
    label: 'Stream Analytics',
    category: 'Streaming',
    inputs: {
      streamData: { type: 'object', required: true },
    },
    outputs: {
      analytics: { type: 'object' },
    },
    description: 'Collect real-time stream metrics',
    color: '#FFB84D',
  },
  'stream-schedule': {
    id: 'stream-schedule',
    type: 'streaming',
    label: 'Schedule Stream',
    category: 'Streaming',
    inputs: {
      title: { type: 'string', required: true },
      description: { type: 'string' },
      scheduledTime: { type: 'string', required: true },
    },
    outputs: {
      scheduleId: { type: 'string' },
    },
    description: 'Schedule stream for later broadcast',
    color: '#FFB84D',
  },
  'stream-monetize': {
    id: 'stream-monetize',
    type: 'streaming',
    label: 'Monetization',
    category: 'Streaming',
    inputs: {
      enableAds: { type: 'boolean', default: true },
      superChat: { type: 'boolean', default: true },
      subscriptions: { type: 'boolean', default: true },
    },
    outputs: {
      revenue: { type: 'object' },
    },
    description: 'Configure monetization options',
    color: '#FFB84D',
  },
}
