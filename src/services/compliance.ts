import { VideoItem } from '../types';

export const BABY_SAFETY_NOTICE = 'Utilize em volume baixo. Este áudio não substitui orientação médica. Para crianças e bebês, mantenha o dispositivo a uma distância segura e sob supervisão constante.';
const CHILD_TERMS = /\b(bebe|bebes|crianca|criancas|infantil|neonato|recem-nascido)\b/;
const HEALTH_TERMS = /\b(cura|curar|trata|tratar|tratamento|previne|prevenir|alivia|aliviar|ansiedade|insonia|zumbido|sistema nervoso|frequencia cardiaca|sono rem)\b/;
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function appendBabySafetyNotice(description: string, relatedText: string): string {
  const normalizedText = normalize(relatedText);
  if (!CHILD_TERMS.test(normalizedText)) return description;
  if (normalize(description).includes(normalize(BABY_SAFETY_NOTICE))) return description;
  return `${description.trim()}\n\n${BABY_SAFETY_NOTICE}`;
}

export function getComplianceWarnings(item: Pick<VideoItem, 'title' | 'hook' | 'script' | 'description' | 'tags' | 'pinnedComment'>): string[] {
  const content = normalize([item.title, item.hook, item.script, item.description, item.tags.join(' '), item.pinnedComment].join('\n'));
  const warnings: string[] = [];
  if (HEALTH_TERMS.test(content)) warnings.push('Remova afirmações médicas ou fisiológicas, incluindo promessas de tratamento ou resultado.');
  if (CHILD_TERMS.test(content) && !normalize(item.description).includes(normalize(BABY_SAFETY_NOTICE))) warnings.push('Inclua o aviso de segurança obrigatório quando o conteúdo mencionar crianças ou bebês.');
  return warnings;
}

function saoPauloParts(date: Date): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}

export function getNextSaoPauloDateTime(): string {
  const [year, month, day] = saoPauloParts(new Date()).date.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return `${next.toISOString().slice(0, 10)}T21:00`;
}

export function saoPauloIsoToDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) throw new Error('Data salva inválida.');
  const parts = saoPauloParts(date);
  return `${parts.date}T${parts.time}`;
}

export function saoPauloDateTimeToIso(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Data ou horário inválido.');
  const [, year, month, day, hour, minute] = match;
  const wanted = Date.UTC(+year, +month - 1, +day, +hour, +minute);
  let utc = wanted + 3 * 3600000;
  for (let attempt = 0; attempt < 2; attempt++) {
    const parts = saoPauloParts(new Date(utc));
    const [y, m, d] = parts.date.split('-').map(Number);
    const [h, min] = parts.time.split(':').map(Number);
    utc += wanted - Date.UTC(y, m - 1, d, h, min);
  }
  const result = new Date(utc);
  const check = saoPauloParts(result);
  if (`${check.date}T${check.time}` !== value) throw new Error('Horário de Brasília inválido.');
  return result.toISOString();
}
