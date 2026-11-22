import { useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  User,
  Video,
  X,
} from 'lucide-react';
import { formatarNomePaciente } from '@/services/painel/painelApi';
import type { SessaoHoje } from '@/types/painel/painel';

interface SessaoDetalheDrawerProps {
  sessao: SessaoHoje | null;
  modoPrivacidade: boolean;
  onFechar: () => void;
  onVerAgenda: () => void;
  onAbrirProntuario: (pacienteId: string, pacienteNome: string) => void;
}

const ROTULO_STATUS: Record<SessaoHoje['status'], string> = {
  concluida: 'Concluída',
  em_andamento: 'Em andamento',
  agendada: 'Agendada',
  cancelada: 'Cancelada',
};

export function SessaoDetalheDrawer({
  sessao,
  modoPrivacidade,
  onFechar,
  onVerAgenda,
  onAbrirProntuario,
}: SessaoDetalheDrawerProps) {
  useEffect(() => {
    if (!sessao) return;
    const lidarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFechar();
      }
    };
    window.addEventListener('keydown', lidarTecla);
    return () => window.removeEventListener('keydown', lidarTecla);
  }, [sessao, onFechar]);

  if (!sessao) return null;

  const nomeExibido = formatarNomePaciente(
    sessao.pacienteNome,
    modoPrivacidade,
  );
  const prontuarioHabilitado =
    sessao.status === 'concluida' || sessao.status === 'em_andamento';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-detalhe-sessao"
    >
      <div
        className="fixed inset-0 bg-[#1D2C20]/35 backdrop-blur-[1px]"
        onClick={onFechar}
      />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#E6ECE2] bg-[#FAF6F2] shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E6ECE2] bg-white px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-[#556650] uppercase">
              Resumo do atendimento
            </p>
            <h2
              id="titulo-detalhe-sessao"
              className="mt-1 text-lg font-semibold text-[#1D2C20]"
            >
              {nomeExibido}
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E6ECE2] text-[#556650] transition-colors hover:bg-[#E6ECE2]/60 hover:text-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            aria-label="Fechar detalhes da sessão"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="rounded-xl border border-[#E6ECE2] bg-white p-5">
            <dl className="divide-y divide-[#E6ECE2]/80 text-sm">
              <div className="flex items-center justify-between py-3 first:pt-0">
                <dt className="flex items-center gap-2 text-[#556650]">
                  <Clock className="h-4 w-4 text-[#7F8F7A]" strokeWidth={1.75} />
                  Horário e duração
                </dt>
                <dd className="font-mono font-medium text-[#1D2C20] tabular-nums">
                  {sessao.horario} ({sessao.duracaoMinutos} min)
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-[#556650]">
                  <User className="h-4 w-4 text-[#7F8F7A]" strokeWidth={1.75} />
                  Atendimento
                </dt>
                <dd className="font-medium text-[#1D2C20]">
                  {sessao.tipoAtendimento}
                </dd>
              </div>

              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-[#556650]">
                  {sessao.modalidade === 'presencial' ? (
                    <MapPin className="h-4 w-4 text-[#7F8F7A]" strokeWidth={1.75} />
                  ) : (
                    <Video className="h-4 w-4 text-[#7F8F7A]" strokeWidth={1.75} />
                  )}
                  Modalidade
                </dt>
                <dd className="font-medium text-[#1D2C20]">
                  {sessao.modalidade === 'presencial' ? 'Presencial' : 'Online'}
                </dd>
              </div>

              <div className="flex items-center justify-between py-3 last:pb-0">
                <dt className="text-[#556650]">Situação atual</dt>
                <dd className="font-medium text-[#1D2C20]">
                  {ROTULO_STATUS[sessao.status]}
                </dd>
              </div>
            </dl>
          </div>

          <p className="text-xs leading-relaxed text-[#556650]">
            {prontuarioHabilitado
              ? 'Esta sessão permite consultar o histórico clínico ou registrar evolução diretamente no prontuário do paciente.'
              : 'O registro de evolução clínica é habilitado após a conclusão da consulta na tela de Agenda e consultas.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E6ECE2] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onFechar}
            className="rounded-lg border border-[#E6ECE2] bg-white px-3.5 py-2 text-sm font-medium text-[#1D2C20] transition-colors hover:bg-[#FAF6F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={() => {
              onFechar();
              onVerAgenda();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-[#ACBFA9] bg-[#FAF6F2] px-3.5 py-2 text-sm font-medium whitespace-nowrap text-[#1D2C20] transition-colors hover:bg-[#E6ECE2]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <CalendarDays className="h-4 w-4 text-[#334936]" strokeWidth={1.75} aria-hidden="true" />
            <span>Ir para agenda</span>
          </button>

          {prontuarioHabilitado && (
            <button
              type="button"
              onClick={() => {
                onFechar();
                onAbrirProntuario(sessao.pacienteId, nomeExibido);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2 text-sm font-medium whitespace-nowrap text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            >
              <FileText className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Abrir prontuário</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
