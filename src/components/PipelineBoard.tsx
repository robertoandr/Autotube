import React from 'react';
import { Clock, CheckCircle2, ShieldCheck, Sparkles, FileText, Archive } from 'lucide-react';
import { VideoItem } from '../types';

interface PipelineBoardProps {
  items: VideoItem[];
  onSelectItem: (id: string) => void;
  onOpenGenerator: () => void;
  approvalMode: boolean;
}

const columns = [
  { key: 'idea' as const, label: 'Ideias', icon: Sparkles, filter: (item: VideoItem) => item.status === 'idea' },
  { key: 'scripted' as const, label: 'Roteirizados', icon: FileText, filter: (item: VideoItem) => item.status === 'scripted' },
  { key: 'pending' as const, label: 'Aguardando aprovação', icon: ShieldCheck, filter: (item: VideoItem) => item.status === 'pending_approval' },
  { key: 'approved' as const, label: 'Aprovados localmente, não publicados', icon: CheckCircle2, filter: (item: VideoItem) => item.status === 'approved' || item.status === 'scheduled' },
  { key: 'rejected' as const, label: 'Rejeitados, arquivados localmente', icon: Archive, filter: (item: VideoItem) => item.status === 'rejected' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ items, onSelectItem, onOpenGenerator }) => (
  <div className="space-y-4">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-lg font-bold text-white">Pipeline editorial</h2><p className="text-xs text-neutral-400">Visão local. Upload, agendamento e publicação não estão conectados.</p></div><button onClick={onOpenGenerator} className="flex items-center gap-2 self-start rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500"><Sparkles className="h-4 w-4" />Criar rascunho</button></div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">{columns.map(({ key, label, icon: Icon, filter }) => {
      const rows = items.filter(filter);
      return <section key={key} className="flex min-h-80 flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3"><h3 className="mb-3 flex items-center gap-2 border-b border-neutral-800 pb-3 text-xs font-bold text-white"><Icon className="h-4 w-4 text-sky-400" />{label}<span className="ml-auto font-mono text-neutral-400">{rows.length}</span></h3><div className="flex-1 space-y-2">{rows.map((item) => <button key={item.id} onClick={() => onSelectItem(item.id)} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-left hover:border-neutral-600"><div className="mb-1 text-[10px] text-neutral-400">{item.format === 'short' ? 'Short' : 'Vídeo longo'} · {item.estimatedDuration}</div><div className="text-xs font-semibold text-white">{item.title}</div><div className="mt-2 text-[10px] text-neutral-500">{item.isDemo ? 'Exemplo demonstrativo' : item.niche}</div></button>)}{rows.length === 0 && <p className="rounded-lg border border-dashed border-neutral-800 p-4 text-center text-xs text-neutral-500"><Clock className="mx-auto mb-2 h-4 w-4" />Nenhum item</p>}</div></section>;
    })}</div>
  </div>
);
