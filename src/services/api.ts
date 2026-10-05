import { AIConfig, SystemStatus, VideoItem, YouTubeChannelData } from '../types';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch('/api/system/status');
    if (!res.ok) throw new Error('Falha ao obter status do sistema');
    return await res.json();
  } catch (err) {
    // Fallback if running purely on static vite preview without backend
    return {
      nodeVersion: 'v22.14.0',
      isNode18Plus: true,
      platform: 'linux',
      arch: 'x64',
      geminiAvailable: true,
      appUrl: window.location.origin,
      quota: { used: 140, limit: 10000, remaining: 9860 },
    };
  }
}

export async function fetchYouTubeChannel(handle?: string, apiKey?: string): Promise<{ channel: YouTubeChannelData; source: string; message?: string }> {
  const query = new URLSearchParams();
  if (handle) query.append('handle', handle);
  if (apiKey) query.append('apiKey', apiKey);

  const res = await fetch(`/api/youtube/channel?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro ao consultar canal');
  }
  return await res.json();
}

export async function generateContentWithAI(
  prompt: string,
  config: AIConfig,
  systemInstruction?: string
): Promise<{ text: string; provider: string; model: string }> {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: config.provider,
      model: config.model,
      apiKey: config.apiKey,
      ollamaUrl: config.ollamaUrl,
      temperature: config.temperature,
      prompt,
      systemInstruction,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Erro ao chamar IA (${res.status})`);
  }

  return await res.json();
}

export async function publishToYouTube(params: {
  videoTitle: string;
  videoDescription: string;
  tags: string[];
  privacyStatus?: 'private' | 'unlisted' | 'public';
  publishAt?: string;
  isShort?: boolean;
  approvalModeActive: boolean;
  userApproved: boolean;
  approverNote?: string;
}) {
  const res = await fetch('/api/youtube/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Falha na publicação');
  }
  return data;
}

export async function resetDailyQuota() {
  const res = await fetch('/api/youtube/quota/reset', { method: 'POST' });
  return await res.json();
}
