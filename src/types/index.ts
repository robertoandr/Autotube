export type AIProvider = 'gemini' | 'claude' | 'openai' | 'openrouter' | 'ollama' | 'kimi' | 'glm';
export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  serverAccessToken?: string;
  ollamaUrl?: string;
  temperature: number;
}
export type VideoFormat = 'short' | 'video';
export type PipelineStatus = 'idea' | 'scripted' | 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'paused' | 'cancelled';
export type PublicationType = 'normal' | 'premiere';
export interface ApprovalSnapshot {
  title: string;
  titleVariants: string[];
  hook: string;
  script: string;
  format: VideoFormat;
  estimatedDuration: string;
  description: string;
  tags: string[];
  pinnedComment: string;
  thumbnailPrompt: string;
  thumbnailOverlayText: string;
  thumbnailColor: string;
  publicationType: PublicationType;
  plannedAt: string;
  timeZone: 'America/Sao_Paulo';
}
export interface ApprovalRecord { version: number; approvedAt: string; approverName: string; notes?: string; snapshot: ApprovalSnapshot; }
export interface VideoItem {
  id: string; title: string; titleVariants: string[]; format: VideoFormat; niche: string; hook: string; script: string; estimatedDuration: string;
  description: string; tags: string[]; pinnedComment: string; thumbnailPrompt: string; thumbnailOverlayText: string; thumbnailColor: string;
  status: PipelineStatus; approvedByUser: boolean; approvalTimestamp?: string; approverNote?: string; approvalRecord?: ApprovalRecord; approvalHistory?: ApprovalRecord[];
  publicationType?: PublicationType; plannedAt?: string; scheduledFor?: string; publishedUrl?: string; rejectedAt?: string; rejectionNote?: string;
  isDemo?: boolean; appealQuality?: 'Forte' | 'Médio' | 'A testar'; createdAt: string; aiProviderUsed: string; aiModelUsed: string;
}
export interface SystemStatus { nodeVersion: string; isNode18Plus: boolean; platform: string; arch: string; geminiAvailable: boolean; appUrl: string; }
export interface YouTubeChannelData {
  id: string; title: string; customUrl?: string; description?: string; publishedAt?: string;
  thumbnails?: { high?: { url?: string } };
  statistics?: { viewCount?: string; subscriberCount?: string; videoCount?: string; hiddenSubscriberCount?: boolean };
}
export interface YouTubeChannelResponse { source: 'youtube-data-api-v3' | 'unavailable'; channel: YouTubeChannelData | null; message?: string; }
