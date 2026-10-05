import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Send, 
  Clock, 
  Tag, 
  MessageSquare, 
  FileText, 
  AlertCircle, 
  Share2, 
  Edit3, 
  Save, 
  Calendar,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AIConfig, VideoItem } from '../types';
import { ThumbnailPreview } from './ThumbnailPreview';
import { generateContentWithAI, publishToYouTube } from '../services/api';

interface ApprovalQueueViewProps {
  items: VideoItem[];
  aiConfig: AIConfig;
  approvalMode: boolean;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string) => void;
  onUpdateItem: (item: VideoItem) => void;
  onPublished: (id: string, result: any) => void;
  channelName: string;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  items,
  aiConfig,
  approvalMode,
  onApprove,
  onReject,
  onUpdateItem,
  onPublished,
  channelName,
}) => {
  const pendingItems = items.filter((v) => v.status === 'pending_approval');
  const [selectedId, setSelectedId] = useState<string>(pendingItems[0]?.id || items[0]?.id || '');
  
  // Selected item
  const selectedItem = items.find((v) => v.id === selectedId) || pendingItems[0] || items[0];

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editHook, setEditHook] = useState('');
  const [editScript, setEditScript] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');

  // AI refinement prompt state
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync edit fields when selecting another item
  React.useEffect(() => {
    if (selectedItem) {
      setEditTitle(selectedItem.title);
      setEditHook(selectedItem.hook);
      setEditScript(selectedItem.script);
      setEditDescription(selectedItem.description);
      setEditTags(selectedItem.tags.join(', '));
      setIsEditing(false);
      setFeedbackMessage(null);
    }
  }, [selectedId]);

  if (!selectedItem) {
    return (
      <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Nenhum Roteiro Pendente de Aprovação</h3>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mt-2 leading-relaxed">
          Todos os conteúdos gerados foram revisados ou publicados. Crie um novo vídeo para testar o gerador e o modo de aprovação.
        </p>
      </div>
    );
  }

  const handleSaveEdits = () => {
    const updated: VideoItem = {
      ...selectedItem,
      title: editTitle,
      hook: editHook,
      script: editScript,
      description: editDescription,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    onUpdateItem(updated);
    setIsEditing(false);
    setFeedbackMessage({ type: 'success', text: 'Alterações salvas com sucesso no roteiro!' });
  };

  const handleRefineWithAI = async () => {
    if (!refinePrompt.trim()) return;
    setIsRefining(true);
    setFeedbackMessage(null);

    try {
      const prompt = `Aqui está um roteiro para o YouTube que precisa de melhorias:
Título Atual: "${selectedItem.title}"
Gancho Atual: "${selectedItem.hook}"
Roteiro Atual:
${selectedItem.script}

Instrução de Ajuste do Criador:
"${refinePrompt}"

Por favor, reescreva mantendo a estrutura profissional com marcações de tempo [00:00] e notas de B-roll. Forneça o novo gancho e o roteiro atualizado.`;

      const result = await generateContentWithAI(
        prompt,
        aiConfig,
        'Você é um editor sênior de roteiros virais para YouTube. Melhore o texto conforme instruído.'
      );

      const updated: VideoItem = {
        ...selectedItem,
        script: result.text,
        approverNote: `Refinado com IA: "${refinePrompt}"`,
      };
      onUpdateItem(updated);
      setEditScript(result.text);
      setRefinePrompt('');
      setFeedbackMessage({ type: 'success', text: 'Roteiro refinado com a IA com base na sua instrução!' });
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Falha ao refinar com a IA.' });
    } finally {
      setIsRefining(false);
    }
  };

  const [scheduleTime, setScheduleTime] = useState('2026-10-05T21:00');

  const handlePublishNow = async () => {
    setIsPublishing(true);
    setFeedbackMessage(null);

    try {
      // Direct call to YouTube publish gate - ALWAYS in private mode per rule 1
      const res = await publishToYouTube({
        videoTitle: selectedItem.title,
        videoDescription: selectedItem.description,
        tags: selectedItem.tags,
        privacyStatus: 'private', // Regra 1: Todo vídeo gerado é enviado apenas em modo privado
        isShort: selectedItem.format === 'short',
        approvalModeActive: approvalMode,
        userApproved: true, // User clicked explicit publish
        approverNote: 'Aprovado e enviado em modo privado pelo criador',
      });

      onPublished(selectedItem.id, res);
      setFeedbackMessage({
        type: 'success',
        text: `Vídeo enviado com sucesso ao YouTube em MODO PRIVADO (Conforme Regra 1). ID: ${res.videoId}`,
      });
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Erro ao publicar no canal do YouTube.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-75 hover:opacity-100"
          >
            Fechar
          </button>
        </div>
      )}

      {/* 3 Project Rules Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
            Regras do Fluxo de Aprovação do Canal
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <strong className="text-white block font-medium">Modo Privado Inicial</strong>
              <p className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                Todo vídeo gerado é enviado ao YouTube apenas em modo privado.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <strong className="text-emerald-300 block font-medium">Aprovação & Agendamento</strong>
              <p className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                Só vai para publicação agendada após o seu botão de aprovação, com data escolhida.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <strong className="text-white block font-medium">Vídeo Rejeitado</strong>
              <p className="text-neutral-400 text-[11px] mt-0.5 leading-relaxed">
                Vídeo rejeitado permanece privado e arquivado sem publicação.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Item selector sidebar + Content Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List of Pending Items */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Fila de Aprovação ({pendingItems.length})
            </h3>
            <span className="text-xs text-neutral-400">
              {approvalMode ? '🛡️ Trava Ativa' : '⚠️ Autônomo'}
            </span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {pendingItems.map((item) => {
              const isSelected = item.id === selectedItem.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-800/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                    <span className="font-mono uppercase text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
                      {item.format === 'short' ? '⚡ Shorts' : '🎬 Vídeo Longo'}
                    </span>
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Aguardando SIM
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-neutral-800/60">
                    <span className="truncate max-w-[130px]">{item.niche}</span>
                    <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                      {item.appealQuality || 'Forte'}
                    </span>
                  </div>
                </div>
              );
            })}

            {pendingItems.length === 0 && (
              <div className="p-6 rounded-xl bg-neutral-900/40 border border-neutral-800 text-center text-xs text-neutral-400">
                Nenhum item aguardando no momento.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Action Bar */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                  {selectedItem.format === 'short' ? 'YouTube Shorts' : 'Vídeo Longo (Tela Preta)'}
                </span>
                <span className="text-xs text-neutral-400">
                  Criado com {selectedItem.aiModelUsed || 'Gemini 3.8 Flash'}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Revisão do Roteiro & Metadados
              </h2>
            </div>

            {/* Approval Decision Buttons with Rule 2 Date Picker */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="bg-transparent text-xs text-neutral-200 focus:outline-none"
                  title="Data e hora para agendar no YouTube após aprovação (Regra 2)"
                />
              </div>

              <button
                onClick={() => onReject(selectedItem.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                title="Regra 3: Vídeo rejeitado permanece privado e arquivado"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Rejeitar & Arquivar</span>
              </button>

              <button
                onClick={() => {
                  onApprove(selectedItem.id, `Aprovado pelo criador com agendamento para ${scheduleTime}`);
                  setFeedbackMessage({
                    type: 'success',
                    text: `Roteiro aprovado! Agendamento definido para ${scheduleTime.replace('T', ' às ')} (Regra 2).`,
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Dizer SIM: Aprovar & Agendar</span>
              </button>

              <button
                disabled={isPublishing}
                onClick={handlePublishNow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors disabled:opacity-50"
                title="Enviar como Privado no YouTube (Regra 1)"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Enviando...' : 'Enviar Privado'}</span>
              </button>
            </div>
          </div>

          {/* Main Inspection Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Column 1: Script, Hook & Titles */}
            <div className="space-y-4">
              
              {/* Title Section with A/B options */}
              <div className="bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-400" />
                    Título Principal
                  </span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isEditing ? 'Cancelar Edição' : 'Editar'}
                  </button>
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-white font-semibold focus:outline-none focus:border-red-500"
                  />
                ) : (
                  <p className="text-sm font-bold text-white leading-snug">
                    {selectedItem.title}
                  </p>
                )}

                {/* Title Variations for A/B Testing */}
                {selectedItem.titleVariants && selectedItem.titleVariants.length > 1 && (
                  <div className="pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] text-neutral-400 font-medium block mb-1.5">
                      Variações para Teste A/B de CTR:
                    </span>
                    <div className="space-y-1">
                      {selectedItem.titleVariants.map((variant, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setEditTitle(variant);
                            onUpdateItem({ ...selectedItem, title: variant });
                          }}
                          className={`text-xs p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedItem.title === variant
                              ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                              : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                          }`}
                        >
                          <span className="text-neutral-500 mr-1.5">Opção {idx + 1}:</span>
                          {variant}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hook Section (0-3 segundos) */}
              <div className="bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Gancho de Retenção (0 a 3s)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/40">
                    Fator Crítico de Retenção
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    rows={2}
                    value={editHook}
                    onChange={(e) => setEditHook(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-red-500"
                  />
                ) : (
                  <blockquote className="text-xs text-neutral-300 italic border-l-2 border-yellow-500 pl-3 py-1">
                    "{selectedItem.hook}"
                  </blockquote>
                )}
              </div>

              {/* Full Script */}
              <div className="bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Roteiro Completo (Locução & B-Rolls)
                  </span>
                  <span className="font-mono text-neutral-300">
                    Duração est.: {selectedItem.estimatedDuration}
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    rows={12}
                    value={editScript}
                    onChange={(e) => setEditScript(e.target.value)}
                    className="w-full font-mono text-xs bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-neutral-200 focus:outline-none focus:border-red-500 leading-relaxed"
                  />
                ) : (
                  <div className="bg-neutral-950 rounded-xl p-3.5 border border-neutral-800/80 max-h-80 overflow-y-auto font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.script}
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={handleSaveEdits}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Edições
                  </button>
                )}
              </div>

              {/* AI Refinement Box */}
              <div className="bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <label className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Pedir Ajustes ao Modelo de IA
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    placeholder="Ex: Deixe o gancho mais misterioso ou encurte para 45s..."
                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRefineWithAI()}
                  />
                  <button
                    disabled={isRefining || !refinePrompt.trim()}
                    onClick={handleRefineWithAI}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs transition-colors shrink-0"
                  >
                    {isRefining ? 'Ajustando...' : 'Regerar'}
                  </button>
                </div>
              </div>

            </div>

            {/* Column 2: Live Thumbnail & YouTube Metadata */}
            <div className="space-y-4">
              
              {/* Thumbnail Live Card */}
              <div className="bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800">
                <ThumbnailPreview
                  item={selectedItem}
                  channelName={channelName}
                  onUpdateOverlayText={(text) => {
                    const updated = { ...selectedItem, thumbnailOverlayText: text };
                    onUpdateItem(updated);
                  }}
                />
              </div>

              {/* YouTube Description & SEO Tags */}
              <div className="bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-sky-400" />
                    Descrição & Tags (YouTube Data API)
                  </span>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 max-h-36 overflow-y-auto whitespace-pre-wrap font-sans">
                  {selectedItem.description}
                </div>

                {/* Tags */}
                <div>
                  <span className="text-[11px] text-neutral-400 font-medium block mb-1.5">
                    Tags de Busca:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pinned Comment */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 mb-1">
                    <MessageSquare className="w-3 h-3 text-amber-400" />
                    Comentário Fixado Otimizado:
                  </span>
                  <p className="text-xs text-neutral-300 italic bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    "{selectedItem.pinnedComment}"
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
