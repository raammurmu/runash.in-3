import { NodeDefinition } from './registry'

export const videoNodeDefinitions: Record<string, NodeDefinition> = {
  'video-trim': {
    id: 'video-trim',
    type: 'video-processor',
    label: 'Trim Video',
    category: 'Video Processing',
    inputs: {
      video: { type: 'video', required: true },
      startTime: { type: 'number', default: 0 },
      endTime: { type: 'number' },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Trim video to specific time range',
    color: '#FF8C42',
  },
  'video-concat': {
    id: 'video-concat',
    type: 'video-processor',
    label: 'Concatenate Videos',
    category: 'Video Processing',
    inputs: {
      videos: { type: 'array', required: true },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Combine multiple videos into one',
    color: '#FF8C42',
  },
  'video-effect': {
    id: 'video-effect',
    type: 'video-processor',
    label: 'Apply Effect',
    category: 'Video Processing',
    inputs: {
      video: { type: 'video', required: true },
      effectType: { type: 'string', default: 'fade' },
      intensity: { type: 'number', default: 0.5 },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Apply visual effects (fade, blur, etc)',
    color: '#FF8C42',
  },
  'video-watermark': {
    id: 'video-watermark',
    type: 'video-processor',
    label: 'Add Watermark',
    category: 'Video Processing',
    inputs: {
      video: { type: 'video', required: true },
      watermarkUrl: { type: 'string', required: true },
      position: { type: 'string', default: 'bottom-right' },
      opacity: { type: 'number', default: 0.8 },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Add watermark or logo to video',
    color: '#FF8C42',
  },
  'video-overlay': {
    id: 'video-overlay',
    type: 'video-processor',
    label: 'Add Overlay',
    category: 'Video Processing',
    inputs: {
      video: { type: 'video', required: true },
      overlay: { type: 'image', required: true },
      position: { type: 'string', default: 'center' },
      scale: { type: 'number', default: 1 },
    },
    outputs: {
      video: { type: 'video' },
    },
    description: 'Overlay image or text on video',
    color: '#FF8C42',
  },
}
