import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gemini = (override?: string) => {
  const apiKey = process.env.GEMINI_API_KEY || override;
  if (!apiKey) throw new Error('Chave Gemini não configurada no servidor.');
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
};
const ollamaLocalUrl = (value: unknown) => {
  let url: URL;
  try { url = new URL(typeof value === 'string' ? value : 'http://localhost:11434'); } catch { throw new Error('URL Ollama inválida.'); }
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '::1', '[::1]'].includes(url.hostname.toLowerCase())) throw new Error('Ollama só pode apontar para HTTP localhost.');
  if (url.port && url.port !== '11434') throw new Error('Ollama deve usar a porta local 11434.');
  if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) throw new Error('Endereço Ollama deve ser a origem local sem caminho ou credenciais.');
  return url.toString().replace(/\/$/, '');
};

export async function createServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/system/status', (_req, res) => {
    const nodeVersion = process.version;
    res.json({ nodeVersion, isNode18Plus: Number.parseInt(nodeVersion.slice(1), 10) >= 18, platform: process.platform, arch: process.arch, geminiAvailable: Boolean(process.env.GEMINI_API_KEY), appUrl: process.env.APP_URL || `http://localhost:${port}` });
  });

  app.use('/api/ai', (req, res, next) => {
    const expected = process.env.APP_ACCESS_TOKEN;
    const supplied = req.get('X-AutoTube-Token') || '';
    if (!expected) return res.status(503).json({ error: 'Geração de IA bloqueada; configure APP_ACCESS_TOKEN no servidor.' });
    const matches = timingSafeEqual(createHash('sha256').update(supplied).digest(), createHash('sha256').update(expected).digest());
    if (!matches) return res.status(401).json({ error: 'Sessão de geração não autorizada.' });
    next();
  });

  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { provider = 'gemini', model, prompt, systemInstruction, apiKey, temperature = 0.7, ollamaUrl } = req.body || {};
      if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 30000) return res.status(400).json({ error: 'Prompt obrigatório (até 30.000 caracteres).' });
      const temp = Number(temperature);
      if (!Number.isFinite(temp) || temp < 0 || temp > 1) return res.status(400).json({ error: 'Temperatura inválida.' });
      let selectedModel = typeof model === 'string' ? model : '';
      let text = '';
      if (provider === 'gemini') {
        selectedModel ||= 'gemini-3.8-flash';
        const result = await gemini(apiKey).models.generateContent({ model: selectedModel, contents: prompt, config: { systemInstruction: systemInstruction || 'Assistente editorial Loop Sonoro. Não invente dados nem faça alegações médicas.', temperature: temp } });
        text = result.text || '';
      } else if (provider === 'ollama') {
        selectedModel ||= 'llama3.2:latest';
        const result = await fetch(`${ollamaLocalUrl(ollamaUrl)}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: selectedModel, prompt: `${systemInstruction || ''}\n\n${prompt}`, stream: false }), signal: AbortSignal.timeout(60000) });
        if (!result.ok) return res.status(502).json({ error: `Ollama retornou status ${result.status}.` });
        text = (await result.json()).response || '';
      } else {
        const keys: Record<string, string | undefined> = { claude: process.env.ANTHROPIC_API_KEY, openai: process.env.OPENAI_API_KEY, openrouter: process.env.OPENROUTER_API_KEY, kimi: process.env.MOONSHOT_API_KEY, glm: process.env.ZHIPU_API_KEY };
        const key = keys[provider] || apiKey;
        if (!key) return res.status(400).json({ error: `Chave do provedor ${provider} não configurada.` });
        const configs: Record<string, { url: string; model: string; headers: Record<string, string> }> = {
          claude: { url: 'https://api.anthropic.com/v1/messages', model: 'claude-3-7-sonnet-20250219', headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' } },
          openai: { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o', headers: { Authorization: `Bearer ${key}` } },
          openrouter: { url: 'https://openrouter.ai/api/v1/chat/completions', model: 'deepseek/deepseek-chat', headers: { Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://autotube.studio', 'X-Title': 'AutoTube Studio' } },
          kimi: { url: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k', headers: { Authorization: `Bearer ${key}` } },
          glm: { url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash', headers: { Authorization: `Bearer ${key}` } },
        };
        const config = configs[provider];
        if (!config) return res.status(400).json({ error: `Provedor '${provider}' não suportado.` });
        selectedModel ||= config.model;
        const isClaude = provider === 'claude';
        const body = isClaude ? { model: selectedModel, max_tokens: 3000, system: systemInstruction || 'Assistente editorial Loop Sonoro.', messages: [{ role: 'user', content: prompt }], temperature: temp } : { model: selectedModel, messages: [...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []), { role: 'user', content: prompt }], temperature: temp };
        const result = await fetch(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...config.headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
        if (!result.ok) return res.status(502).json({ error: `O provedor ${provider} retornou status ${result.status}.` });
        const data = await result.json();
        text = isClaude ? data.content?.[0]?.text || '' : data.choices?.[0]?.message?.content || '';
      }
      return res.json({ text, provider, model: selectedModel });
    } catch (error: any) {
      console.error('AI request failed:', error?.message || 'unknown');
      return res.status(502).json({ error: 'Falha ao gerar conteúdo com IA.' });
    }
  });

  app.get('/api/youtube/channel', async (req, res) => {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(503).json({ source: 'unavailable', channel: null, error: 'YouTube Data API não configurada; nenhum dado foi simulado.' });
    try {
      const handle = typeof req.query.handle === 'string' ? req.query.handle : '';
      const channelId = typeof req.query.channelId === 'string' ? req.query.channelId : '';
      if (!handle && !channelId) return res.status(400).json({ error: 'Informe handle público ou ID do canal.' });
      const query = new URLSearchParams({ part: 'snippet,statistics' });
      if (handle) query.set('forHandle', handle.startsWith('@') ? handle : `@${handle}`);
      else query.set('id', channelId);
      const result = await fetch(`https://www.googleapis.com/youtube/v3/channels?${query}`, { headers: { 'X-Goog-Api-Key': key }, signal: AbortSignal.timeout(20000) });
      if (!result.ok) return res.status(502).json({ error: `YouTube Data API retornou status ${result.status}.` });
      const data = await result.json();
      if (!data.items?.length) return res.status(404).json({ error: 'Canal não encontrado.' });
      const item = data.items[0];
      return res.json({ source: 'youtube-data-api-v3', channel: { id: item.id, title: item.snippet?.title, customUrl: item.snippet?.customUrl, description: item.snippet?.description, publishedAt: item.snippet?.publishedAt, thumbnails: item.snippet?.thumbnails, statistics: item.statistics } });
    } catch (error: any) {
      console.error('Public channel request failed:', error?.message || 'unknown');
      return res.status(502).json({ error: 'Falha ao consultar dados públicos do canal.' });
    }
  });

  app.post('/api/youtube/publish', (_req, res) => res.status(501).json({ blocked: true, reason: 'YOUTUBE_UPLOAD_NOT_IMPLEMENTED', message: 'Nenhum vídeo foi enviado. OAuth 2.0 e upload real não estão implementados.' }));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }
  app.listen(port, process.env.HOST || '0.0.0.0', () => console.log(`AutoTube Server iniciado na porta ${port}`));
}

if (process.env.NODE_ENV !== 'test') createServer().catch((error) => { console.error('Falha ao iniciar AutoTube:', error?.message || 'unknown'); process.exit(1); });
