import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  Video, 
  Zap, 
  Layers, 
  BrainCircuit, 
  Check,
  ShieldCheck
} from 'lucide-react';
import { AIConfig, VideoFormat, VideoItem } from '../types';
import { generateContentWithAI } from '../services/api';

interface ContentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiConfig: AIConfig;
  onVideoCreated: (video: VideoItem) => void;
  approvalMode: boolean;
}

const PRESET_TOPICS = [
  'Som de Chuva com Trovoada Leve para Dormir | 8 Horas Tela Preta',
  'Ruído Marrom Profundo para Bloquear Pensamentos e Dormir em Minutos',
  'Ondas do Mar Suaves à Noite | 4 Horas Tela Escura para Insônia',
  'Som de Ventilador Constante e Ruído Branco para Dormir a Noite Toda',
  'Chuva Suave na Floresta e Vento Aconchegante | 8 Horas Tela Preta',
  'Lareira Crepitante e Chuva Mansa para Relaxamento e Sono de Bebês',
];

export const ContentGeneratorModal: React.FC<ContentGeneratorModalProps> = ({
  isOpen,
  onClose,
  aiConfig,
  onVideoCreated,
  approvalMode,
}) => {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Sons de Natureza (Chuva, Trovoada, Mar, Floresta)');
  const [format, setFormat] = useState<VideoFormat>('video');
  const [durationOption, setDurationOption] = useState('8 Horas (Tela Preta)');
  const [narrativeStyle, setNarrativeStyle] = useState('Relaxante & Contínuo para Sono Profundo');
  const [hookType, setHookType] = useState('Acolhimento Imediato & Sons Suaves');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setErrorMsg('Digite um tema de som para dormir ou selecione uma opção recomendada.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const isShort = format === 'short';
    const targetDuration = isShort ? '58s' : durationOption;

    const systemPrompt = `Você é o roteirista e estrategista oficial do canal Loop Sonoro BR (@loopsonorobr).
REGRA CRÍTICA E INEGOCIÁVEL DE NICHO:
O canal Loop Sonoro BR é ESTRITAMENTE focado em sons contínuos para dormir, relaxar e combater a insônia:
- Sons de natureza para dormir: chuva, trovoada leve, mar, riacho, floresta, vento, lareira crepitante
- Ruído branco, rosa e marrom, sons de ventilador, ar-condicionado, cabine de avião, trem noturno
- NUNCA produza conteúdo sobre produção musical, samples, bateria, batidas ou história da música.
- Durações típicas: vídeos longos de 4 ou 8 horas com tela preta (black screen total para não clarear o quarto), ou Shorts verticais de divulgação de até 60 segundos.
- Público-alvo: pessoas com dificuldade para dormir, quem estuda ou trabalha com som de fundo, pais com bebês.

Retorne EXATAMENTE no formato JSON válido com as seguintes chaves:
{
  "title": "Título acolhedor e otimizado com alto apelo de busca (ex: Som de Chuva com Trovoada Leve para Dormir | 8 Horas Tela Preta)",
  "titleVariants": ["Variação A", "Variação B", "Variação C"],
  "hook": "Gancho dos primeiros segundos apresentando o som e convidando a deitar e relaxar",
  "script": "Roteiro e ambientação sonora detalhada, destacando áudio sem cortes e tela preta",
  "estimatedDuration": "${targetDuration}",
  "description": "Descrição com palavras-chave de sono, instruções de escuta, hashtags (#chuva #somparadormir #ruidobranco #somambiental #sleepsounds #telapreta) e CTA para se inscrever no Loop Sonoro BR",
  "tags": ["chuva", "somparadormir", "ruidobranco", "somambiental", "sleepsounds", "telapreta", "insonia", "dormirbem"],
  "pinnedComment": "Comentário fixado acolhedor desejando boa noite e convidando a se inscrever no canal",
  "thumbnailPrompt": "Conceito visual aconchegante, quarto escuro com vista para janela chovendo ou praia noturna acolhedora",
  "thumbnailOverlayText": "${isShort ? 'DESLIGUE A MENTE' : '8H TELA PRETA'}",
  "thumbnailColor": "#1e293b",
  "appealQuality": "Forte"
}`;

    const userPrompt = `Crie um pacote de publicação para o Loop Sonoro BR:
Formato: ${isShort ? 'YouTube Shorts vertical (9:16, 50s-60s)' : `Vídeo Longo horizontal (16:9, ${durationOption})`}
Tema do Som: "${topic}"
Pilar: "${niche}"
Estilo de Ambientação: "${narrativeStyle}"
Duração Alvo: "${targetDuration}"

Foque em relaxamento imediato, combate à insônia, ruído contínuo e sons suaves em português do Brasil.`;

    try {
      const response = await generateContentWithAI(userPrompt, aiConfig, systemPrompt);

      let parsed: any;
      try {
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```/, '').replace(/```$/, '').trim();
        }
        parsed = JSON.parse(cleanText);
      } catch (jsonErr) {
        parsed = {
          title: topic,
          titleVariants: [topic, `${topic} para Dormir e Relaxar`, `${topic} | Tela Preta Sem Luz`],
          hook: `Deite-se, feche os olhos e deixe este som contínuo de ${topic.toLowerCase()} acalmar sua mente e induzir sono profundo.`,
          script: response.text,
          estimatedDuration: targetDuration,
          description: `🌧️ ${topic} - Canal Loop Sonoro BR (@loopsonorobr).\n\nIdeal para dormir, relaxar e combater a insônia com tela preta protetora.\n\n#somparadormir #chuva #ruidobranco #somambiental #sleepsounds #telapreta`,
          tags: ['somparadormir', 'ruidobranco', 'somambiental', 'sleepsounds', 'telapreta', 'insonia'],
          pinnedComment: '🌧️ Deixe este som tocando a noite toda para descansar em paz! Inscreva-se no canal para novas noites de sono tranquilo.',
          thumbnailPrompt: `Cena noturna aconchegante e escura sobre ${topic} com iluminação azulada suave para quarto de dormir`,
          thumbnailOverlayText: isShort ? 'SOM RELAXANTE' : '8H TELA PRETA',
          thumbnailColor: '#1e293b',
          appealQuality: 'Forte',
        };
      }

      const newVideo: VideoItem = {
        id: `vid-sleep-${Date.now().toString(36)}`,
        title: parsed.title || topic,
        titleVariants: parsed.titleVariants || [topic],
        format,
        niche,
        hook: parsed.hook || 'Gancho acolhedor de indução ao sono',
        script: parsed.script || response.text,
        estimatedDuration: parsed.estimatedDuration || targetDuration,
        description: parsed.description || `Áudio contínuo sobre ${topic} para dormir e relaxar.`,
        tags: parsed.tags || ['somparadormir', 'ruidobranco', 'sleepsounds', 'telapreta'],
        pinnedComment: parsed.pinnedComment || 'Boa noite de sono! Inscreva-se no Loop Sonoro BR.',
        thumbnailPrompt: parsed.thumbnailPrompt || `Quarto escuro aconchegante com som de ${topic}`,
        thumbnailOverlayText: parsed.thumbnailOverlayText || (isShort ? 'DORMIR BEM' : '8H TELA PRETA'),
        thumbnailColor: parsed.thumbnailColor || '#1e293b',
        status: approvalMode ? 'pending_approval' : 'approved',
        approvedByUser: false,
        appealQuality: parsed.appealQuality || 'Forte',
        createdAt: new Date().toISOString(),
        aiProviderUsed: response.provider || aiConfig.provider,
        aiModelUsed: response.model || aiConfig.model,
      };

      onVideoCreated(newVideo);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao gerar o roteiro com a IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Gerador de Conteúdo &bull; Loop Sonoro BR
              </h3>
              <p className="text-xs text-neutral-400">
                Catálogo travado em sons contínuos para dormir, relaxar e combater a insônia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Format Selector: Long-form Black Screen vs Shorts */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Formato de Publicação do Canal:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('video')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  format === 'video'
                    ? 'bg-neutral-800 border-red-500 text-white ring-1 ring-red-500/30'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Vídeo Longo (Tela Preta)</span>
                  <span className="text-[11px] text-neutral-400">Horizontal (16:9) &bull; 4h a 8h para dormir</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('short')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  format === 'short'
                    ? 'bg-neutral-800 border-red-500 text-white ring-1 ring-red-500/30'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Shorts de Divulgação</span>
                  <span className="text-[11px] text-neutral-400">Vertical (9:16) &bull; Até 60s com gancho</span>
                </div>
              </button>
            </div>
          </div>

          {/* Duration Selector if Long Video */}
          {format === 'video' && (
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Duração da Sessão de Sono:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDurationOption('8 Horas (Tela Preta)')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    durationOption === '8 Horas (Tela Preta)'
                      ? 'bg-neutral-800 border-emerald-500 text-white font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  8 Horas (Tela Preta Completa)
                </button>
                <button
                  type="button"
                  onClick={() => setDurationOption('4 Horas (Tela Escura)')}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                    durationOption === '4 Horas (Tela Escura)'
                      ? 'bg-neutral-800 border-emerald-500 text-white font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  4 Horas (Tela Escura)
                </button>
              </div>
            </div>
          )}

          {/* Topic Input */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Tema do Som para Dormir e Relaxar:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Som de Chuva com Trovoada Leve na Janela para Dormir"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500 placeholder:text-neutral-500"
            />
            
            {/* Preset Ideas strictly for sleep sounds */}
            <div className="mt-2.5">
              <span className="text-[11px] text-neutral-400 block mb-1.5 font-medium">
                Pilares recomendados do canal (@loopsonorobr):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TOPICS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(preset)}
                    className="text-[11px] bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded-lg transition-colors text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Two-column options: Niche & Narrative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Pilar de Sons de Sono:
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Sons de Natureza (Chuva, Trovoada, Mar, Floresta)">Sons de Natureza (Chuva, Trovoada, Mar, Floresta)</option>
                <option value="Ruído Branco, Rosa e Marrom Contínuo">Ruído Branco, Rosa e Marrom Contínuo</option>
                <option value="Sons de Casa (Ventilador, Ar-condicionado, Lareira)">Sons de Casa (Ventilador, Ar-condicionado, Lareira)</option>
                <option value="Sons de Viagem (Trem Noturno, Cabine de Avião)">Sons de Viagem (Trem Noturno, Cabine de Avião)</option>
                <option value="Sons Suaves para Sono de Bebês e Crianças">Sons Suaves para Sono de Bebês e Crianças</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                Tipo de Gancho / Acolhimento:
              </label>
              <select
                value={hookType}
                onChange={(e) => setHookType(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Acolhimento Imediato & Sons Suaves">Acolhimento Imediato (Convidar a fechar os olhos)</option>
                <option value="Alívio Rápido de Insônia e Estresse Noturno">Alívio Rápido de Insônia e Estresse Noturno</option>
                <option value="Bloqueio de Ruídos Externos & Foco">Bloqueio de Ruídos Externos & Foco</option>
                <option value="Chuva Suave na Janela para Dormir Rápido">Chuva Suave na Janela para Dormir Rápido</option>
              </select>
            </div>
          </div>

          {/* Model info banner */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-sky-400" />
              <span>Modelo em execução: <strong className="text-white">{aiConfig.provider.toUpperCase()} ({aiConfig.model})</strong></span>
            </div>
            {aiConfig.provider === 'gemini' && (
              <span className="text-emerald-400 font-semibold">Cota Grátis Ativa</span>
            )}
          </div>

          {/* Safety Notice regarding Approval Mode */}
          {approvalMode && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Modo de Aprovação Ativo:</strong> O roteiro será gerado e enviado para sua aprovação. Nada vai para o YouTube antes de você clicar em SIM.
              </span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-red-950/50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Roteirizando com a IA...' : 'Gerar Pacote Completo'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
