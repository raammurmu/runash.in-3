import { NodeDefinition } from './registry'

export const aiNodeDefinitions: Record<string, NodeDefinition> = {
  'ai-caption': {
    id: 'ai-caption',
    type: 'ai-model',
    label: 'Auto Caption',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
      language: { type: 'string', default: 'en' },
      style: { type: 'string', default: 'default' },
    },
    outputs: {
      video: { type: 'video' },
      captions: { type: 'captions' },
    },
    description: 'Automatically generate captions for video',
    color: '#FFA500',
  },
  'ai-describe': {
    id: 'ai-describe',
    type: 'ai-model',
    label: 'Generate Description',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
      detail: { type: 'string', default: 'standard' },
    },
    outputs: {
      description: { type: 'text' },
      summary: { type: 'text' },
    },
    description: 'Generate detailed video description',
    color: '#FFA500',
  },
  'ai-object-detect': {
    id: 'ai-object-detect',
    type: 'ai-model',
    label: 'Object Detection',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
      confidence: { type: 'number', default: 0.7 },
    },
    outputs: {
      objects: { type: 'array' },
      metadata: { type: 'object' },
    },
    description: 'Detect and identify objects in video',
    color: '#FFA500',
  },
  'ai-face-detect': {
    id: 'ai-face-detect',
    type: 'ai-model',
    label: 'Face Detection',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
      blurFaces: { type: 'boolean', default: false },
    },
    outputs: {
      video: { type: 'video' },
      faces: { type: 'array' },
    },
    description: 'Detect faces and optionally blur them',
    color: '#FFA500',
  },
  'ai-sentiment': {
    id: 'ai-sentiment',
    type: 'ai-model',
    label: 'Sentiment Analysis',
    category: 'AI Processing',
    inputs: {
      transcript: { type: 'text', required: true },
    },
    outputs: {
      sentiment: { type: 'object' },
      segments: { type: 'array' },
    },
    description: 'Analyze sentiment of video transcript',
    color: '#FFA500',
  },
  'ai-speech-to-text': {
    id: 'ai-speech-to-text',
    type: 'ai-model',
    label: 'Speech to Text',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
      language: { type: 'string', default: 'en' },
    },
    outputs: {
      transcript: { type: 'text' },
      timing: { type: 'object' },
    },
    description: 'Convert video audio to text',
    color: '#FFA500',
  },
  'ai-scene-detect': {
    id: 'ai-scene-detect',
    type: 'ai-model',
    label: 'Scene Detection',
    category: 'AI Processing',
    inputs: {
      video: { type: 'video', required: true },
    },
    outputs: {
      scenes: { type: 'array' },
      metadata: { type: 'object' },
    },
    description: 'Automatically detect scene changes',
    color: '#FFA500',
  },
}
