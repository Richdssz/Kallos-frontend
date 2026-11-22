import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarOff,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  MapPin,
  RotateCw,
  Video,
  XCircle,
} from 'lucide-react';
import { formatarNomePaciente } from '@/services/painel/painelApi';
import type {
  FiltroSessoesHoje,
  SessaoHoje,
  StatusSessao,
} from '@/types/painel/painel';

interface AtendimentosHojeCardProps {
  sessoes?: SessaoHoje[];
  carregando: boolean;
  erro?: boolean;
  modoPrivacidade: boolean;
  onTentarNovamente?: () => void;
  onVerAgenda: () => void;
  onSelecionarSessao: (sessao: SessaoHoje) => void;
  sessaoSelecionadaId?: string;
}

const CONFIG_STATUS: Record<
  StatusSessao,
  {
    rotulo: string;
    classe: string;
    icone: typeof CheckCircle2;
  }
> = {
  concluida: {
    rotulo: 'Concluída',
    classe: 'bg-[#E6ECE2] text-[#1D2C20] border border-[#ACBFA9]/60',
    icone: CheckCircle2,
  },
  em_andamento: {
    rotulo: 'Em andamento',
    classe: 'bg-[#334936] text-[#FAF6F2] border border-[#334936]',
    icone: Clock3,
  },
  agendada: {
    rotulo: 'Agendada',
    classe: 'bg-[#FAF6F2] text-[#334936] border border-[#ACBFA9]',
    icone: CalendarClock,
  },
  cancelada: {
    rotulo: 'Cancelada',
    classe: 'bg-[#FDF2F2] text-[#8E2A2A] border border-[#F3C8C8]',
    icone: XCircle,
  },
};

export function AtendimentosHojeCard({
  sessoes,
  carregando,
  erro = false,
  modoPrivacidade,
  onTentarNovamente,
  onVerAgenda,
  onSelecionarSessao,
  sessaoSelecionadaId,
}: AtendimentosHojeCardProps) {
  const [filtro, setFiltro] = useState<FiltroSessoesHoje>('todas');

  if (erro && !carregando) {
    return (
      <section
        role="alert"
        aria-label="Erro nos atendimentos de hoje"
        className="flex flex-col items-center justify-center rounded-xl border border-[#F3C8C8] bg-white px-6 py-14 text-center"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF2F2] text-[#8E2A2A]">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-[#1D2C20]">
          Não foi possível carregar os atendimentos de hoje
        </h2>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#556650]">
          Verifique sua conexão e tente atualizar esta lista novamente.
        </p>
        {onTentarNovamente && (
          <button
            type="button"
            onClick={onTentarNovamente}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#334936] px-4 py-2 text-xs font-medium text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Tentar novamente</span>
          </button>
        )}
      </section>
    );
  }

  if (carregando || !sessoes) {
    return (
      <section
        aria-label="Carregando atendimentos de hoje"
        aria-busy="true"
        className="flex flex-col rounded-xl border border-[#E6ECE2] bg-white"
      >
        <div className="flex items-center justify-between border-b border-[#E6ECE2] px-6 py-5">
          <div className="space-y-2">
            <div className="h-5 w-44 animate-pulse rounded bg-[#E6ECE2]" />
            <div className="h-3.5 w-60 animate-pulse rounded bg-[#E6ECE2]/75" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-[#E6ECE2]" />
        </div>

        <div className="divide-y divide-[#E6ECE2]/80 px-6 py-2">
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 items-center gap-4 py-3.5"
            >
              <div className="col-span-2 h-4 w-12 animate-pulse rounded bg-[#E6ECE2]" />
              <div className="col-span-5 space-y-1.5">
                <div className="h-4 w-40 animate-pulse rounded bg-[#E6ECE2]" />
                <div className="h-3 w-28 animate-pulse rounded bg-[#E6ECE2]/70" />
              </div>
              <div className="col-span-2 h-4 w-20 animate-pulse rounded bg-[#E6ECE2]/80" />
              <div className="col-span-3 flex justify-end">
                <div className="h-6 w-24 animate-pulse rounded-md bg-[#E6ECE2]" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const sessaoEmFoco =
    sessoes.find((s) => s.status === 'em_andamento') ??
    sessoes.find((s) => s.status === 'agendada') ??
    null;

  const contagemProximas = sessoes.filter(
    (s) => s.status === 'em_andamento' || s.status === 'agendada',
  ).length;
  const contagemConcluidas = sessoes.filter(
    (s) => s.status === 'concluida',
  ).length;

  const sessoesFiltradas = sessoes.filter((s) => {
    if (filtro === 'proximas') {
      return s.status === 'em_andamento' || s.status === 'agendada';
    }
    if (filtro === 'concluidas') {
      return s.status === 'concluida';
    }
    return true;
  });

  return (
    <section
      aria-label="Atendimentos de hoje"
      className="flex flex-col rounded-xl border border-[#E6ECE2] bg-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6ECE2] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1D2C20]">
            Atendimentos de hoje
          </h2>
          <p className="mt-0.5 text-xs text-[#556650] tabular-nums">
            {sessoes.length === 0
              ? 'Nenhuma sessão programada para esta data'
              : `${sessoes.length} sessões na agenda do dia`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sessoes.length > 0 && (
            <div
              className="flex items-center gap-1 rounded-lg bg-[#FAF6F2] p-1"
              role="group"
              aria-label="Filtrar atendimentos de hoje"
            >
              {(
                [
                  { id: 'todas', rotulo: `Todas (${sessoes.length})` },
                  { id: 'proximas', rotulo: `Próximas (${contagemProximas})` },
                  {
                    id: 'concluidas',
                    rotulo: `Concluídas (${contagemConcluidas})`,
                  },
                ] as { id: FiltroSessoesHoje; rotulo: string }[]
              ).map((aba) => {
                const ativa = filtro === aba.id;
                return (
                  <button
                    key={aba.id}
                    type="button"
                    onClick={() => setFiltro(aba.id)}
                    aria-pressed={ativa}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
                      ativa
                        ? 'bg-white text-[#1D2C20] shadow-xs'
                        : 'text-[#556650] hover:text-[#1D2C20]'
                    }`}
                  >
                    {aba.rotulo}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={onVerAgenda}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium whitespace-nowrap text-[#334936] transition-colors hover:bg-[#E6ECE2]/70 hover:text-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <span>Ver agenda</span>
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      {sessaoEmFoco && (
        <div className="border-b border-[#E6ECE2] bg-[#FAF6F2]/80 px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
              <span className="font-semibold text-[#334936]">
                {sessaoEmFoco.status === 'em_andamento'
                  ? 'Em atendimento agora'
                  : 'Próximo atendimento'}
              </span>
              <span aria-hidden="true" className="text-[#7F8F7A]">
                ·
              </span>
              <span className="font-mono font-semibold text-[#1D2C20] tabular-nums">
                {sessaoEmFoco.horario}
              </span>
              <span className="truncate font-medium text-[#1D2C20]">
                {formatarNomePaciente(
                  sessaoEmFoco.pacienteNome,
                  modoPrivacidade,
                )}
              </span>
              <span aria-hidden="true" className="text-[#7F8F7A]">
                ·
              </span>
              <span className="text-[#556650]">
                {sessaoEmFoco.modalidade === 'presencial'
                  ? 'Presencial'
                  : 'Online'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelecionarSessao(sessaoEmFoco)}
              className="text-xs font-medium whitespace-nowrap text-[#334936] underline-offset-2 hover:text-[#1D2C20] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            >
              Ver detalhes
            </button>
          </div>
        </div>
      )}

      {sessoes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6ECE2]/80 text-[#334936]">
            <CalendarOff className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[#1D2C20]">
            Nenhum atendimento agendado para hoje
          </h3>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#556650]">
            Sua agenda do dia está livre. Caso deseje incluir um encaixe ou
            consultar os próximos horários, acesse a agenda completa.
          </p>
          <button
            type="button"
            onClick={onVerAgenda}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <CalendarPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Abrir agenda</span>
          </button>
        </div>
      ) : sessoesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#1D2C20]">
            Nenhuma sessão neste filtro.
          </p>
          <button
            type="button"
            onClick={() => setFiltro('todas')}
            className="mt-3 rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] px-3 py-1.5 text-xs font-medium text-[#334936] transition-colors hover:bg-[#E6ECE2]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            Mostrar todas as sessões
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E6ECE2] bg-[#FAF6F2]/70">
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wide text-[#556650]"
                >
                  Horário
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-medium tracking-wide text-[#556650]"
                >
                  Paciente
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-medium tracking-wide text-[#556650]"
                >
                  Modalidade
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium tracking-wide text-[#556650]"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6ECE2]/80">
              {sessoesFiltradas.map((sessao) => {
                const statusInfo = CONFIG_STATUS[sessao.status];
                const IconeStatus = statusInfo.icone;
                const selecionada = sessaoSelecionadaId === sessao.id;
                const nomeExibido = formatarNomePaciente(
                  sessao.pacienteNome,
                  modoPrivacidade,
                );

                return (
                  <tr
                    key={sessao.id}
                    onClick={() => onSelecionarSessao(sessao)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelecionarSessao(sessao);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver detalhes da sessão de ${nomeExibido} às ${sessao.horario}`}
                    className={`cursor-pointer transition-colors duration-150 focus-visible:bg-[#E6ECE2]/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#334936] ${
                      selecionada ? 'bg-[#E6ECE2]/55' : 'hover:bg-[#FAF6F2]'
                    }`}
                  >
                    <td className="px-6 py-3.5 align-middle">
                      <span className="font-mono text-sm font-medium text-[#1D2C20] tabular-nums">
                        {sessao.horario}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1D2C20]">
                          {nomeExibido}
                        </p>
                        <p className="truncate text-xs text-[#556650]">
                          {sessao.tipoAtendimento}
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono tabular-nums">
                            {sessao.duracaoMinutos} min
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <span className="inline-flex items-center gap-1.5 text-sm text-[#556650]">
                        {sessao.modalidade === 'presencial' ? (
                          <>
                            <MapPin
                              className="h-3.5 w-3.5 shrink-0 text-[#7F8F7A]"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                            <span>Presencial</span>
                          </>
                        ) : (
                          <>
                            <Video
                              className="h-3.5 w-3.5 shrink-0 text-[#7F8F7A]"
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                            <span>Online</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusInfo.classe}`}
                      >
                        <IconeStatus
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <span>{statusInfo.rotulo}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
