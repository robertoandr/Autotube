import React, { useState } from 'react';
import { 
  Youtube, 
  TrendingUp, 
  Users, 
  Eye, 
  Video, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  Clock, 
  Calendar, 
  Zap, 
  Award
} from 'lucide-react';
import { YouTubeChannelData, SystemStatus } from '../types';
import { fetchYouTubeChannel, resetDailyQuota } from '../services/api';

interface YouTubeDashboardProps {
  channelData: YouTubeChannelData | null;
  systemStatus: SystemStatus | null;
  onChannelUpdated: (data: YouTubeChannelData) => void;
  onQuotaReset: () => void;
  apiKey?: string;
}

export const YouTubeDashboard: React.FC<YouTubeDashboardProps> = ({
  channelData,
  systemStatus,
  onChannelUpdated,
  onQuotaReset,
  apiKey,
}) => {
  const [handleInput, setHandleInput] = useState(channelData?.customUrl || '@loopsonorobr');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearchChannel = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const cleanHandle = handleInput.trim().startsWith('@') ? handleInput.trim() : `@${handleInput.trim()}`;
      localStorage.setItem('autotube_channel_handle', cleanHandle);
      const res = await fetchYouTubeChannel(cleanHandle, apiKey);
      onChannelUpdated(res.channel);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar canal do YouTube.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      await resetDailyQuota();
      onQuotaReset();
    } catch (e) {
      console.error(e);
    }
  };

  const quotaUsed = systemStatus?.quota.used ?? 140;
  const quotaLimit = systemStatus?.quota.limit ?? 10000;
  const quotaRemaining = quotaLimit - quotaUsed;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  return (
    <div className="space-y-6">
      
      {/* Top Header & Channel Search Bar */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <Youtube className="w-5 h-5 fill-red-600 text-transparent" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              YouTube Data API v3 & Métricas do Canal
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            A YouTube Data API é 100% gratuita. É por ela que o AutoTube monitora as estatísticas de retenção e publica os vídeos autorizados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              placeholder="@SeuCanal"
              className="bg-neutral-950 border border-neutral-700 rounded-xl pl-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-red-500 w-48 sm:w-56"
            />
          </div>
          <button
            disabled={loading}
            onClick={handleSearchChannel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Consultar</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Channel Profile Banner */}
      {channelData && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <img
              src={channelData.thumbnails?.high?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'}
              alt={channelData.title}
              className="w-16 h-16 rounded-2xl object-cover border border-neutral-700 shadow-md"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {channelData.title}
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  {channelData.customUrl}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  API Conectada
                </span>
                <a
                  href={`https://www.youtube.com/${channelData.customUrl || '@loopsonorobr'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-400 hover:text-red-300 bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <span>Abrir Canal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-neutral-300 mt-1 line-clamp-1">
                {channelData.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800/80">
            
            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span>Inscritos</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {Number(channelData.statistics?.subscriberCount || 0).toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span>Visualizações Totais</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {Number(channelData.statistics?.viewCount || 0).toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>CTR Médio do Canal</span>
              </div>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {channelData.metrics?.avgCtr || '8.4%'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                <span>Vídeos Publicados</span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {channelData.statistics?.videoCount || '142'}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Two Column Grid: Quota Meter & Best Times / Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quota Meter */}
        <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Controle de Cota Diária Gratuita
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                O Google concede 10.000 unidades gratuitas por dia para cada projeto.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Resetar Teste
            </button>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-neutral-400">Consumo Hoje:</span>
              <span className="text-white font-bold">{quotaUsed} / {quotaLimit} unidades</span>
            </div>
            <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  quotaPercent > 80 ? 'bg-red-500' : quotaPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(2, quotaPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400 pt-1">
              <span>{quotaRemaining} unidades restantes</span>
              <span className="text-emerald-400 font-semibold">{100 - quotaPercent}% livre</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="text-xs space-y-2 pt-2">
            <span className="text-neutral-400 font-medium block">Tabela de Custos por Ação da API:</span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block">Leitura de Canal</span>
                <span className="font-mono text-emerald-400 font-bold">1 unidade</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block">Atualizar Metadados</span>
                <span className="font-mono text-sky-400 font-bold">50 unidades</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block">Upload de Vídeo</span>
                <span className="font-mono text-amber-400 font-bold">1.600 unidades</span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Insights: Best Hours & Retention */}
        <div className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Inteligência de Algoritmo & Horários
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Recomendações com base nas métricas de engajamento do seu nicho.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Melhor Horário de Postagem:
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {channelData?.metrics?.topUploadHour || '18:00 BRT'}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1">
                Pico de audiência ativa no nicho
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="text-neutral-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Melhores Dias:
              </span>
              <span className="text-sm font-bold text-white">
                {channelData?.metrics?.bestDays?.join(', ') || 'Terça, Quinta, Domingo'}
              </span>
              <p className="text-[10px] text-neutral-400 mt-1">
                Dias de maior CTR e compartilhamento
              </p>
            </div>
          </div>

          {/* Retention Strategy Tip */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-1.5">
            <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Fórmula de Retenção Recomendada:
            </span>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              O YouTube premia vídeos com mais de 70% de retenção nos primeiros 30 segundos. Por isso o gerador do AutoTube estrutura o roteiro com <span className="text-white font-medium">Gancho de Curiosidade Imediato</span> e quebras de padrão a cada 4 segundos.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
