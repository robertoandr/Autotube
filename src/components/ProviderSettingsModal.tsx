import React, { useEffect, useState } from 'react';
import { Check, ExternalLink, Info, Key, Server, ShieldCheck, Sparkles, Terminal, Youtube } from 'lucide-react';
import { AIConfig, AIProvider, SystemStatus } from '../types';

interface Props { isOpen: boolean; onClose: () => void; aiConfig: AIConfig; onSaveAIConfig: (config: AIConfig) => void; systemStatus: SystemStatus | null; }
const MODELS: Record<AIProvider, string[]> = {
  gemini: ['gemini-3.8-flash', 'gemini-3.1-flash-lite'], claude: ['claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'], openrouter: ['deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct'],
  ollama: ['llama3.2:latest', 'mistral:latest', 'deepseek-r1:latest'], kimi: ['moonshot-v1-8k', 'moonshot-v1-32k'], glm: ['glm-4-flash', 'glm-4'],
};
const PROVIDERS: { id: AIProvider; label: string }[] = [
  { id: 'gemini', label: 'Google Gemini' }, { id: 'claude', label: 'Anthropic Claude' }, { id: 'openai', label: 'OpenAI' },
  { id: 'openrouter', label: 'OpenRouter' }, { id: 'ollama', label: 'Ollama local' }, { id: 'kimi', label: 'Kimi / Moonshot' }, { id: 'glm', label: 'GLM / Zhipu' },
];

export const ProviderSettingsModal: React.FC<Props> = ({ isOpen, onClose, aiConfig, onSaveAIConfig, systemStatus }) => {
  const [provider, setProvider] = useState<AIProvider>(aiConfig.provider);
  const [model, setModel] = useState(aiConfig.model);
  const [apiKey, setApiKey] = useState(aiConfig.apiKey || '');
  const [token, setToken] = useState(aiConfig.serverAccessToken || '');
  const [ollamaUrl, setOllamaUrl] = useState(aiConfig.ollamaUrl || 'http://localhost:11434');
  const [temperature, setTemperature] = useState(aiConfig.temperature ?? 0.7);
  const [tab, setTab] = useState<'providers' | 'youtube' | 'environment'>('providers');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    setProvider(aiConfig.provider); setModel(aiConfig.model); setApiKey(aiConfig.apiKey || ''); setToken(aiConfig.serverAccessToken || ''); setOllamaUrl(aiConfig.ollamaUrl || 'http://localhost:11434'); setTemperature(aiConfig.temperature ?? 0.7); setSaved(false);
  }, [isOpen, aiConfig]);
  if (!isOpen) return null;
  const save = () => { onSaveAIConfig({ provider, model, apiKey: apiKey || undefined, serverAccessToken: token || undefined, ollamaUrl, temperature }); setSaved(true); window.setTimeout(onClose, 500); };
  const tabStyle = (active: boolean) => `border-b-2 px-3 py-3 text-xs ${active ? 'border-red-500 text-white' : 'border-transparent text-neutral-400'}`;
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"><section className="my-8 w-full max-w-3xl overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
    <header className="flex items-center justify-between border-b border-neutral-800 p-6"><div><h2 className="font-bold text-white">Configurações de IA e conexão</h2><p className="mt-1 text-xs text-neutral-400">Segredos ficam somente na memória da sessão, não em localStorage.</p></div><button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800">Fechar</button></header>
    <nav className="flex border-b border-neutral-800 bg-neutral-950/40 px-3"><button onClick={() => setTab('providers')} className={tabStyle(tab === 'providers')}><Sparkles className="mr-1 inline h-4 w-4" />Provedores de IA</button><button onClick={() => setTab('youtube')} className={tabStyle(tab === 'youtube')}><Youtube className="mr-1 inline h-4 w-4" />YouTube</button><button onClick={() => setTab('environment')} className={tabStyle(tab === 'environment')}><Terminal className="mr-1 inline h-4 w-4" />Ambiente</button></nav>
    <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
      {tab === 'providers' && <div className="space-y-4"><div className="flex gap-2 rounded-xl border border-sky-500/20 bg-sky-950/30 p-3 text-xs text-sky-100"><Info className="h-4 w-4 shrink-0" />Configure credenciais como segredos do servidor quando possível. Token do AutoTube é acesso ao proxy, não autenticação pessoal.</div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{PROVIDERS.map((entry) => <button key={entry.id} onClick={() => { setProvider(entry.id); setModel(MODELS[entry.id][0]); setApiKey(''); }} className={`rounded-xl border p-3 text-left text-xs ${provider === entry.id ? 'border-red-500 bg-neutral-800 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'}`}>{entry.label}</button>)}</div><label className="block text-xs text-neutral-300">Modelo<select value={model} onChange={(event) => setModel(event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-white">{MODELS[provider].map((entry) => <option key={entry}>{entry}</option>)}</select></label><label className="block text-xs text-neutral-300">Temperatura {temperature.toFixed(2)}<input type="range" min="0.2" max="1" step="0.05" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="mt-2 w-full accent-red-600" /></label>{provider !== 'gemini' && provider !== 'ollama' && <label className="block text-xs text-neutral-300"><Key className="mr-1 inline h-4 w-4" />Chave do provedor<input type="password" autoComplete="new-password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 font-mono text-white" /></label>}{provider === 'ollama' && <label className="block text-xs text-neutral-300">Endereço Ollama<input value={ollamaUrl} onChange={(event) => setOllamaUrl(event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 font-mono text-white" /><span className="text-[10px] text-neutral-400">O backend deve aceitar localhost somente.</span></label>}<label className="block text-xs text-neutral-300">Token APP_ACCESS_TOKEN (opcional)<input type="password" autoComplete="new-password" value={token} onChange={(event) => setToken(event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 font-mono text-white" /></label></div>}
      {tab === 'youtube' && <div className="space-y-4"><div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-100"><ShieldCheck className="mr-2 inline h-4 w-4" /><strong>Upload/agendamento e Analytics privado desativados.</strong> Requerem OAuth 2.0; não estão implementados.</div><p className="text-xs text-neutral-400">Defina YOUTUBE_API_KEY como segredo no servidor somente para estatísticas públicas. CTR, retenção, receita, países e horas requerem YouTube Analytics API e OAuth.</p><a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-red-300 underline">Google Cloud Console<ExternalLink className="h-3 w-3" /></a></div>}
      {tab === 'environment' && <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs"><p>Node.js: {systemStatus?.nodeVersion || 'dado não disponível'}</p><p>Plataforma: {systemStatus ? `${systemStatus.platform} (${systemStatus.arch})` : 'dado não disponível'}</p><p>Gemini configurado: {systemStatus ? (systemStatus.geminiAvailable ? 'Sim' : 'Não') : 'dado não disponível'}</p><p className="flex items-center gap-2 text-neutral-400"><Server className="h-4 w-4" />Não inclua segredos no repositório.</p></div>}
    </div>
    <footer className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950/50 p-5"><span className="text-xs text-emerald-400">{saved && <><Check className="mr-1 inline h-4 w-4" />Preferências atualizadas</>}</span><button onClick={save} className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white">Salvar</button></footer>
  </section></div>;
};
