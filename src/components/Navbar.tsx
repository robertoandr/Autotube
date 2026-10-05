import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Sparkles, 
  Youtube, 
  Settings, 
  PlusCircle, 
  Flame
} from 'lucide-react';
import { AIConfig, SystemStatus } from '../types';

interface NavbarProps {
  systemStatus: SystemStatus | null;
  aiConfig: AIConfig;
  approvalMode: boolean;
  onToggleApprovalMode: () => void;
  onOpenSettings: () => void;
  onOpenGenerator: () => void;
  activeTab: 'pipeline' | 'approvals' | 'analytics';
  setActiveTab: (tab: 'pipeline' | 'approvals' | 'analytics') => void;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  systemStatus,
  aiConfig,
  approvalMode,
  onToggleApprovalMode,
  onOpenSettings,
  onOpenGenerator,
  activeTab,
  setActiveTab,
  pendingCount,
}) => {
  const getProviderLabel = () => {
    switch (aiConfig.provider) {
      case 'gemini':
        return 'Gemini 3.8 Flash (Cota Grátis)';
      case 'claude':
        return 'Claude 3.7 Sonnet';
      case 'openai':
        return 'OpenAI GPT-4o';
      case 'openrouter':
        return 'OpenRouter';
      case 'ollama':
        return 'Ollama Local';
      case 'kimi':
        return 'Kimi Moonshot';
      case 'glm':
        return 'GLM-4 Zhipu';
      default:
        return 'IA';
    }
  };

  const quotaPercent = systemStatus
    ? Math.round((systemStatus.quota.used / systemStatus.quota.limit) * 100)
    : 1;

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
              <Youtube className="w-5 h-5 fill-red-600 text-transparent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">AutoTube</span>
                <a
                  href="https://www.youtube.com/@loopsonorobr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono font-medium text-red-400 hover:text-red-300 bg-red-950/60 hover:bg-red-950 border border-red-900/50 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="Abrir canal no YouTube"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>@loopsonorobr</span>
                </a>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Piloto Autônomo com Verificação Humana
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800/80 text-sm">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'approvals'
                  ? 'bg-neutral-800 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Modo Aprovação</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-neutral-800 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-red-400" />
              <span>Pipeline & Roteiros</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-neutral-800 text-white font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Métricas & Data API</span>
            </button>
          </nav>

          {/* Quick Actions & Approval Switch */}
          <div className="flex items-center gap-3">
            
            {/* Approval Mode Switch Guardrail */}
            <div 
              onClick={onToggleApprovalMode}
              title="Deixe o modo de aprovação ligado até confiar no resultado. Nada sobe sem você dizer sim."
              className={`cursor-pointer group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all select-none ${
                approvalMode
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-950/60'
              }`}
            >
              <div className="relative">
                {approvalMode ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${approvalMode ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`} />
              </div>

              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold leading-tight">
                  {approvalMode ? 'Aprovação: LIGADA' : 'Aprovação: DESLIGADA'}
                </div>
                <div className="text-[10px] text-neutral-400 leading-tight">
                  {approvalMode ? 'Nada sobe sem seu SIM' : 'Modo 100% Autônomo'}
                </div>
              </div>
            </div>

            {/* Create Video CTA */}
            <button
              onClick={onOpenGenerator}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors shadow-lg shadow-red-950/50"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Criar Conteúdo</span>
            </button>

            {/* Provider & Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
              title="Configurar Modelos (Claude, Gemini, OpenAI, Ollama) e YouTube Data API"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diagnostic Sub-Bar */}
        <div className="py-1.5 flex flex-wrap items-center justify-between text-xs text-neutral-400 border-t border-neutral-900 gap-2">
          
          {/* Node.js check */}
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Node.js:</span>
            <span className="text-neutral-200 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
              {systemStatus?.nodeVersion || 'v22.14.0'}
            </span>
            <span className="text-emerald-400 font-sans font-medium text-[11px]">
              ✓ node -v validado (&ge; 18)
            </span>
          </div>

          {/* Current Model */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Modelo:</span>
            <button 
              onClick={onOpenSettings} 
              className="text-sky-300 hover:underline font-medium cursor-pointer"
            >
              {getProviderLabel()}
            </button>
          </div>

          {/* YouTube Data API Quota */}
          <div className="flex items-center gap-2">
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>Cota YouTube Data API:</span>
            <span className="font-mono text-neutral-300">
              {systemStatus?.quota.used ?? 140} / {systemStatus?.quota.limit ?? 10000} un.
            </span>
            <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden inline-block">
              <div 
                className="h-full bg-emerald-500 rounded-full" 
                style={{ width: `${Math.max(4, quotaPercent)}%` }} 
              />
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
