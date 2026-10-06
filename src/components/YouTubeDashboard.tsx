import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Users, Eye, Video, Info, Youtube } from 'lucide-react';
import { YouTubeChannelData } from '../types';
import { fetchYouTubeChannel } from '../services/api';

interface Props { channelData: YouTubeChannelData | null; onChannelUpdated: (data: YouTubeChannelData | null) => void; }
const number = (value?: string) => value && Number.isFinite(Number(value)) ? Number(value).toLocaleString('pt-BR') : 'Dado não disponível';

export const YouTubeDashboard: React.FC<Props> = ({ channelData, onChannelUpdated }) => {
  const [handle, setHandle] = useState(channelData?.customUrl || '@loopsonorobr');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');
  const query = async () => {
    if (!handle.trim()) { setError('Informe um identificador de canal.'); return; }
    setLoading(true); setError('');
    try {
      const clean = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;
      localStorage.setItem('autotube_channel_handle', clean);
      const response = await fetchYouTubeChannel(clean);
      setSource(response.source); onChannelUpdated(response.channel);
      if (!response.channel) setError(response.message || 'Nenhum dado retornado.');
    } catch (reason: any) { onChannelUpdated(null); setError(reason.message || 'Consulta indisponível.'); }
    finally { setLoading(false); }
  };
  const metrics = [
    { label: 'Inscritos', value: number(channelData?.statistics?.subscriberCount), icon: Users },
    { label: 'Visualizações totais', value: number(channelData?.statistics?.viewCount), icon: Eye },
    { label: 'Vídeos públicos', value: number(channelData?.statistics?.videoCount), icon: Video },
  ];
  return <div className="space-y-5">
    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 md:flex-row md:items-center"><div><h2 className="flex items-center gap-2 text-lg font-bold text-white"><Youtube className="h-5 w-5 text-red-500" />Canal e estatísticas públicas</h2><p className="mt-1 max-w-2xl text-xs text-neutral-400">Dados públicos, quando a YouTube Data API estiver configurada no servidor. Métricas de Analytics não são consultadas por esta tela.</p></div><div className="flex gap-2"><input aria-label="Handle do canal" value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@SeuCanal" className="w-48 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-white" /><button onClick={query} disabled={loading} className="flex items-center gap-2 rounded-xl bg-neutral-800 px-3 py-2 text-xs text-white disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Consultar</button></div></section>
    {error && <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-100">{error}</div>}
    {channelData ? <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6"><div className="flex flex-wrap items-center gap-3">{channelData.thumbnails?.high?.url && <img src={channelData.thumbnails.high.url} alt="Ícone do canal" className="h-14 w-14 rounded-xl object-cover" />}<div className="min-w-0 flex-1"><h3 className="text-xl font-bold text-white">{channelData.title}</h3><p className="text-xs text-neutral-400">{channelData.customUrl || ''}</p><p className="mt-1 line-clamp-2 text-xs text-neutral-300">{channelData.description || 'Descrição não disponível.'}</p></div><a href={`https://www.youtube.com/${channelData.customUrl || '@loopsonorobr'}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-neutral-800 px-3 py-2 text-xs text-red-300">Abrir canal<ExternalLink className="h-3 w-3" /></a></div><div className="mt-5 grid grid-cols-1 gap-3 border-t border-neutral-800 pt-5 sm:grid-cols-3">{metrics.map(({label,value,icon:Icon}) => <div key={label} className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3"><div className="mb-1 flex items-center gap-2 text-xs text-neutral-400"><Icon className="h-3.5 w-3.5" />{label}</div><div className="font-mono text-lg font-bold text-white">{value}</div></div>)}</div>{source && <p className="mt-3 text-[10px] text-neutral-500">Fonte: {source}</p>}</section> : <section className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 text-sm text-neutral-400">Dados públicos ainda não disponíveis. Configure YOUTUBE_API_KEY no servidor e consulte o canal.</section>}
    <section className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5"><h3 className="flex items-center gap-2 text-sm font-bold text-amber-100"><Info className="h-4 w-4" />Analytics, dado não disponível</h3><div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">{['CTR', 'Retenção e duração média', 'Horas públicas', 'Países e horários', 'Receita/RPM', 'Cota real da API'].map((label) => <div key={label} className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3"><span className="text-neutral-400">{label}:</span> dado não disponível</div>)}</div><p className="mt-3 text-[11px] text-neutral-400">CTR, retenção, receita e relatórios privados requerem YouTube Analytics API e OAuth 2.0. Uma chave da Data API pública não fornece esses dados. Upload e agendamento não estão implementados.</p></section>
  </div>;
};
