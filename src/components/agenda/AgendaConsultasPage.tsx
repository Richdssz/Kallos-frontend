"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useFeriadosAno, useSessoesSemana } from "@/hooks/agenda/useAgenda";
import { usePacientes } from "@/hooks/pacientes/usePacientes";
import type {
  FeriadoDTO,
  SessaoResponseDTO,
  StatusSessao,
} from "@/types/agenda/sessao";
import {
  avancarSemana,
  formatarDataISO,
  formatarIntervaloSemana,
  obterDiasUteisSemana,
  obterNumeroSemanaISO,
  obterSegundaDaSemana,
  parseDataISO,
} from "@/utils/agendaDatas";
import { GradeSemanal } from "./GradeSemanal";
import { ModalSessaoForm } from "./ModalSessaoForm";

const OPCOES_STATUS: { valor: "Todos" | StatusSessao; rotulo: string }[] = [
  { valor: "Todos", rotulo: "Todos os status" },
  { valor: "Agendada", rotulo: "Agendada" },
  { valor: "EmAndamento", rotulo: "Em andamento" },
  { valor: "Concluida", rotulo: "Concluída" },
  { valor: "Cancelada", rotulo: "Cancelada" },
];

export function AgendaConsultasPage() {
  const [segundaAtual, setSegundaAtual] = useState<Date>(() =>
    obterSegundaDaSemana(new Date())
  );
  const [filtroPacienteId, setFiltroPacienteId] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | StatusSessao>(
    "Todos"
  );

  const [modalAberto, setModalAberto] = useState(false);
  const [sessaoEmEdicao, setSessaoEmEdicao] =
    useState<SessaoResponseDTO | null>(null);
  const [dataInicialModal, setDataInicialModal] = useState<string | undefined>(
    undefined
  );
  const [horarioInicialModal, setHorarioInicialModal] = useState<
    string | undefined
  >(undefined);

  const diasSemana = useMemo(
    () => obterDiasUteisSemana(segundaAtual),
    [segundaAtual]
  );

  const inicioSemana = diasSemana[0].iso;
  const fimSemana = diasSemana[4].iso;
  const numeroSemana = useMemo(
    () => obterNumeroSemanaISO(segundaAtual),
    [segundaAtual]
  );
  const intervaloSemana = useMemo(
    () => formatarIntervaloSemana(segundaAtual),
    [segundaAtual]
  );

  const anoInicio = Number(inicioSemana.slice(0, 4));
  const anoFim = Number(fimSemana.slice(0, 4));
  const feriadosInicio = useFeriadosAno(anoInicio);
  const feriadosFim = useFeriadosAno(anoFim);

  const feriadosPorData = useMemo(() => {
    const mapa = new Map<string, FeriadoDTO>();
    (feriadosInicio.data ?? []).forEach((f) => mapa.set(f.date, f));
    if (anoFim !== anoInicio) {
      (feriadosFim.data ?? []).forEach((f) => mapa.set(f.date, f));
    }
    return mapa;
  }, [feriadosInicio.data, feriadosFim.data, anoInicio, anoFim]);

  const consultaPacientes = usePacientes({
    status: "Todos",
    page: 0,
    size: 100,
  });

  const consultaSessoes = useSessoesSemana({
    inicioSemana,
    fimSemana,
    pacienteId: filtroPacienteId || undefined,
    status: filtroStatus,
  });

  const sessoes = consultaSessoes.data ?? [];
  const temFiltrosAtivos =
    Boolean(filtroPacienteId) || filtroStatus !== "Todos";
  const carregandoInicial = consultaSessoes.isPending;

  const resumoSemana = useMemo(() => {
    let agendadas = 0;
    let concluidas = 0;
    let pendentesPagamento = 0;
    sessoes.forEach((s) => {
      if (s.status === "Agendada" || s.status === "EmAndamento") agendadas += 1;
      if (s.status === "Concluida") concluidas += 1;
      if (s.status !== "Cancelada" && s.statusPagamento === "Pendente") {
        pendentesPagamento += 1;
      }
    });
    return { agendadas, concluidas, pendentesPagamento };
  }, [sessoes]);

  const dataPadraoParaAgendar = useMemo(() => {
    const hojeNaSemana = diasSemana.find((d) => d.ehHoje);
    return hojeNaSemana ? hojeNaSemana.iso : inicioSemana;
  }, [diasSemana, inicioSemana]);

  const abrirModalNovo = (data?: string, horario?: string) => {
    setSessaoEmEdicao(null);
    setDataInicialModal(data ?? dataPadraoParaAgendar);
    setHorarioInicialModal(horario ?? "09:00");
    setModalAberto(true);
  };

  const abrirModalEdicao = (sessao: SessaoResponseDTO) => {
    setSessaoEmEdicao(sessao);
    setDataInicialModal(undefined);
    setHorarioInicialModal(undefined);
    setModalAberto(true);
  };

  const limparFiltros = () => {
    setFiltroPacienteId("");
    setFiltroStatus("Todos");
  };

  const irParaHoje = () => {
    setSegundaAtual(obterSegundaDaSemana(new Date()));
  };

  const lidarSessaoSalva = (sessaoSalva: SessaoResponseDTO) => {
    if (sessaoSalva.data < inicioSemana || sessaoSalva.data > fimSemana) {
      setSegundaAtual(obterSegundaDaSemana(parseDataISO(sessaoSalva.data)));
    }
  };

  const ehSemanaAtual =
    formatarDataISO(obterSegundaDaSemana(new Date())) === inicioSemana;

  return (
    <>
      <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wider text-[#556650] uppercase">
              Consultório · Agenda semanal
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1D2C20] sm:text-3xl">
              Agenda e Consultas
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#556650]">
              <span>Segunda a sexta-feira · gestão de sessões</span>
              {!carregandoInicial && !consultaSessoes.isError && (
                <>
                  <span aria-hidden="true" className="text-[#ACBFA9]">
                    ·
                  </span>
                  <span className="font-mono text-xs text-[#334936] tabular-nums">
                    {resumoSemana.agendadas}{" "}
                    {resumoSemana.agendadas === 1 ? "agendada" : "agendadas"} ·{" "}
                    {resumoSemana.concluidas}{" "}
                    {resumoSemana.concluidas === 1 ? "concluída" : "concluídas"}
                    {resumoSemana.pendentesPagamento > 0
                      ? ` · ${resumoSemana.pendentesPagamento} pgto pendente`
                      : ""}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => abrirModalNovo()}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#334936] px-4 text-sm font-medium whitespace-nowrap text-[#FAF6F2] transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[#1D2C20] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            <span>Agendar sessão</span>
          </button>
        </div>

        {/* Barra unificada: Navegação Semanal + Filtros Combinados */}
        <section
          aria-label="Navegação semanal e filtros da agenda"
          className="rounded-xl border border-[#E6ECE2] bg-white px-4 py-3.5 sm:px-5"
        >
          <div className="flex flex-col gap-3.5 xl:flex-row xl:items-center xl:justify-between">
            {/* Navegação de semanas */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className="inline-flex items-center rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] p-0.5"
                role="group"
                aria-label="Navegar entre semanas"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSegundaAtual((prev) => avancarSemana(prev, -1))
                  }
                  aria-label="Semana anterior"
                  title="Semana anterior"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#1D2C20] transition-colors hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>

                <button
                  type="button"
                  onClick={irParaHoje}
                  aria-pressed={ehSemanaAtual}
                  className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
                    ehSemanaAtual
                      ? "bg-[#334936] text-[#FAF6F2]"
                      : "text-[#1D2C20] hover:bg-white"
                  }`}
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSegundaAtual((prev) => avancarSemana(prev, 1))
                  }
                  aria-label="Próxima semana"
                  title="Próxima semana"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#1D2C20] transition-colors hover:bg-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D2C20]">
                  <CalendarDays
                    className="h-4 w-4 text-[#334936]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span>{intervaloSemana}</span>
                </span>
                <span className="rounded-md border border-[#E6ECE2] bg-[#FAF6F2] px-2 py-0.5 font-mono text-xs font-medium text-[#334936] tabular-nums">
                  Semana {String(numeroSemana).padStart(2, "0")}
                </span>
                {consultaSessoes.isFetching && !carregandoInicial && (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin text-[#556650]"
                    aria-label="Atualizando agenda"
                  />
                )}
              </div>
            </div>

            {/* Filtros combinados por paciente e status */}
            <div className="flex flex-col gap-2.5 border-t border-[#E6ECE2] pt-3 sm:flex-row sm:items-center xl:border-t-0 xl:border-l xl:pt-0 xl:pl-4">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:flex-none">
                <select
                  id="filtro-paciente-agenda"
                  aria-label="Filtrar por paciente"
                  value={filtroPacienteId}
                  onChange={(e) => setFiltroPacienteId(e.target.value)}
                  className="h-9 rounded-lg border border-[#E6ECE2] bg-[#FAF6F2]/60 px-3 text-xs font-medium text-[#1D2C20] transition-colors hover:border-[#ACBFA9] focus:border-[#334936] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ACBFA9]/40 sm:w-48"
                >
                  <option value="">Todos os pacientes</option>
                  {(consultaPacientes.data?.content ?? []).map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>

                <select
                  id="filtro-status-agenda"
                  aria-label="Filtrar por status"
                  value={filtroStatus}
                  onChange={(e) =>
                    setFiltroStatus(e.target.value as "Todos" | StatusSessao)
                  }
                  className="h-9 rounded-lg border border-[#E6ECE2] bg-[#FAF6F2]/60 px-3 text-xs font-medium text-[#1D2C20] transition-colors hover:border-[#ACBFA9] focus:border-[#334936] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ACBFA9]/40 sm:w-40"
                >
                  {OPCOES_STATUS.map((op) => (
                    <option key={op.valor} value={op.valor}>
                      {op.rotulo}
                    </option>
                  ))}
                </select>
              </div>

              {temFiltrosAtivos && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E6ECE2] bg-white px-3 text-xs font-medium whitespace-nowrap text-[#334936] transition-all duration-150 hover:border-[#ACBFA9] hover:bg-[#FAF6F2] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Limpar filtros</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Estado de Erro | Estado Vazio | Grade Semanal */}
        {consultaSessoes.isError && !carregandoInicial ? (
          <section
            role="alert"
            className="flex flex-col items-center justify-center rounded-xl border border-[#F3C8C8] bg-white px-6 py-12 text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDECEC] text-[#8E2A2A]">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-[#1D2C20]">
              Não foi possível carregar a agenda desta semana
            </h2>
            <p className="mt-1 max-w-md text-sm text-[#556650]">
              {consultaSessoes.error instanceof Error
                ? consultaSessoes.error.message
                : "Verifique sua conexão e tente novamente."}
            </p>
            <button
              type="button"
              onClick={() => consultaSessoes.refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2 text-sm font-medium text-[#FAF6F2] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#1D2C20] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              <span>Tentar novamente</span>
            </button>
          </section>
        ) : !carregandoInicial && sessoes.length === 0 ? (
          <section
            aria-label="Agenda sem resultados"
            className="flex flex-col items-center justify-center rounded-xl border border-[#E6ECE2] bg-white px-6 py-14 text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6ECE2]/80 text-[#334936]">
              <CalendarDays className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </div>

            {temFiltrosAtivos ? (
              <>
                <h2 className="mt-4 text-base font-semibold text-[#1D2C20]">
                  Nenhuma consulta encontrada para os filtros aplicados
                </h2>
                <p className="mt-1 max-w-md text-sm text-[#556650]">
                  Não há atendimentos compatíveis no período de{" "}
                  <strong className="text-[#1D2C20]">{intervaloSemana}</strong>.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ACBFA9] bg-[#FAF6F2] px-4 py-2 text-sm font-medium text-[#1D2C20] transition-all duration-150 hover:bg-[#E6ECE2]/60 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Limpar filtros</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirModalNovo()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#334936] px-4 py-2 text-sm font-medium text-[#FAF6F2] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#1D2C20] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Agendar sessão</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-base font-semibold text-[#1D2C20]">
                  Nenhuma consulta agendada nesta semana
                </h2>
                <p className="mt-1 max-w-md text-sm text-[#556650]">
                  O período de{" "}
                  <strong className="text-[#1D2C20]">{intervaloSemana}</strong>{" "}
                  (Semana {String(numeroSemana).padStart(2, "0")}) está livre.
                </p>
                <button
                  type="button"
                  onClick={() => abrirModalNovo()}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2.5 text-sm font-medium text-[#FAF6F2] transition-all duration-150 hover:-translate-y-[1px] hover:bg-[#1D2C20] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Agendar sessão</span>
                </button>
              </>
            )}
          </section>
        ) : (
          <GradeSemanal
            diasSemana={diasSemana}
            sessoes={sessoes}
            feriadosPorData={feriadosPorData}
            carregando={carregandoInicial}
            onSelecionarSessao={abrirModalEdicao}
            onAgendarNoHorario={(data, horario) => abrirModalNovo(data, horario)}
          />
        )}
      </main>

      <ModalSessaoForm
        aberto={modalAberto}
        sessao={sessaoEmEdicao}
        dataPadrao={dataInicialModal}
        horarioPadrao={horarioInicialModal}
        onFechar={() => setModalAberto(false)}
        onSalvo={lidarSessaoSalva}
      />
    </>
  );
}
