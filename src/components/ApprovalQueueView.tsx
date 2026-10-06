import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Edit3, FileText, Save, Send, Share2, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import { AIConfig, VideoItem } from '../types';
import { ThumbnailPreview } from './ThumbnailPreview';
import { generateContentWithAI } from '../services/api';
import { appendBabySafetyNotice, getComplianceWarnings, getNextSaoPauloDateTime, saoPauloDateTimeToIso, saoPauloIsoToDateTimeLocal } from '../services/compliance';
interface Props { items: VideoItem[]; aiConfig: AIConfig; onApprove: (id: string, note: string, plannedAt: string, approverName: string) => void; onReject: (id: string) => void; onUpdateItem: (item: VideoItem) => void; }

export const ApprovalQueueView: React.FC<Props> = ({ items, aiConfig, onApprove, onReject, onUpdateItem }) => {
  const pending = items.filter((item) => item.status === 'pending_approval');
  const [selectedId, setSelectedId] = useState(pending[0]?.id || items[0]?.id || '');
  const item = items.find((entry) => entry.id === selectedId) || pending[0] || items[0];
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [hook, setHook] = useState('');
  const [script, setScript] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [refine, setRefine] = useState('');
  const [refining, setRefining] = useState(false);
  const [schedule, setSchedule] = useState(getNextSaoPauloDateTime);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title); setHook(item.hook); setScript(item.script); setDescription(item.description); setTags(item.tags.join(', '));
    setSchedule(item.approvalRecord?.snapshot.plannedAt ? saoPauloIsoToDateTimeLocal(item.approvalRecord.snapshot.plannedAt) : item.plannedAt ? saoPauloIsoToDateTimeLocal(item.plannedAt) : getNextSaoPauloDateTime());
    setEditing(false); setFeedback(null); setConfirming(false);
  }, [selectedId]);

  if (!item) return <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-10 text-center text-neutral-300"><ShieldCheck className="mx-auto mb-3 h-8 w-8 text-emerald-400" /><h2 className="font-bold text-white">Fila vazia</h2><p className="mt-2 text-sm">Crie um rascunho para revisar. Upload e agendamento não estão disponíveis nesta versão.</p></section>;
  const warnings = getComplianceWarnings(item);
  const approved = Boolean(item.approvedByUser && item.approvalRecord);

  const saveDraft = () => {
    onUpdateItem({ ...item, isDemo: false, title: title.trim(), hook: hook.trim(), script: script.trim(), description: appendBabySafetyNotice(description, `${item.niche} ${title} ${hook} ${script} ${description}`), tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean) });
    setEditing(false); setFeedback({ type: 'success', text: 'Rascunho salvo. Alterações em material aprovado exigem nova aprovação.' });
  };
  const changePlannedTime = (value: string) => {
    if (approved && value !== schedule) {
      const confirmed = window.confirm('Alterar este horário invalida a aprovação anterior. Deseja continuar?');
      if (!confirmed) return;
    }
    setSchedule(value);
    if (!approved || !value) return;
    try { onUpdateItem({ ...item, plannedAt: saoPauloDateTimeToIso(value) }); setFeedback({ type: 'info', text: 'Horário alterado. A aprovação anterior foi invalidada.' }); }
    catch { setFeedback({ type: 'error', text: 'Horário de Brasília inválido.' }); }
  };
  const refineWithAI = async () => {
    if (!refine.trim()) return;
    setRefining(true); setFeedback(null);
    try {
      const prompt = `Revise o texto do Loop Sonoro. Mantenha fidelidade ao áudio, não invente arquivo/direitos/dados/duração, não faça alegações médicas. Se houver menção a bebês/crianças, use linguagem neutra e inclua o aviso literal de segurança.\nTítulo: ${item.title}\nGancho: ${item.hook}\nRoteiro: ${item.script}\nDescrição: ${item.description}\nPedido: ${refine}`;
      const result = await generateContentWithAI(prompt, aiConfig, 'Editor Loop Sonoro. Linguagem factual e sem alegações médicas.');
      const updatedDescription = appendBabySafetyNotice(item.description, `${item.niche} ${item.title} ${item.hook} ${result.text}`);
      onUpdateItem({ ...item, script: result.text, description: updatedDescription, approverNote: 'Proposta IA, aguardando revisão.' });
      setScript(result.text);
      setDescription(updatedDescription); setRefine(''); setFeedback({ type: 'success', text: 'Proposta gerada, ainda não aprovada.' });
    } catch (error: any) { setFeedback({ type: 'error', text: error.message || 'Falha ao gerar proposta.' }); }
    finally { setRefining(false); }
  };
  const approve = () => {
    if (editing || !schedule || warnings.length || item.isDemo || item.status !== 'pending_approval') return;
    const approver = window.prompt('Nome para o registro local. Esta tela não autentica sua identidade.', 'Roberto Andrade Dias');
    if (!approver?.trim()) return;
    try { onApprove(item.id, 'Aprovação explícita desta versão, registro local; não publica nem agenda.', saoPauloDateTimeToIso(schedule), approver.trim()); setFeedback({ type: 'success', text: 'Aprovação registrada localmente. Nada foi enviado, agendado ou publicado.' }); setConfirming(false); }
    catch (error: any) { setFeedback({ type: 'error', text: error.message || 'Data ou horário de Brasília inválido.' }); }
  };

  return <div className="space-y-5">
    {feedback && <div role="status" className={`rounded-xl border p-3 text-sm ${feedback.type === 'success' ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-100' : feedback.type === 'info' ? 'border-sky-500/40 bg-sky-950/40 text-sky-100' : 'border-red-500/40 bg-red-950/40 text-red-100'}`}><div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{feedback.text}</div></div>}
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4"><h2 className="flex items-center gap-2 text-sm font-bold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" />Aprovação humana obrigatória</h2><p className="mt-2 text-xs text-neutral-300">A aprovação registra o conteúdo exato localmente, sem publicar ou agendar. Alterações em metadados, roteiro, thumbnail ou horário exigem nova aprovação.</p></section>
    {item.isDemo && <div className="rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs text-amber-100">DEMONSTRAÇÃO. Não representa áudio, direitos autorais ou aprovação real. Edite e salve para criar um rascunho próprio.</div>}
    {warnings.length > 0 && <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-100"><strong>Aprovação bloqueada:</strong>{warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div>}
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <aside className="space-y-2 lg:col-span-4"><h3 className="flex items-center gap-2 text-sm font-bold text-white"><Clock className="h-4 w-4 text-amber-400" />Fila ({pending.length})</h3>{pending.map((entry) => <button key={entry.id} onClick={() => setSelectedId(entry.id)} className={`w-full rounded-xl border p-3 text-left text-xs ${entry.id === item.id ? 'border-emerald-500 bg-neutral-800' : 'border-neutral-800 bg-neutral-900'}`}><span className="text-amber-300">Aguardando aprovação</span><div className="mt-1 font-semibold text-white">{entry.title}</div><div className="mt-1 text-neutral-400">{entry.format === 'short' ? 'Short' : 'Vídeo longo'} · {entry.estimatedDuration}</div></button>)}{items.filter((entry) => entry.status === 'approved').map((entry) => <button key={entry.id} onClick={() => setSelectedId(entry.id)} className="w-full rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-3 text-left text-xs text-emerald-200">Aprovado localmente, não publicado<br /><strong>{entry.title}</strong></button>)}{items.filter((entry) => entry.status === 'rejected').map((entry) => <div key={entry.id} className="rounded-xl border border-neutral-800 p-3 text-xs text-neutral-400">Rejeitado e arquivado localmente<br />{entry.title}</div>)}</aside>
      <section className="space-y-4 lg:col-span-8">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4"><div><span className="text-xs text-neutral-400">{item.format === 'short' ? 'Short' : 'Vídeo longo'} · {item.aiModelUsed}</span><h2 className="mt-1 font-bold text-white">Revisão de conteúdo</h2></div><div className="flex flex-wrap items-end gap-2"><label className="text-[10px] text-neutral-400">Horário planejado, Brasília<input type="datetime-local" value={schedule} onChange={(event) => changePlannedTime(event.target.value)} className="mt-1 block rounded border border-neutral-700 bg-neutral-950 p-2 text-xs text-white" /></label><button onClick={() => onReject(item.id)} className="rounded-lg bg-neutral-800 px-3 py-2 text-xs text-white"><XCircle className="mr-1 inline h-4 w-4 text-red-400" />Rejeitar e arquivar</button><button disabled={editing || item.isDemo || warnings.length > 0 || item.status !== 'pending_approval'} onClick={() => setConfirming(true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"><CheckCircle2 className="mr-1 inline h-4 w-4" />Registrar aprovação</button><button disabled title="OAuth 2.0 e upload real não implementados" onClick={() => setFeedback({ type: 'info', text: 'Upload indisponível. Nenhum vídeo foi enviado.' })} className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-neutral-400 disabled:opacity-70"><Send className="mr-1 inline h-4 w-4" />Upload indisponível</button></div></div>
        {confirming && <div role="alertdialog" aria-modal="true" className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 text-sm text-amber-100"><strong>Confirme esta versão</strong><p>{item.title}. O registro é local; não publica nem agenda. Data/hora de Brasília: {schedule}.</p><p className="text-xs">O nome é declarado pelo usuário do navegador, sem autenticação de identidade.</p><button onClick={approve} className="rounded bg-emerald-600 px-3 py-2 text-white">Confirmar</button><button onClick={() => setConfirming(false)} className="ml-2 rounded bg-neutral-800 px-3 py-2">Voltar</button></div>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"><label className="text-xs font-semibold text-neutral-300">Título{editing ? <input aria-label="Título" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-sm text-white" /> : <p className="mt-2 text-sm text-white">{item.title}</p>}</label>{item.titleVariants?.map((variant, index) => <button key={index} onClick={() => { setTitle(variant); setEditing(true); }} className="block w-full text-left text-xs text-sky-300">Variação {index + 1}: {variant}</button>)}<label className="block text-xs font-semibold text-neutral-300">Gancho{editing ? <textarea aria-label="Gancho" value={hook} onChange={(event) => setHook(event.target.value)} className="mt-2 w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-sm text-white" /> : <p className="mt-2 text-sm text-neutral-200">{item.hook}</p>}</label><label className="block text-xs font-semibold text-neutral-300">Roteiro{editing ? <textarea aria-label="Roteiro" value={script} onChange={(event) => setScript(event.target.value)} className="mt-2 w-full min-h-40 rounded border border-neutral-700 bg-neutral-950 p-2 text-xs text-white" /> : <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-neutral-300">{item.script}</pre>}</label></div>
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"><label className="block text-xs font-semibold text-neutral-300">Descrição{editing ? <textarea aria-label="Descrição" value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full min-h-40 rounded border border-neutral-700 bg-neutral-950 p-2 text-xs text-white" /> : <p className="mt-2 whitespace-pre-wrap text-xs text-neutral-300">{item.description}</p>}</label>{editing && <label className="block text-xs text-neutral-300">Tags<input value={tags} onChange={(event) => setTags(event.target.value)} className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-xs text-white" /></label>}<div><p className="text-xs font-semibold text-neutral-300">Conceito de thumbnail</p><p className="mt-1 text-xs text-neutral-400">{item.thumbnailPrompt}</p><ThumbnailPreview item={item} isInteractive={false} /><p className="text-[10px] text-neutral-500">Prévia gráfica demonstrativa, não é o arquivo final de thumbnail.</p></div>{editing && <button onClick={saveDraft} className="rounded-lg bg-sky-600 px-3 py-2 text-xs text-white"><Save className="mr-1 inline h-4 w-4" />Salvar rascunho, exige nova aprovação</button>}</div></div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"><h3 className="flex items-center gap-2 text-xs font-bold text-white"><Sparkles className="h-4 w-4 text-amber-400" />Proposta de revisão com IA</h3><textarea value={refine} onChange={(event) => setRefine(event.target.value)} placeholder="Descreva o ajuste" className="mt-2 min-h-16 w-full rounded border border-neutral-700 bg-neutral-950 p-2 text-xs text-white" /><button disabled={refining || !refine.trim()} onClick={refineWithAI} className="mt-2 rounded-lg bg-amber-600 px-3 py-2 text-xs text-white disabled:opacity-50">{refining ? 'Gerando...' : 'Gerar proposta'}</button></div>
        {approved && item.approvalRecord && <div className="rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-3 text-xs text-emerald-100">Aprovação local, versão {item.approvalRecord.version}, aprovada por {item.approvalRecord.approverName} em {new Date(item.approvalRecord.approvedAt).toLocaleString('pt-BR')}. Não publicada nem agendada.</div>}
      </section>
    </div>
  </div>;
};
