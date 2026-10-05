import React from 'react';
import { Play, Sparkles, Youtube, CheckCircle2 } from 'lucide-react';
import { VideoItem } from '../types';

interface ThumbnailPreviewProps {
  item: VideoItem;
  onUpdateOverlayText?: (text: string) => void;
  channelName?: string;
  isInteractive?: boolean;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  item,
  onUpdateOverlayText,
  channelName = 'Loop Sonoro BR',
  isInteractive = true,
}) => {
  const isShort = item.format === 'short';

  return (
    <div className="flex flex-col gap-3">
      {/* Format Header */}
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span className="font-medium text-neutral-300 flex items-center gap-1.5">
          <Youtube className="w-3.5 h-3.5 text-red-500" />
          Preview no feed do YouTube ({isShort ? 'Shorts 9:16' : 'Vídeo Longo 16:9'})
        </span>
        <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
          <span>Potencial:</span>
          <span className="text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-800/50 px-2 py-0.5 rounded">
            {item.appealQuality || 'Forte'}
          </span>
        </span>
      </div>

      {/* Frame Container */}
      <div className="flex justify-center bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800">
        {isShort ? (
          /* Shorts 9:16 vertical container */
          <div className="relative w-64 h-[420px] rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl flex flex-col justify-between p-4 group select-none bg-neutral-900">
            {/* Background art / gradient based on item.thumbnailColor */}
            <div
              className="absolute inset-0 opacity-80 transition-transform duration-700 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${item.thumbnailColor} 0%, #090a0f 75%)`,
              }}
            />
            {/* Subtle mesh pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Top Shorts Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white border border-white/10">
                #SHORTS
              </span>
              <span className="text-[10px] font-mono text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
                {item.estimatedDuration}
              </span>
            </div>

            {/* Center Dynamic Punchy Text */}
            <div className="relative z-10 my-auto text-center px-2">
              <div className="inline-block bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 shadow-2xl">
                <span className="font-black text-xl text-yellow-300 uppercase tracking-tight block drop-shadow-md">
                  {item.thumbnailOverlayText || 'GANCHO VIRAL'}
                </span>
              </div>
              <p className="text-xs font-semibold text-white/90 mt-2 line-clamp-2 drop-shadow">
                {item.hook.slice(0, 70)}...
              </p>
            </div>

            {/* Bottom Details / Creator Info */}
            <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent -mx-4 -mb-4 p-4 pt-6">
              <p className="text-xs font-bold text-white line-clamp-2 leading-snug">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">
                  AT
                </div>
                <span className="text-[11px] text-neutral-300 font-medium truncate">
                  {channelName}
                </span>
                <CheckCircle2 className="w-3 h-3 text-neutral-400 shrink-0" />
              </div>
            </div>
          </div>
        ) : (
          /* Long-form 16:9 horizontal container */
          <div className="w-full max-w-md">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-700 shadow-2xl flex flex-col justify-between p-4 group select-none bg-neutral-900">
              {/* Background gradient */}
              <div
                className="absolute inset-0 opacity-85 transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${item.thumbnailColor} 0%, #171717 60%, #090a0f 100%)`,
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-red-600 px-2 py-0.5 rounded text-white shadow">
                  HD 1080p
                </span>
                <span className="text-[11px] font-mono font-medium text-white bg-black/80 px-2 py-0.5 rounded backdrop-blur-sm">
                  {item.estimatedDuration}
                </span>
              </div>

              {/* Bold Center Overlay Text */}
              <div className="relative z-10 text-center my-auto">
                <span className="inline-block font-black text-2xl sm:text-3xl text-yellow-300 uppercase tracking-tighter bg-black/90 px-4 py-2 rounded-xl border border-yellow-400/40 shadow-2xl">
                  {item.thumbnailOverlayText || 'ASSISTA AGORA'}
                </span>
              </div>

              {/* Play Watermark */}
              <div className="relative z-10 flex items-center justify-end">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Play className="w-4 h-4 fill-white text-transparent ml-0.5" />
                </div>
              </div>
            </div>

            {/* Video Card Title & Channel Row */}
            <div className="flex gap-3 mt-3">
              <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                AT
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white leading-tight line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                  <span>{channelName}</span>
                  <CheckCircle2 className="w-3 h-3 text-neutral-400" />
                  <span>&bull;</span>
                  <span>14 mil visualizações</span>
                  <span>&bull;</span>
                  <span>agendado</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prompt Used for Thumbnail Generation */}
      {isInteractive && (
        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
          <div className="flex items-center justify-between mb-1.5 text-neutral-400">
            <span className="flex items-center gap-1 font-medium text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Prompt Conceitual de Thumbnail:
            </span>
          </div>
          <p className="text-neutral-400 italic">
            "{item.thumbnailPrompt}"
          </p>

          {onUpdateOverlayText && (
            <div className="mt-3 pt-2 border-t border-neutral-900 flex items-center gap-2">
              <label className="text-neutral-400 shrink-0">Texto na Imagem:</label>
              <input
                type="text"
                value={item.thumbnailOverlayText}
                onChange={(e) => onUpdateOverlayText(e.target.value)}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-white font-bold text-xs focus:outline-none focus:border-red-500"
                placeholder="Ex: 10 HORAS SALVAS!"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
