import React, { useEffect, useState } from 'react';
import { AIConfig, SystemStatus, VideoItem, YouTubeChannelData } from './types';
import { INITIAL_VIDEOS } from './data/initialData';
import { fetchSystemStatus, fetchYouTubeChannel } from './services/api';
import { Navbar } from './components/Navbar';
import { ApprovalBanner } from './components/ApprovalBanner';
import { ApprovalQueueView } from './components/ApprovalQueueView';
import { PipelineBoard } from './components/PipelineBoard';
import { YouTubeDashboard } from './components/YouTubeDashboard';
import { ContentGeneratorModal } from './components/ContentGeneratorModal';
import { ProviderSettingsModal } from './components/ProviderSettingsModal';

const DEMO_IDS = new Set(['vid-sleep-101', 'vid-sleep-102', 'vid-sleep-103']);

function loadVideos(): VideoItem[] {
  try {
    const value = localStorage.getItem('autotube_videos');
    if (!value) return INITIAL_VIDEOS;
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return INITIAL_VIDEOS;
    const rows = parsed.filter((row): row is VideoItem => Boolean(row && typeof row === 'object' && typeof (row as VideoItem).id === 'string'));
    if (!rows.length) return INITIAL_VIDEOS;
    return rows.map((item) => {
      const legacy = item as VideoItem & { publishedUrl?: string; scheduledFor?: string };
      const sample = DEMO_IDS.has(item.id) && item.isDemo !== false;
      const fakeUpload = typeof legacy.publishedUrl === 'string' && /youtu\.be\/(demo_|yt_)/.test(legacy.publishedUrl);
      const unverifiableApproval = item.approvedByUser && !item.approvalRecord;
      const unverifiedPublicStatus = item.status === 'published' || item.status === 'scheduled';
      const { publishedUrl: _url, scheduledFor: _date, ...safe } = legacy;
      if (!sample && !fakeUpload && !unverifiableApproval && !unverifiedPublicStatus) return safe;
      return { ...safe, isDemo: sample || Boolean(item.isDemo), status: 'pending_approval', approvedByUser: false, approvalTimestamp: undefined, approverNote: undefined, approvalRecord: undefined };
    });
  } catch {
    return INITIAL_VIDEOS;
  }
}

export default function App() {
  const approvalMode = true;
  const [aiConfig, setAIConfig] = useState<AIConfig>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('autotube_ai_config') || '{}');
      return { provider: saved.provider || 'gemini', model: saved.model || 'gemini-3.8-flash', temperature: saved.temperature ?? 0.7 };
    } catch {
      return { provider: 'gemini', model: 'gemini-3.8-flash', temperature: 0.7 };
    }
  });
  const [items, setItems] = useState<VideoItem[]>(loadVideos);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [channelData, setChannelData] = useState<YouTubeChannelData | null>(null);
  const [activeTab, setActiveTab] = useState<'approvals' | 'pipeline' | 'analytics'>('approvals');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // API secrets/tokens remain in memory only, never localStorage.
    localStorage.setItem('autotube_ai_config', JSON.stringify({ provider: aiConfig.provider, model: aiConfig.model, temperature: aiConfig.temperature }));
  }, [aiConfig]);
  useEffect(() => { localStorage.setItem('autotube_videos', JSON.stringify(items)); }, [items]);
  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus);
    const handle = localStorage.getItem('autotube_channel_handle') || '@loopsonorobr';
    fetchYouTubeChannel(handle).then((data) => setChannelData(data.channel)).catch((error) => console.error('Falha ao consultar dados públicos do canal:', error));
  }, []);

  const handleApprove = (id: string, note: string, plannedAt: string, approverName: string) => {
    setItems((current) => current.map((item) => {
      if (item.id !== id || item.status !== 'pending_approval' || item.isDemo) return item;
      const approvedAt = new Date().toISOString();
      const snapshot = {
        title: item.title, titleVariants: [...(item.titleVariants || [])], hook: item.hook, script: item.script,
        format: item.format, estimatedDuration: item.estimatedDuration, description: item.description, tags: [...item.tags],
        pinnedComment: item.pinnedComment, thumbnailPrompt: item.thumbnailPrompt, thumbnailOverlayText: item.thumbnailOverlayText,
        thumbnailColor: item.thumbnailColor, publicationType: 'normal' as const, plannedAt, timeZone: 'America/Sao_Paulo' as const,
      };
      const record = { version: (item.approvalHistory?.length || 0) + 1, approvedAt, approverName, notes: note, snapshot };
      return { ...item, status: 'approved', approvedByUser: true, approvalTimestamp: approvedAt, approverNote: note, plannedAt, publicationType: 'normal', approvalRecord: record, approvalHistory: [...(item.approvalHistory || []), record] };
    }));
  };

  const handleReject = (id: string) => {
    if (!window.confirm('Rejeitar e arquivar este conteúdo somente neste navegador? Nenhuma ação será feita no YouTube.')) return;
    setItems((current) => current.map((item) => item.id === id ? { ...item, status: 'rejected', approvedByUser: false, rejectedAt: new Date().toISOString(), rejectionNote: 'Rejeitado pelo proprietário; arquivado localmente.' } : item));
  };

  const handleUpdateItem = (updated: VideoItem) => {
    setItems((current) => current.map((existing) => {
      if (existing.id !== updated.id) return existing;
      const original = existing.approvalRecord?.snapshot;
      if (!original) return updated;
      const changed = updated.title !== original.title
        || JSON.stringify(updated.titleVariants || []) !== JSON.stringify(original.titleVariants)
        || updated.hook !== original.hook || updated.script !== original.script || updated.format !== original.format
        || updated.estimatedDuration !== original.estimatedDuration || updated.description !== original.description
        || JSON.stringify(updated.tags) !== JSON.stringify(original.tags) || updated.pinnedComment !== original.pinnedComment
        || updated.thumbnailPrompt !== original.thumbnailPrompt || updated.thumbnailOverlayText !== original.thumbnailOverlayText
        || updated.thumbnailColor !== original.thumbnailColor || updated.plannedAt !== original.plannedAt;
      if (!changed) return updated;
      return {
        ...updated,
        status: 'pending_approval',
        approvedByUser: false,
        approvalTimestamp: undefined,
        approvalRecord: undefined,
        approvalHistory: (() => {
          const history = existing.approvalHistory || [];
          const previousRecord = existing.approvalRecord;
          if (!previousRecord || history.some((record) => record.version === previousRecord.version && record.approvedAt === previousRecord.approvedAt)) return history;
          return [...history, previousRecord];
        })(),
        approverNote: 'Conteúdo alterado após aprovação; aguarda nova aprovação.',
      };
    }));
  };

  const handleVideoCreated = (video: VideoItem) => { setItems((current) => [video, ...current]); setActiveTab('approvals'); };
  const pendingCount = items.filter((item) => item.status === 'pending_approval').length;

  return <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-red-500/20 selection:text-red-300">
    <Navbar systemStatus={systemStatus} aiConfig={aiConfig} approvalMode={approvalMode} onOpenSettings={() => setIsSettingsOpen(true)} onOpenGenerator={() => setIsGeneratorOpen(true)} activeTab={activeTab} setActiveTab={setActiveTab} pendingCount={pendingCount} />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <ApprovalBanner approvalMode={approvalMode} pendingCount={pendingCount} onGoToApprovals={() => setActiveTab('approvals')} />
      {activeTab === 'approvals' && <ApprovalQueueView items={items} aiConfig={aiConfig} onApprove={handleApprove} onReject={handleReject} onUpdateItem={handleUpdateItem} />}
      {activeTab === 'pipeline' && <PipelineBoard items={items} onSelectItem={() => setActiveTab('approvals')} onOpenGenerator={() => setIsGeneratorOpen(true)} approvalMode={approvalMode} />}
      {activeTab === 'analytics' && <YouTubeDashboard channelData={channelData} onChannelUpdated={setChannelData} />}
    </main>
    <ContentGeneratorModal isOpen={isGeneratorOpen} onClose={() => setIsGeneratorOpen(false)} aiConfig={aiConfig} onVideoCreated={handleVideoCreated} approvalMode={approvalMode} />
    <ProviderSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} aiConfig={aiConfig} onSaveAIConfig={setAIConfig} systemStatus={systemStatus} />
    <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-400"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><span className="font-semibold text-neutral-300">AutoTube Studio · revisão humana obrigatória</span><button onClick={() => setIsSettingsOpen(true)} className="hover:text-white">Configurações de IA</button></div></footer>
  </div>;
}
