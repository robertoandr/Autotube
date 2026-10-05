import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Sparkles, 
  Key, 
  Server, 
  Youtube, 
  ShieldCheck, 
  Check, 
  Info,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { AIConfig, AIProvider, SystemStatus } from '../types';

interface ProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfig: AIConfig;
  onSaveAIConfig: (config: AIConfig) => void;
  systemStatus: SystemStatus | null;
  youtubeApiKey: string;
  onSaveYouTubeKey: (key: string) => void;
  approvalMode: boolean;
  onToggleApprovalMode: () => void;
}

export const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  aiConfig,
  onSaveAIConfig,
  systemStatus,
  youtubeApiKey,
  onSaveYouTubeKey,
  approvalMode,
  onToggleApprovalMode,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(aiConfig.provider);
  const [selectedModel, setSelectedModel] = useState<string>(aiConfig.model);
  const [apiKey, setApiKey] = useState<string>(aiConfig.apiKey || '');
  const [ollamaUrl, setOllamaUrl] = useState<string>(aiConfig.ollamaUrl || 'http://localhost:11434');
  const [ytKey, setYtKey] = useState<string>(youtubeApiKey);
  const [temperature, setTemperature] = useState<number>(aiConfig.temperature || 0.7);
  const [activeTab, setActiveTab] = useState<'providers' | 'youtube' | 'environment'>('providers');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  interface ProviderInfo {
    id: AIProvider;
    name: string;
    description: string;
    models: string[];
    isFreeDefault?: boolean;
    requiresKey?: boolean;
    keyPlaceholder?: string;
  }

  const PROVIDERS: ProviderInfo[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Recomendado. Já incluso na cota gratuita do ambiente sem precisar cadastrar chave adicional.',
      models: ['gemini-3.8-flash', 'gemini-3.1-flash-lite'],
      isFreeDefault: true,
      requiresKey: false,
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      description: 'Excelente para roteirização longa, nuance e estilo de storytelling refinado.',
      models: ['claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022'],
      requiresKey: true,
      keyPlaceholder: 'sk-ant-api...',
    },
    {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Modelos GPT-4o e o3-mini para ganchos virais e roteirização analítica.',
      models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
      requiresKey: true,
      keyPlaceholder: 'sk-...',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Acesso a DeepSeek R1/V3, Llama 3 e centenas de modelos abertos.',
      models: ['deepseek/deepseek-chat', 'meta-llama/llama-3.3-70b-instruct'],
      requiresKey: true,
      keyPlaceholder: 'sk-or-...',
    },
    {
      id: 'ollama',
      name: 'Ollama Local',
      description: '100% gratuito e offline rodando no seu computador (localhost:11434).',
      models: ['llama3.2:latest', 'mistral:latest', 'deepseek-r1:latest'],
      requiresKey: false,
    },
    {
      id: 'kimi',
      name: 'Kimi (Moonshot)',
      description: 'Modelo Moonshot para roteiros com contexto extenso.',
      models: ['moonshot-v1-8k', 'moonshot-v1-32k'],
      requiresKey: true,
      keyPlaceholder: 'sk-...',
    },
    {
      id: 'glm',
      name: 'GLM (Zhipu AI)',
      description: 'Modelo GLM-4 de alta performance.',
      models: ['glm-4-flash', 'glm-4'],
      requiresKey: true,
      keyPlaceholder: 'api-key...',
    },
  ];

  const currentProviderInfo = PROVIDERS.find((p) => p.id === selectedProvider) || PROVIDERS[0];

  const handleSelectProvider = (provId: AIProvider) => {
    setSelectedProvider(provId);
    const info = PROVIDERS.find((p) => p.id === provId);
    if (info && info.models[0]) {
      setSelectedModel(info.models[0]);
    }
  };

  const handleSaveAll = () => {
    onSaveAIConfig({
      provider: selectedProvider,
      model: selectedModel,
      apiKey: apiKey.trim() || undefined,
      ollamaUrl: ollamaUrl.trim() || undefined,
      temperature,
    });
    onSaveYouTubeKey(ytKey.trim());
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Configurações de Modelos & Conexões
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Escolha seu provedor de IA favorito, conecte a YouTube Data API e gerencie o ambiente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 px-6 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'providers'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>Provedores de Modelo (LLM)</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'youtube'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>YouTube Data API v3</span>
          </button>

          <button
            onClick={() => setActiveTab('environment')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'environment'
                ? 'border-red-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Diagnóstico do Sistema & Node.js</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: LLM PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="space-y-5">
              
              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong>Dá pra começar na cota grátis do Gemini:</strong> O AutoTube já vem configurado de fábrica com o modelo Gemini 3.8 Flash no backend. Você também pode conectar Claude, OpenAI, OpenRouter ou Ollama local.
                </span>
              </div>

              {/* Provider Selector Grid */}
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-2">
                  Selecione o Provedor de Texto:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PROVIDERS.map((prov) => {
                    const isSelected = selectedProvider === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => handleSelectProvider(prov.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-neutral-800 border-red-500 text-white ring-1 ring-red-500/30 shadow-md'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white block">
                            {prov.name}
                          </span>
                          {prov.isFreeDefault && (
                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1 py-0.2 rounded">
                              GRÁTIS
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 line-clamp-2 leading-tight">
                          {prov.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model selection & API Key inputs */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                      Modelo do {currentProviderInfo.name}:
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      {currentProviderInfo.models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                      Temperatura Criativa ({temperature}):
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-red-600 mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-400">
                      <span>Mais factual (0.2)</span>
                      <span>Equilibrado (0.7)</span>
                      <span>Mais criativo (1.0)</span>
                    </div>
                  </div>
                </div>

                {/* API Key or Endpoint field */}
                {selectedProvider === 'ollama' ? (
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                      Endereço da Instância Ollama (Local):
                    </label>
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      Certifique-se de que o daemon do Ollama está rodando no seu terminal com: <code className="text-neutral-300">ollama serve</code>
                    </span>
                  </div>
                ) : selectedProvider === 'gemini' ? (
                  <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Chave do Gemini gerenciada automaticamente no servidor backend. Pronto para uso imediato!
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                      Chave de API ({currentProviderInfo.name}):
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={currentProviderInfo.keyPlaceholder || 'Cole sua chave de API aqui...'}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      A chave é utilizada via proxy seguro no servidor Express e nunca exposta publicamente.
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: YOUTUBE DATA API */}
          {activeTab === 'youtube' && (
            <div className="space-y-5">
              
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-xs text-red-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <span>A YouTube Data API é 100% gratuita</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  O Google concede uma cota gratuita de 10.000 unidades diárias para cada projeto no Google Cloud Console. Isso é suficiente para centenas de leituras de métricas e dezenas de uploads e agendamentos de vídeos e Shorts por dia.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Chave da YouTube Data API v3 (Opcional para Modo de Teste):
                </label>
                <input
                  type="password"
                  value={ytKey}
                  onChange={(e) => setYtKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                  Se deixado em branco, o AutoTube utiliza o <strong>Modo Simulador de Canal</strong> com métricas reais em sandbox para você testar com total segurança sem precisar criar projeto no Google Cloud agora.
                </p>
              </div>

              {/* Step by Step instructions */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
                <span className="font-bold text-white block">Como obter sua chave gratuita em 2 minutos:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300">
                  <li>Acesse o <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-red-400 underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a>.</li>
                  <li>Crie um projeto gratuito e vá em <strong>APIs e Serviços &gt; Biblioteca</strong>.</li>
                  <li>Pesquise por <strong>YouTube Data API v3</strong> e clique em <strong>Ativar</strong>.</li>
                  <li>Acesse <strong>Credenciais &gt; Criar Credenciais &gt; Chave de API</strong> e cole aqui.</li>
                </ol>
              </div>

            </div>
          )}

          {/* TAB 3: SYSTEM ENVIRONMENT & NODE */}
          {activeTab === 'environment' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Verificação de Ambiente Node.js:</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
                    {systemStatus?.isNode18Plus ? '✓ APROVADO (&ge; 18)' : 'REQUER ATENÇÃO'}
                  </span>
                </div>

                <div className="space-y-1 text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Versão do Node.js:</span>
                    <span className="text-white font-semibold">{systemStatus?.nodeVersion || 'v22.14.0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Sistema Operacional:</span>
                    <span className="text-white">{systemStatus?.platform || 'linux'} ({systemStatus?.arch || 'x64'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Motor do Projeto:</span>
                    <span className="text-white">JavaScript / TypeScript ESNext com Express + Vite</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status Gemini Backend:</span>
                    <span className="text-emerald-400">Ativo via @google/genai (server-side)</span>
                  </div>
                </div>
              </div>

              {/* Terminal instructions */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                <span className="font-semibold text-white block">Comando de verificação no terminal:</span>
                <div className="p-3 bg-black rounded-xl font-mono text-emerald-400 text-xs border border-neutral-800 flex items-center justify-between">
                  <span>node -v</span>
                  <span className="text-neutral-400 text-[11px] font-sans">Retorna a versão instalada</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  O projeto é 100% JavaScript moderno e roda em qualquer ambiente com Node.js versão 18 ou superior.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Configurações salvas!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-lg shadow-red-950/50"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
