import { WorkflowNodeType } from '../types'

export interface NodeDefinition {
  id: string
  type: WorkflowNodeType
  label: string
  category: string
  inputs: Record<string, { type: string; required?: boolean; default?: any }>
  outputs: Record<string, { type: string }>
  description?: string
  icon?: string
  color?: string
}

export const nodeDefinitions: Record<string, NodeDefinition> = {
  // Input Nodes
  'video-input': {
    id: 'video-input',
    type: 'input',
    label: 'Video Input',
    category: 'Input',
    inputs: {
      source: { type: 'string', required: true },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Load video from file, URL, or live stream',
    color: '#FF6B35',
  },
  'image-input': {
    id: 'image-input',
    type: 'input',
    label: 'Image Input',
    category: 'Input',
    inputs: {
      source: { type: 'string', required: true },
    },
    outputs: {
      image: { type: 'image' },
    },
    description: 'Load image from file or URL',
    color: '#FF6B35',
  },
  // Processing Nodes
  'video-scale': {
    id: 'video-scale',
    type: 'video-processor',
    label: 'Scale Video',
    category: 'Video Processing',
    inputs: {
      video: { type: 'video', required: true },
      width: { type: 'number', default: 1920 },
      height: { type: 'number', default: 1080 },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Resize video to specified dimensions',
    color: '#FF8C42',
  },
  'video-crop': {
    id: 'video-crop',
    type: 'video-processor',
    label: 'Crop Video',
    category: 'Video Processing',
    inputs: {
      video: { type: 'video', required: true },
      x: { type: 'number', default: 0 },
      y: { type: 'number', default: 0 },
      width: { type: 'number' },
      height: { type: 'number' },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Crop video to specified region',
    color: '#FF8C42',
  },
  'ai-enhance': {
    id: 'ai-enhance',
    type: 'ai-model',
    label: 'AI Enhancement',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
      model: { type: 'string', default: 'upscale-2x' },
      strength: { type: 'number', default: 0.8 },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Apply AI enhancement (upscaling, denoising, etc)',
    color: '#FFA500',
  },
  'stream-publish': {
    id: 'stream-publish',
    type: 'streaming',
    label: 'Publish Stream',
    category: 'Streaming',
    inputs: {
      video: { type: 'video', required: true },
      platform: { type: 'string', required: true },
      streamKey: { type: 'string', required: true },
    },
    outputs: {
      status: { type: 'string' },
    },
    description: 'Publish video to streaming platform',
    color: '#FFB84D',
  },
  'video-output': {
    id: 'video-output',
    type: 'output',
    label: 'Save Video',
    category: 'Output',
    inputs: {
      video: { type: 'video', required: true },
      format: { type: 'string', default: 'mp4' },
      quality: { type: 'string', default: 'high' },
    },
    outputs: {
      path: { type: 'string' },
    },
    description: 'Save processed video to file',
    color: '#FFB84D',
  },
}
