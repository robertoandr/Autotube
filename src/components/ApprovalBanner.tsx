import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Lock } from 'lucide-react';

interface ApprovalBannerProps {
  approvalMode: boolean;
  onToggleApprovalMode: () => void;
  pendingCount: number;
  onGoToApprovals: () => void;
}

export const ApprovalBanner: React.FC<ApprovalBannerProps> = ({
  approvalMode,
  onToggleApprovalMode,
  pendingCount,
  onGoToApprovals,
}) => {
  return (
    <div className="mb-6">
      {approvalMode ? (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Tempo de Teste &bull; Modo de Aprovação Ativo
                  </h2>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                    Trava de Segurança Ligada
                  </span>
                </div>
                <p className="text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  <span className="font-semibold text-emerald-300">Nada sobe sem você dizer sim.</span> O robô gera roteiros, ganchos de 3 segundos, tags e thumbnails, mas deixa tudo na fila de revisão humana para você validar a qualidade antes da postagem no YouTube.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
              {pendingCount > 0 ? (
                <button
                  onClick={onGoToApprovals}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-950/50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Revisar {pendingCount} {pendingCount === 1 ? 'Roteiro' : 'Roteiros'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900/90 border border-neutral-800 px-3 py-2 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fila sem pendências</span>
                </div>
              )}

              <button
                onClick={onToggleApprovalMode}
                className="text-xs text-neutral-400 hover:text-neutral-200 underline underline-offset-4 px-2 py-1"
                title="Desligar requer confiança no resultado"
              >
                Desativar Trava
              </button>
            </div>

          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-950 p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Modo 100% Autônomo (Aprovação Desligada)
                  </h2>
                  <span className="text-xs font-medium text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                    Atenção
                  </span>
                </div>
                <p className="text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
                  Os roteiros e vídeos gerados serão agendados e publicados diretamente no canal via YouTube Data API sem intervenção manual.
                </p>
              </div>
            </div>

            <button
              onClick={onToggleApprovalMode}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors self-start md:self-center shrink-0 shadow-lg shadow-emerald-950/40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Reativar Modo de Aprovação (Recomendado)</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
};
