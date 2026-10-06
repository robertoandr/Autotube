import { AIConfig, SystemStatus, YouTubeChannelResponse } from '../types';

export async function fetchSystemStatus(): Promise<SystemStatus | null> {
  try {
    const response = await fetch('/api/system/status');
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchYouTubeChannel(handle?: string): Promise<YouTubeChannelResponse> {
  const query = new URLSearchParams();
  if (handle) query.set('handle', handle);
  const response = await fetch(`/api/youtube/channel?${query.toString()}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Consulta do canal falhou (${response.status}).`);
  }
  return response.json();
}

export async function generateContentWithAI(prompt: string, config: AIConfig, systemInstruction?: string): Promise<{ text: string; provider: string; model: string }> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(config.serverAccessToken ? { 'X-AutoTube-Token': config.serverAccessToken } : {}) },
    body: JSON.stringify({ provider: config.provider, model: config.model, apiKey: config.apiKey, ollamaUrl: config.ollamaUrl, temperature: config.temperature, prompt, systemInstruction }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Geração de texto falhou (${response.status}).`);
  return data;
}
