export type AIProvider = 'gemini' | 'claude' | 'openai' | 'openrouter' | 'ollama' | 'kimi' | 'glm';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  ollamaUrl?: string;
  temperature: number;
}

export type VideoFormat = 'short' | 'video';

export type PipelineStatus = 'idea' | 'scripted' | 'pending_approval' | 'approved' | 'scheduled' | 'published';

export interface VideoItem {
  id: string;
  title: string;
  titleVariants: string[];
  format: VideoFormat;
  niche: string;
  hook: string;
  script: string;
  estimatedDuration: string; // e.g. "55s" or "8m 30s"
  description: string;
  tags: string[];
  pinnedComment: string;
  thumbnailPrompt: string;
  thumbnailOverlayText: string;
  thumbnailColor: string; // e.g. '#e11d48'
  status: PipelineStatus;
  approvedByUser: boolean;
  approvalTimestamp?: string;
  approverNote?: string;
  scheduledFor?: string;
  publishedUrl?: string;
  appealQuality?: 'Forte' | 'Médio' | 'A testar';
  createdAt: string;
  aiProviderUsed: string;
  aiModelUsed: string;
}

export interface SystemStatus {
  nodeVersion: string;
  isNode18Plus: boolean;
  platform: string;
  arch: string;
  geminiAvailable: boolean;
  appUrl: string;
  quota: {
    used: number;
    limit: number;
    remaining: number;
  };
}

export interface YouTubeChannelData {
  id: string;
  title: string;
  customUrl: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    high: { url: string };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  metrics: {
    avgCtr: string;
    avgRetention: string;
    topUploadHour: string;
    bestDays: string[];
  };
}
