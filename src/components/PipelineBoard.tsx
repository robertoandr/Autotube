import React from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Send, 
  Calendar, 
  Youtube, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { VideoItem, PipelineStatus } from '../types';

interface PipelineBoardProps {
  items: VideoItem[];
  onSelectItem: (id: string) => void;
  onOpenGenerator: () => void;
  approvalMode: boolean;
}

const COLUMNS: { key: PipelineStatus; label: string; icon: any; color: string }[] = [
  { key: 'idea', label: 'Ideias em Rascunho', icon: Sparkles, color: 'text-purple-400' },
  { key: 'scripted', label: 'Roteirizados', icon: Clock, color: 'text-sky-400' },
  { key: 'pending_approval', label: 'Aguardando Aprovação', icon: ShieldCheck, color: 'text-amber-400' },
  { key: 'approved', label: 'Aprovados & Agendados', icon: CheckCircle2, color: 'text-emerald-400' },
  { key: 'published', label: 'Publicados no YouTube', icon: Youtube, color: 'text-red-500' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  items,
  onSelectItem,
  onOpenGenerator,
  approvalMode,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Pipeline Editorial do Canal
          </h2>
          <p className="text-xs text-neutral-400">
            Acompanhe o fluxo autônomo desde a geração do roteiro até o envio via YouTube Data API.
          </p>
        </div>

        <button
          onClick={onOpenGenerator}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto shadow-md shadow-red-950/40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Novo Roteiro com IA</span>
        </button>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => {
          const colItems = items.filter((item) => {
            if (col.key === 'approved') {
              return item.status === 'approved' || item.status === 'scheduled';
            }
            return item.status === col.key;
          });

          const IconComponent = col.icon;

          return (
            <div
              key={col.key}
              className="bg-neutral-900/60 rounded-2xl border border-neutral-800/80 p-3 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${col.color}`} />
                  <span className="text-xs font-bold text-white">{col.label}</span>
                </div>
                <span className="text-xs font-mono font-medium text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                  {colItems.length}
                </span>
              </div>

              {/* Column Content */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className="p-3 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80 cursor-pointer transition-all shadow-sm group"
                  >
                    {/* Format Badge */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-2">
                      <span className="font-mono uppercase bg-neutral-800/90 text-neutral-300 px-1.5 py-0.5 rounded font-semibold">
                        {item.format === 'short' ? '⚡ Shorts' : '🎬 16:9'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {item.appealQuality || 'Forte'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
                      {item.title}
                    </h4>

                    {/* Thumbnail Concept Mini Tag */}
                    <div className="mt-2.5 pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="truncate max-w-[120px] text-neutral-400">
                        {item.niche}
                      </span>

                      {item.status === 'pending_approval' && (
                        <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                          Aprovar &rarr;
                        </span>
                      )}

                      {item.status === 'published' && item.publishedUrl && (
                        <a
                          href={item.publishedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                        >
                          Assistir <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {colItems.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl text-neutral-400 text-xs p-3 text-center">
                    <span>Nenhum item nesta etapa</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
