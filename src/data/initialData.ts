import { VideoItem } from '../types';

// Editable examples only: no file, license, real approval, upload, or performance data is implied.
export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-sleep-101', title: 'Som contínuo de chuva suave | 8 horas, tela escura',
    titleVariants: ['Som contínuo de chuva suave | 8 horas, tela escura', 'Chuva na janela à noite | som ambiente contínuo', 'Chuva e trovões distantes | ambiente sonoro noturno'],
    format: 'video', niche: 'Natureza e ambiente global', hook: 'Som ambiente contínuo de chuva suave com trovões distantes.',
    script: '[EXEMPLO DE ROTEIRO]\n[00:00] Fade-in gradual da chuva.\n[00:20] Som ambiente contínuo, sem narração.\n[ENCERRAMENTO] Fade-out gradual, se apropriado ao arquivo final.\n\nA gravação e a edição ainda precisam ser fornecidas e verificadas.',
    estimatedDuration: '8 horas, duração planejada',
    description: 'Rascunho de descrição para um som ambiente contínuo de chuva suave. A duração, a gravação, a edição e os direitos de uso precisam ser confirmados antes do envio.\n\nAjuste o volume para um nível confortável. Este material é um exemplo, não representa um arquivo de áudio existente.',
    tags: ['som ambiente', 'chuva', 'natureza', 'tela escura'], pinnedComment: 'Rascunho: qual som ambiente você gostaria de ouvir no canal?',
    thumbnailPrompt: 'Conceito de thumbnail: gotas de chuva numa janela à noite, composição escura e simples.', thumbnailOverlayText: 'CHUVA, 8H', thumbnailColor: '#1e293b',
    status: 'pending_approval', approvedByUser: false, isDemo: true, appealQuality: 'A testar', createdAt: '2026-10-04T18:00:00Z', aiProviderUsed: 'exemplo', aiModelUsed: 'dados demonstrativos',
  },
  {
    id: 'vid-sleep-102', title: 'Ruído marrom contínuo | demonstração de Short',
    titleVariants: ['Ruído marrom contínuo | demonstração de Short', 'Uma amostra de ruído marrom', 'Som grave contínuo, exemplo curto'],
    format: 'short', niche: 'Ruído branco, rosa e marrom', hook: 'Uma amostra curta de ruído marrom contínuo.',
    script: '[EXEMPLO DE SHORT]\n[00:00] Apresentar o som diretamente.\n[00:03-00:18] Tocar uma amostra original licenciada, após conferência.\n[00:18] Convidar a conhecer a versão completa, se existir.\n\nO arquivo sonoro precisa ser fornecido e conferido.',
    estimatedDuration: '18 segundos, duração planejada',
    description: 'Exemplo de metadados para uma amostra curta de ruído marrom. O som e a versão completa precisam existir, ser originais ou licenciados e passar por revisão antes do uso.',
    tags: ['ruído marrom', 'som ambiente', 'shorts'], pinnedComment: 'Rascunho: que outro som contínuo você gostaria de ouvir?',
    thumbnailPrompt: 'Conceito visual vertical abstrato, formas suaves e escuras que representem um som contínuo.', thumbnailOverlayText: 'RUÍDO MARROM', thumbnailColor: '#334155',
    status: 'pending_approval', approvedByUser: false, isDemo: true, appealQuality: 'A testar', createdAt: '2026-10-04T12:00:00Z', aiProviderUsed: 'exemplo', aiModelUsed: 'dados demonstrativos',
  },
  {
    id: 'vid-sleep-103', title: 'Ondas do mar à noite | som ambiente contínuo',
    titleVariants: ['Ondas do mar à noite | som ambiente contínuo', 'Som do oceano à noite | ambiente sonoro', 'Ondas suaves na praia | exemplo de vídeo longo'],
    format: 'video', niche: 'Natureza e ambiente global', hook: 'Som ambiente contínuo de ondas suaves na praia à noite.',
    script: '[EXEMPLO DE ROTEIRO]\n[00:00] Fade-in gradual das ondas.\n[00:20] Som contínuo sem narração.\n[ENCERRAMENTO] Fade-out gradual, se apropriado ao arquivo final.\n\nGravação, duração final e edição ainda não foram fornecidas nem verificadas.',
    estimatedDuration: '4 horas, duração planejada',
    description: 'Exemplo de descrição para um som ambiente de ondas do mar. Confirme o arquivo, a duração, a gravação e os direitos de uso antes de produzir ou publicar.',
    tags: ['ondas do mar', 'som ambiente', 'natureza', 'oceano'], pinnedComment: 'Rascunho: qual ambiente sonoro combina com sua rotina?',
    thumbnailPrompt: 'Conceito visual de praia noturna com ondas suaves e paleta azul escura.', thumbnailOverlayText: 'MAR, 4H', thumbnailColor: '#0f172a',
    status: 'pending_approval', approvedByUser: false, isDemo: true, appealQuality: 'A testar', createdAt: '2026-10-03T14:00:00Z', aiProviderUsed: 'exemplo', aiModelUsed: 'dados demonstrativos',
  },
];
