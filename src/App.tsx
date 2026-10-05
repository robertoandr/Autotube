import React, { useState, useEffect } from 'react';
import { 
  AIConfig, 
  SystemStatus, 
  VideoItem, 
  YouTubeChannelData 
} from './types';
import { INITIAL_VIDEOS } from './data/initialData';
import { fetchSystemStatus, fetchYouTubeChannel } from './services/api';
import { Navbar } from './components/Navbar';
import { ApprovalBanner } from './components/ApprovalBanner';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { PipelineBoard } from './components/PipelineBoard';
import { YouTubeDashboard } from './components/YouTubeDashboard';
import { ContentGeneratorModal } from './components/ContentGeneratorModal';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';

export default function App() {
  // 1. Approval mode state - default to TRUE as explicitly specified:
  // "Tempo de teste: Deixe o modo de aprovação ligado até confiar no resultado. Nada sobe sem você dizer sim."
  const [approvalMode, setApprovalMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('autotube_approval_mode');
    return saved !== null ? saved === 'true' : true;
  });

  // 2. Active LLM Provider configuration
  const [aiConfig, setAIConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('autotube_ai_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      temperature: 0.7,
    };
  });

  // 3. YouTube API Key state
  const [youtubeApiKey, setYoutubeApiKey] = useState<string>(() => {
    return localStorage.getItem('autotube_yt_key') || '';
  });

  // 4. Videos & Pipeline items
  const [items, setItems] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('autotube_videos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If older generic items exist, upgrade to Loop Sonoro BR sleep sounds initial videos
        if (Array.isArray(parsed) && parsed.some((p: any) => p.id === 'vid-101' || p.id === 'vid-loop-101' || !p.id.startsWith('vid-sleep'))) {
          return INITIAL_VIDEOS;
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_VIDEOS;
  });

  // 5. System status & Channel data
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [channelData, setChannelData] = useState<YouTubeChannelData | null>(null);

  // 6. Navigation & Modals
  const [activeTab, setActiveTab] = useState<'approvals' | 'pipeline' | 'analytics'>('approvals');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('autotube_approval_mode', String(approvalMode));
  }, [approvalMode]);

  useEffect(() => {
    localStorage.setItem('autotube_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  useEffect(() => {
    localStorage.setItem('autotube_yt_key', youtubeApiKey);
  }, [youtubeApiKey]);

  useEffect(() => {
    localStorage.setItem('autotube_videos', JSON.stringify(items));
  }, [items]);

  // Initial data loading
  useEffect(() => {
    const loadSystem = async () => {
      const status = await fetchSystemStatus();
      setSystemStatus(status);
    };

    const loadChannel = async () => {
      try {
        const savedHandle = localStorage.getItem('autotube_channel_handle') || '@loopsonorobr';
        const res = await fetchYouTubeChannel(savedHandle, youtubeApiKey || undefined);
        setChannelData(res.channel);
      } catch (err) {
        console.error('Falha ao obter canal:', err);
      }
    };

    loadSystem();
    loadChannel();
  }, [youtubeApiKey]);

  // Approval handlers
  const handleToggleApprovalMode = () => {
    if (approvalMode) {
      const confirmDeactivate = window.confirm(
        'Tem certeza que deseja desativar o Modo de Aprovação?\n\n' +
        'A recomendação durante o tempo de teste é manter ligado para que nada suba ao YouTube sem o seu SIM explícito.'
      );
      if (!confirmDeactivate) return;
    }
    setApprovalMode(!approvalMode);
  };

  const handleApprove = (id: string, note?: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'approved',
            approvedByUser: true,
            approvalTimestamp: new Date().toISOString(),
            approverNote: note || 'Aprovado pelo criador.',
          };
        }
        return item;
      })
    );
  };

  const handleReject = (id: string) => {
    const confirmReject = window.confirm(
      'Regra 3 do Projeto: Deseja rejeitar este roteiro?\n\nO vídeo permanecerá em modo privado e será arquivado sem ir para publicação no canal.'
    );
    if (!confirmReject) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (updated: VideoItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handlePublished = (id: string, result: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'published',
            approvedByUser: true,
            publishedUrl: result.videoUrl || `https://youtu.be/${result.videoId}`,
            approvalTimestamp: new Date().toISOString(),
          };
        }
        return item;
      })
    );
    // Refresh quota usage in system status
    fetchSystemStatus().then((s) => setSystemStatus(s));
  };

  const handleVideoCreated = (newVideo: VideoItem) => {
    setItems((prev) => [newVideo, ...prev]);
    // If created in approval mode, jump straight to approvals view
    if (approvalMode) {
      setActiveTab('approvals');
    } else {
      setActiveTab('pipeline');
    }
  };

  const pendingApprovalsCount = items.filter((i) => i.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-red-500/20 selection:text-red-300">
      
      {/* Top Navbar & Diagnostics Bar */}
      <Navbar
        systemStatus={systemStatus}
        aiConfig={aiConfig}
        approvalMode={approvalMode}
        onToggleApprovalMode={handleToggleApprovalMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={pendingApprovalsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Persistent Approval Safety Banner */}
        <ApprovalBanner
          approvalMode={approvalMode}
          onToggleApprovalMode={handleToggleApprovalMode}
          pendingCount={pendingApprovalsCount}
          onGoToApprovals={() => setActiveTab('approvals')}
        />

        {/* Tab 1: Approval Queue & Script Reviewer */}
        {activeTab === 'approvals' && (
          <ApprovalQueueView
            items={items}
            aiConfig={aiConfig}
            approvalMode={approvalMode}
            onApprove={handleApprove}
            onReject={handleReject}
            onUpdateItem={handleUpdateItem}
            onPublished={handlePublished}
            channelName={channelData?.title || 'Loop Sonoro BR'}
          />
        )}

        {/* Tab 2: Editorial Pipeline Board */}
        {activeTab === 'pipeline' && (
          <PipelineBoard
            items={items}
            onSelectItem={(id) => {
              setActiveTab('approvals');
            }}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
            approvalMode={approvalMode}
          />
        )}

        {/* Tab 3: YouTube Data API & Metrics */}
        {activeTab === 'analytics' && (
          <YouTubeDashboard
            channelData={channelData}
            systemStatus={systemStatus}
            onChannelUpdated={(data) => setChannelData(data)}
            onQuotaReset={() => fetchSystemStatus().then((s) => setSystemStatus(s))}
            apiKey={youtubeApiKey}
          />
        )}

      </main>

      {/* Modals */}
      <ContentGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        aiConfig={aiConfig}
        onVideoCreated={handleVideoCreated}
        approvalMode={approvalMode}
      />

      <ProviderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiConfig={aiConfig}
        onSaveAIConfig={(cfg) => setAIConfig(cfg)}
        systemStatus={systemStatus}
        youtubeApiKey={youtubeApiKey}
        onSaveYouTubeKey={(key) => setYoutubeApiKey(key)}
        approvalMode={approvalMode}
        onToggleApprovalMode={handleToggleApprovalMode}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-xs text-neutral-400 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">AutoTube Studio</span>
            <span>&bull;</span>
            <span>Automação para Canais do YouTube</span>
            <span>&bull;</span>
            <span className="font-mono text-neutral-400">Node.js 18+ JS</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Configurar Modelos (Gemini, Claude, OpenAI, Ollama)
            </button>
            <span>&bull;</span>
            <span>YouTube Data API v3 Gratuita</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
