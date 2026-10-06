import React, { useState } from 'react';
import { BrainCircuit, Check, ShieldCheck, Sparkles, Video, X, Zap } from 'lucide-react';
import { AIConfig, VideoFormat, VideoItem } from '../types';
import { generateContentWithAI } from '../services/api';
import { appendBabySafetyNotice } from '../services/compliance';

interface ContentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfig: AIConfig;
  onVideoCreated: (video: VideoItem) => void;
  approvalMode: boolean;
}

const PRESET_TOPICS = [
  'Som de chuva suave com trovoadas distantes, oito horas',
  'Ruído marrom contínuo, demonstração curta',
  'Ondas do mar à noite, som ambiente de quatro horas',
  'Ventilador constante e ruído branco',
  'Chuva suave na floresta e vento',
  'Lareira crepitante e chuva mansa',
];
const PILLARS = [
  'Sons de Natureza (Chuva, Trovoada, Mar, Floresta)',
  'Ruído Branco, Rosa e Marrom Contínuo',
  'Sons de Casa (Ventilador, Ar-condicionado, Lareira)',
  'Sons de Viagem (Trem Noturno, Cabine de Avião)',
  'Som ambiente para a rotina de sono e relaxamento de bebês e crianças',
];

export const ContentGeneratorModal: React.FC<ContentGeneratorModalProps> = ({ isOpen, onClose, aiConfig, onVideoCreated }) => {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState(PILLARS[0]);
  const [format, setFormat] = useState<VideoFormat>('video');
  const [duration, setDuration] = useState('8 horas, planejadas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generate = async () => {
    if (!topic.trim()) { setError('Digite um tema de som ambiente.'); return; }
    setLoading(true);
    setError('');
    const short = format === 'short';
    const targetDuration = short ? 'até 60 segundos, planejados' : duration;
    const safetyNotice = 'Utilize em volume baixo. Este áudio não substitui orientação médica. Para crianças e bebês, mantenha o dispositivo a uma distância segura e sob supervisão constante.';
    const system = `Você é redator editorial do canal Loop Sonoro BR, especializado em sons ambientes contínuos para relaxamento, descanso, foco e produtividade.
Trabalhe com chuva, trovoada distante, mar, riacho, floresta, vento, lareira, ruídos contínuos, ventilador, cabine de avião e trem. Não crie conteúdo fora do nicho.
Não faça alegações médicas ou fisiológicas. Não prometa cura, tratamento, prevenção, alívio de doença, melhora de respiração ou sono garantido. Não use afirmações sobre ansiedade, insônia, zumbido, sistema nervoso ou frequência cardíaca.
Se mencionar bebês ou crianças, use linguagem neutra como “som ambiente para a rotina de sono e relaxamento” e inclua literalmente na descrição: “${safetyNotice}”
Não afirme que áudio existe, é original/licenciado, sem anúncios ou sem cortes, salvo fato fornecido e conferido. A duração/tela são planejadas até o arquivo ser conferido.
Retorne JSON válido com title, titleVariants, hook, script, estimatedDuration, description, tags, pinnedComment, thumbnailPrompt, thumbnailOverlayText, thumbnailColor, appealQuality. Descreva o som fielmente, sem promessas, superlativos ou efeitos médicos.`;
    const prompt = `Crie uma proposta de RASCUNHO, não uma publicação.\nFormato: ${short ? 'Short vertical (9:16)' : `vídeo horizontal (16:9), duração planejada ${duration}`}\nTema: ${topic}\nPilar: ${niche}\nDuração planejada: ${targetDuration}\nUse português brasileiro e não invente áudio, direitos ou efeitos.`;
    try {
      const response = await generateContentWithAI(prompt, aiConfig, system);
      let parsed: any;
      try {
        let text = (response.text || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
        parsed = JSON.parse(text);
      } catch {
        parsed = {
          title: topic,
          titleVariants: [topic, `${topic}, som ambiente`, `${topic}, som contínuo`],
          hook: `Amostra de som ambiente: ${topic}.`,
          script: response.text || 'Rascunho de roteiro, requer revisão.',
          estimatedDuration: targetDuration,
          description: `Rascunho de descrição para ${topic}. Use volume baixo e confirme arquivo, duração e direitos antes de publicar.`,
          tags: ['som ambiente', 'som contínuo'],
          pinnedComment: 'Rascunho de comentário para revisão.',
          thumbnailPrompt: `Conceito visual fiel ao som de ${topic}`,
          thumbnailOverlayText: short ? 'SOM AMBIENTE' : 'SOM CONTÍNUO',
          thumbnailColor: '#1e293b',
          appealQuality: 'A testar',
        };
      }
      const relatedText = `${topic} ${niche} ${parsed.title || ''} ${parsed.hook || ''} ${parsed.script || ''} ${parsed.description || ''} ${niche === PILLARS[4] ? 'bebês e crianças' : ''}`;
      const description = appendBabySafetyNotice(
        typeof parsed.description === 'string' ? parsed.description : `Rascunho de descrição para ${topic}. Ajuste o volume para um nível confortável.`,
        relatedText,
      );
      const newVideo: VideoItem = {
        id: `vid-sleep-${Date.now().toString(36)}`,
        title: parsed.title || topic,
        titleVariants: Array.isArray(parsed.titleVariants) ? parsed.titleVariants : [topic],
        format,
        niche,
        hook: parsed.hook || `Amostra de som ambiente: ${topic}.`,
        script: parsed.script || response.text || '',
        estimatedDuration: parsed.estimatedDuration || targetDuration,
        description,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['som ambiente', 'som contínuo'],
        pinnedComment: parsed.pinnedComment || 'Rascunho de comentário, requer revisão.',
        thumbnailPrompt: parsed.thumbnailPrompt || `Conceito de thumbnail fiel a ${topic}`,
        thumbnailOverlayText: parsed.thumbnailOverlayText || (short ? 'SOM AMBIENTE' : 'SOM CONTÍNUO'),
        thumbnailColor: parsed.thumbnailColor || '#1e293b',
        status: 'pending_approval',
        approvedByUser: false,
        isDemo: false,
        appealQuality: parsed.appealQuality === 'Forte' || parsed.appealQuality === 'Médio' ? parsed.appealQuality : 'A testar',
        createdAt: new Date().toISOString(),
        aiProviderUsed: response.provider || aiConfig.provider,
        aiModelUsed: response.model || aiConfig.model,
      };
      onVideoCreated(newVideo);
      onClose();
    } catch (reason: any) {
      setError(reason.message || 'Falha ao gerar o rascunho.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"><section className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
    <header className="flex items-center justify-between border-b border-neutral-800 p-6"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-red-400" /><div><h2 className="text-base font-bold text-white">Criar rascunho, Loop Sonoro</h2><p className="mt-1 text-xs text-neutral-400">A saída exige revisão. Não há upload ou publicação nesta versão.</p></div></div><button onClick={onClose} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"><X className="h-5 w-5" /></button></header>
    <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">{error}</div>}
      <div><label className="mb-2 block text-xs font-semibold text-neutral-300">Formato</label><div className="grid grid-cols-2 gap-3"><button onClick={() => setFormat('video')} className={`rounded-xl border p-3 text-left text-sm ${format === 'video' ? 'border-red-500 bg-neutral-800 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'}`}><Video className="mr-2 inline h-4 w-4" />Vídeo longo</button><button onClick={() => setFormat('short')} className={`rounded-xl border p-3 text-left text-sm ${format === 'short' ? 'border-red-500 bg-neutral-800 text-white' : 'border-neutral-800 bg-neutral-950 text-neutral-400'}`}><Zap className="mr-2 inline h-4 w-4" />Short</button></div></div>
      {format === 'video' && <label className="block text-xs text-neutral-300">Duração planejada<select value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-white"><option>8 horas, planejadas</option><option>4 horas, planejadas</option></select></label>}
      <label className="block text-xs font-semibold text-neutral-300">Tema do som<input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Ex.: chuva suave com trovoadas distantes" className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 p-3 text-white" /></label>
      <div className="flex flex-wrap gap-2">{PRESET_TOPICS.map((preset) => <button key={preset} onClick={() => setTopic(preset)} className="rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-left text-[11px] text-neutral-300 hover:border-neutral-600">{preset}</button>)}</div>
      <label className="block text-xs text-neutral-300">Pilar<select value={niche} onChange={(event) => setNiche(event.target.value)} className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 p-2.5 text-white">{PILLARS.map((pillar) => <option key={pillar}>{pillar}</option>)}</select></label>
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-200"><ShieldCheck className="mr-2 inline h-4 w-4" />Aprovação humana sempre ativa. O conteúdo gerado entra apenas como rascunho.</div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-400"><BrainCircuit className="mr-2 inline h-4 w-4 text-sky-400" />Modelo selecionado: {aiConfig.provider} · {aiConfig.model}</div>
    </div>
    <footer className="flex justify-between border-t border-neutral-800 bg-neutral-950/60 p-6"><button onClick={onClose} className="px-4 py-2 text-xs text-neutral-400 hover:text-white">Cancelar</button><button disabled={loading} onClick={generate} className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-50">{loading ? 'Gerando rascunho...' : 'Gerar rascunho'}</button></footer>
  </section></div>;
};
