"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  Video,
  X,
  XCircle,
} from "lucide-react";
import {
  useAgendarSessao,
  useAtualizarSessao,
  useCancelarSessao,
  useConcluirSessao,
  useFeriadosAno,
} from "@/hooks/agenda/useAgenda";
import { usePacientes } from "@/hooks/pacientes/usePacientes";
import {
  formatarNumeroParaInputBRL,
  SessaoFormData,
  sessaoSchema,
} from "@/schemas/agenda/sessaoSchema";
import { ApiError } from "@/services/api";
import { useConsultorioStore } from "@/store/painel/consultorioStore";
import type { SessaoResponseDTO } from "@/types/agenda/sessao";
import {
  formatarDataExtensoBR,
  formatarDataISO,
  formatarMoedaBRL,
  parseValorMonetarioBR,
} from "@/utils/agendaDatas";
import { ModalConfirmarCancelamento } from "./ModalConfirmarCancelamento";

interface ModalSessaoFormProps {
  aberto: boolean;
  sessao?: SessaoResponseDTO | null;
  dataPadrao?: string;
  horarioPadrao?: string;
  onFechar: () => void;
  onSalvo?: (sessaoSalva: SessaoResponseDTO) => void;
}

const ROTULO_STATUS: Record<SessaoResponseDTO["status"], string> = {
  Agendada: "Agendada",
  EmAndamento: "Em andamento",
  Concluida: "Concluída",
  Cancelada: "Cancelada",
};

export function ModalSessaoForm({
  aberto,
  sessao,
  dataPadrao,
  horarioPadrao,
  onFechar,
  onSalvo,
}: ModalSessaoFormProps) {
  const modoEdicao = Boolean(sessao);
  const valorPadraoConsultorio = useConsultorioStore(
    (s) => s.valorPadraoSessao
  );

  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [erroCancelamento, setErroCancelamento] = useState<string | null>(null);

  const consultaPacientes = usePacientes({
    status: "Ativo",
    page: 0,
    size: 100,
  });

  const agendarMutation = useAgendarSessao();
  const atualizarMutation = useAtualizarSessao();
  const cancelarMutation = useCancelarSessao();
  const concluirMutation = useConcluirSessao();

  const processando =
    agendarMutation.isPending ||
    atualizarMutation.isPending ||
    cancelarMutation.isPending ||
    concluirMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SessaoFormData>({
    resolver: zodResolver(sessaoSchema),
    defaultValues: {
      pacienteId: "",
      data: dataPadrao ?? formatarDataISO(new Date()),
      horario: horarioPadrao ?? "09:00",
      duracaoMinutos: "50",
      modalidade: "Presencial",
      valorTexto: formatarNumeroParaInputBRL(valorPadraoConsultorio),
      statusPagamento: "Pendente",
      formaPagamento: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!aberto) return;
    setErroGeral(null);
    setErroCancelamento(null);
    setConfirmandoCancelamento(false);

    if (sessao) {
      const duracaoStr = ["30", "45", "50", "60", "90"].includes(
        String(sessao.duracaoMinutos)
      )
        ? (String(sessao.duracaoMinutos) as SessaoFormData["duracaoMinutos"])
        : "50";

      reset({
        pacienteId: sessao.pacienteId,
        data: sessao.data,
        horario: sessao.horario,
        duracaoMinutos: duracaoStr,
        modalidade: sessao.modalidade,
        valorTexto: formatarNumeroParaInputBRL(sessao.valor),
        statusPagamento: sessao.statusPagamento,
        formaPagamento: sessao.formaPagamento ?? "",
        observacoes: sessao.observacoes ?? "",
      });
    } else {
      reset({
        pacienteId: "",
        data: dataPadrao ?? formatarDataISO(new Date()),
        horario: horarioPadrao ?? "09:00",
        duracaoMinutos: "50",
        modalidade: "Presencial",
        valorTexto: formatarNumeroParaInputBRL(valorPadraoConsultorio),
        statusPagamento: "Pendente",
        formaPagamento: "",
        observacoes: "",
      });
    }
  }, [aberto, sessao, dataPadrao, horarioPadrao, valorPadraoConsultorio, reset]);

  useEffect(() => {
    if (!aberto || confirmandoCancelamento) return;
    const lidarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !processando) {
        onFechar();
      }
    };
    window.addEventListener("keydown", lidarTecla);
    return () => window.removeEventListener("keydown", lidarTecla);
  }, [aberto, confirmandoCancelamento, processando, onFechar]);

  const dataSelecionada = watch("data");
  const modalidadeSelecionada = watch("modalidade");
  const statusPagamentoSelecionado = watch("statusPagamento");

  const anoSelecionado = useMemo(() => {
    if (!dataSelecionada || !/^\d{4}-\d{2}-\d{2}$/.test(dataSelecionada)) {
      return new Date().getFullYear();
    }
    return Number(dataSelecionada.slice(0, 4));
  }, [dataSelecionada]);

  const consultaFeriados = useFeriadosAno(anoSelecionado);

  const feriadoCoincidente = useMemo(() => {
    if (!dataSelecionada || !consultaFeriados.data) return null;
    return (
      consultaFeriados.data.find((f) => f.date === dataSelecionada) ?? null
    );
  }, [dataSelecionada, consultaFeriados.data]);

  const pacientesDisponiveis = useMemo(() => {
    const lista = consultaPacientes.data?.content ?? [];
    if (
      sessao &&
      !lista.some((p) => p.id === sessao.pacienteId)
    ) {
      return [
        {
          id: sessao.pacienteId,
          nome: sessao.pacienteNome,
          cpf: "",
          telefone: "",
          ultimaSessao: null,
          status: "Inativo" as const,
        },
        ...lista,
      ];
    }
    return lista;
  }, [consultaPacientes.data, sessao]);

  if (!aberto) return null;

  const sessaoCancelada = sessao?.status === "Cancelada";
  const podeConcluirOuCancelar =
    Boolean(sessao) &&
    (sessao?.status === "Agendada" || sessao?.status === "EmAndamento");

  const onSubmit = async (dados: SessaoFormData) => {
    setErroGeral(null);
    const valorNumerico = parseValorMonetarioBR(dados.valorTexto);

    try {
      let resultado: SessaoResponseDTO;

      if (modoEdicao && sessao) {
        resultado = await atualizarMutation.mutateAsync({
          id: sessao.id,
          dto: {
            pacienteId: dados.pacienteId,
            data: dados.data,
            horario: dados.horario,
            duracaoMinutos: Number(dados.duracaoMinutos),
            modalidade: dados.modalidade,
            valor: valorNumerico,
            statusPagamento: dados.statusPagamento,
            formaPagamento:
              dados.statusPagamento === "Pago" && dados.formaPagamento
                ? dados.formaPagamento
                : null,
            observacoes: dados.observacoes?.trim() || undefined,
          },
        });
      } else {
        resultado = await agendarMutation.mutateAsync({
          pacienteId: dados.pacienteId,
          data: dados.data,
          horario: dados.horario,
          duracaoMinutos: Number(dados.duracaoMinutos),
          modalidade: dados.modalidade,
          valor: valorNumerico,
          observacoes: dados.observacoes?.trim() || undefined,
        });
      }

      onSalvo?.(resultado);
      onFechar();
    } catch (erro) {
      if (erro instanceof ApiError) {
        if (erro.status === 409) {
          setErroGeral(erro.message);
          setError("horario", {
            type: "manual",
            message:
              erro.campos?.find((c) => c.campo === "horario")?.mensagem ??
              "Este horário já está ocupado. Escolha outro horário ou data.",
          });
          return;
        }

        if (erro.campos && erro.campos.length > 0) {
          erro.campos.forEach((c) => {
            if (
              c.campo === "pacienteId" ||
              c.campo === "data" ||
              c.campo === "horario" ||
              c.campo === "modalidade" ||
              c.campo === "valorTexto" ||
              c.campo === "formaPagamento"
            ) {
              setError(c.campo, { type: "manual", message: c.mensagem });
            }
          });
        }
        setErroGeral(erro.message);
      } else {
        setErroGeral(
          "Não foi possível salvar a consulta. Verifique sua conexão e tente novamente."
        );
      }
    }
  };

  const lidarConcluirConsulta = async () => {
    if (!sessao) return;
    setErroGeral(null);
    try {
      const atualizada = await concluirMutation.mutateAsync(sessao.id);
      onSalvo?.(atualizada);
      onFechar();
    } catch (erro) {
      setErroGeral(
        erro instanceof Error
          ? erro.message
          : "Não foi possível concluir a consulta."
      );
    }
  };

  const lidarConfirmarCancelamento = async () => {
    if (!sessao) return;
    setErroCancelamento(null);
    try {
      const cancelada = await cancelarMutation.mutateAsync(sessao.id);
      setConfirmandoCancelamento(false);
      onSalvo?.(cancelada);
      onFechar();
    } catch (erro) {
      setErroCancelamento(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cancelar a consulta."
      );
    }
  };

  const classeInput = (temErro?: boolean) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm text-[#1D2C20] bg-white transition-colors focus:outline-none focus:ring-2 ${
      temErro
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-[#E6ECE2] focus:border-[#334936] focus:ring-[#ACBFA9]/40"
    } disabled:bg-[#FAF6F2] disabled:text-[#556650]`;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-sessao"
      >
        <div
          className="fixed inset-0 bg-[#1D2C20]/45 backdrop-blur-[1px]"
          onClick={() => {
            if (!processando) onFechar();
          }}
        />

        <div className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E6ECE2] bg-white shadow-xl">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between gap-3 border-b border-[#E6ECE2] bg-[#FAF6F2]/70 px-6 py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="titulo-modal-sessao"
                  className="text-lg font-semibold tracking-tight text-[#1D2C20]"
                >
                  {modoEdicao ? "Gerenciar consulta" : "Agendar sessão"}
                </h2>
                {sessao && (
                  <span className="rounded-md border border-[#E6ECE2] bg-white px-2 py-0.5 text-xs font-medium text-[#334936]">
                    {ROTULO_STATUS[sessao.status]}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#556650]">
                {modoEdicao
                  ? "Edite os dados, remarque a data/horário ou registre o pagamento."
                  : "Preencha os dados para agendar uma nova sessão na agenda semanal."}
              </p>
            </div>

            <button
              type="button"
              disabled={processando}
              onClick={onFechar}
              aria-label="Fechar formulário de sessão"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#556650] transition-colors hover:bg-[#E6ECE2]/60 hover:text-[#1D2C20] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Corpo rolável */}
          <form
            id="form-sessao-agenda"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
          >
            {erroGeral && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <span>{erroGeral}</span>
              </div>
            )}

            {sessaoCancelada && (
              <div className="flex items-start gap-2.5 rounded-xl border border-[#E6ECE2] bg-[#FAF6F2] px-4 py-3 text-xs text-[#556650]">
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#334936]"
                  aria-hidden="true"
                />
                <span>
                  Esta consulta está com status <strong>Cancelada</strong> e é
                  mantida apenas para histórico.
                </span>
              </div>
            )}

            {/* Paciente vinculado */}
            <div>
              <label
                htmlFor="agenda-paciente"
                className="mb-1.5 block text-xs font-semibold text-[#1D2C20]"
              >
                Paciente vinculado <span className="text-red-600">*</span>
              </label>

              {consultaPacientes.isPending ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#E6ECE2]/70" />
              ) : pacientesDisponiveis.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
                  Nenhum paciente ativo vinculado encontrado. Cadastre ou
                  ative um paciente no módulo <strong>Pacientes</strong> antes
                  de agendar.
                </div>
              ) : (
                <select
                  id="agenda-paciente"
                  disabled={processando || sessaoCancelada}
                  {...register("pacienteId")}
                  className={classeInput(Boolean(errors.pacienteId))}
                >
                  <option value="">Selecione um paciente...</option>
                  {pacientesDisponiveis.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>
              )}

              {errors.pacienteId && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.pacienteId.message}
                </p>
              )}
            </div>

            {/* Data, Horário e Duração */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="agenda-data"
                  className="mb-1.5 block text-xs font-semibold text-[#1D2C20]"
                >
                  Data <span className="text-red-600">*</span>
                </label>
                <input
                  id="agenda-data"
                  type="date"
                  disabled={processando || sessaoCancelada}
                  {...register("data", {
                    onChange: () => {
                      clearErrors("horario");
                      setErroGeral(null);
                    },
                  })}
                  className={classeInput(Boolean(errors.data))}
                />
                {errors.data && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.data.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="agenda-horario"
                  className="mb-1.5 block text-xs font-semibold text-[#1D2C20]"
                >
                  Horário <span className="text-red-600">*</span>
                </label>
                <input
                  id="agenda-horario"
                  type="time"
                  disabled={processando || sessaoCancelada}
                  {...register("horario", {
                    onChange: () => {
                      clearErrors("horario");
                      setErroGeral(null);
                    },
                  })}
                  className={classeInput(Boolean(errors.horario))}
                />
                {errors.horario && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.horario.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="agenda-duracao"
                  className="mb-1.5 block text-xs font-semibold text-[#1D2C20]"
                >
                  Duração
                </label>
                <select
                  id="agenda-duracao"
                  disabled={processando || sessaoCancelada}
                  {...register("duracaoMinutos")}
                  className={classeInput(Boolean(errors.duracaoMinutos))}
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="50">50 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
            </div>

            {/* Aviso informativo de feriado (não bloqueante) */}
            {feriadoCoincidente && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-xs text-amber-950"
              >
                <Calendar
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">
                    Aviso de feriado em {formatarDataExtensoBR(dataSelecionada)}
                  </p>
                  <p className="mt-0.5 text-amber-900">
                    Esta data coincide com{" "}
                    <strong>{feriadoCoincidente.name}</strong>. Você pode
                    prosseguir com o {modoEdicao ? "reagendamento" : "agendamento"}{" "}
                    normalmente caso deseje atender nesta data.
                  </p>
                </div>
              </div>
            )}

            {/* Modalidade e Valor */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-[#1D2C20]">
                  Modalidade <span className="text-red-600">*</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["Presencial", "Online"] as const).map((opcao) => {
                    const ativa = modalidadeSelecionada === opcao;
                    return (
                      <button
                        key={opcao}
                        type="button"
                        disabled={processando || sessaoCancelada}
                        onClick={() =>
                          setValue("modalidade", opcao, {
                            shouldValidate: true,
                          })
                        }
                        aria-pressed={ativa}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] disabled:opacity-60 ${
                          ativa
                            ? "border-[#334936] bg-[#334936] text-[#FAF6F2]"
                            : "border-[#E6ECE2] bg-white text-[#556650] hover:border-[#ACBFA9] hover:bg-[#FAF6F2] hover:text-[#1D2C20]"
                        }`}
                      >
                        {opcao === "Presencial" ? (
                          <MapPin className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                        ) : (
                          <Video className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                        )}
                        <span>{opcao}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.modalidade && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.modalidade.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="agenda-valor"
                  className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#1D2C20]"
                >
                  <span>
                    Valor da sessão <span className="text-red-600">*</span>
                  </span>
                  {!modoEdicao && (
                    <span className="font-normal text-[#556650]">
                      Sugerido: {formatarMoedaBRL(valorPadraoConsultorio)}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-[#556650]">
                    R$
                  </span>
                  <input
                    id="agenda-valor"
                    type="text"
                    inputMode="decimal"
                    placeholder="220,00"
                    disabled={processando || sessaoCancelada}
                    {...register("valorTexto")}
                    className={`${classeInput(Boolean(errors.valorTexto))} pl-10 font-mono tabular-nums`}
                  />
                </div>
                {errors.valorTexto && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.valorTexto.message}
                  </p>
                )}
              </div>
            </div>

            {/* Registro Administrativo de Pagamento (somente em edição) */}
            {modoEdicao && (
              <div className="space-y-3 rounded-xl border border-[#E6ECE2] bg-[#FAF6F2]/70 p-4">
                <div className="flex items-center gap-2">
                  <CreditCard
                    className="h-4 w-4 text-[#334936]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <h3 className="text-xs font-semibold tracking-wide text-[#1D2C20] uppercase">
                    Registro de pagamento (administrativo)
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="agenda-status-pagamento"
                      className="mb-1 block text-xs font-medium text-[#556650]"
                    >
                      Situação
                    </label>
                    <select
                      id="agenda-status-pagamento"
                      disabled={processando || sessaoCancelada}
                      {...register("statusPagamento", {
                        onChange: (e) => {
                          if (e.target.value === "Pendente") {
                            setValue("formaPagamento", "");
                            clearErrors("formaPagamento");
                          }
                        },
                      })}
                      className={classeInput(Boolean(errors.statusPagamento))}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="agenda-forma-pagamento"
                      className="mb-1 block text-xs font-medium text-[#556650]"
                    >
                      Forma de pagamento
                    </label>
                    <select
                      id="agenda-forma-pagamento"
                      disabled={
                        processando ||
                        sessaoCancelada ||
                        statusPagamentoSelecionado !== "Pago"
                      }
                      {...register("formaPagamento")}
                      className={classeInput(Boolean(errors.formaPagamento))}
                    >
                      <option value="">
                        {statusPagamentoSelecionado === "Pago"
                          ? "Selecione..."
                          : "Disponível ao marcar como Pago"}
                      </option>
                      <option value="Pix">Pix</option>
                      <option value="Cartao">Cartão</option>
                    </select>
                    {errors.formaPagamento && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.formaPagamento.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Observações opcionais */}
            <div>
              <label
                htmlFor="agenda-observacoes"
                className="mb-1.5 block text-xs font-semibold text-[#1D2C20]"
              >
                Observações da sessão (opcional)
              </label>
              <textarea
                id="agenda-observacoes"
                rows={2}
                disabled={processando || sessaoCancelada}
                placeholder="Ex.: solicitação de remarcação, preferência de sala..."
                {...register("observacoes")}
                className={classeInput(Boolean(errors.observacoes))}
              />
              {errors.observacoes && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.observacoes.message}
                </p>
              )}
            </div>

            {/* Ações de ciclo de vida (Concluir / Cancelar) */}
            {podeConcluirOuCancelar && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6ECE2] bg-white p-3.5">
                <div className="text-xs text-[#556650]">
                  <p className="font-semibold text-[#1D2C20]">
                    Ações da consulta
                  </p>
                  <p>
                    Concluir habilita a sessão para evolução no Prontuário e CID.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={processando}
                    onClick={lidarConcluirConsulta}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#334936]/30 bg-[#E6ECE2]/70 px-3 py-1.5 text-xs font-semibold text-[#1D2C20] transition-colors hover:bg-[#E6ECE2] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                  >
                    {concluirMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#334936]" strokeWidth={1.75} aria-hidden="true" />
                    )}
                    <span>Concluir consulta</span>
                  </button>

                  <button
                    type="button"
                    disabled={processando}
                    onClick={() => {
                      setErroCancelamento(null);
                      setConfirmandoCancelamento(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                    <span>Cancelar consulta</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Rodapé */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E6ECE2] bg-[#FAF6F2]/70 px-6 py-4">
            <button
              type="button"
              disabled={processando}
              onClick={onFechar}
              className="rounded-lg border border-[#E6ECE2] bg-white px-4 py-2 text-sm font-medium text-[#1D2C20] transition-colors hover:bg-[#FAF6F2] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            >
              {sessaoCancelada ? "Fechar" : "Cancelar"}
            </button>

            {!sessaoCancelada && (
              <button
                type="submit"
                form="form-sessao-agenda"
                disabled={processando || pacientesDisponiveis.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2 text-sm font-medium text-[#FAF6F2] transition-all duration-150 ease-out hover:-translate-y-[1px] hover:bg-[#1D2C20] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
              >
                {(agendarMutation.isPending || atualizarMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                <span>
                  {agendarMutation.isPending || atualizarMutation.isPending
                    ? "Salvando..."
                    : modoEdicao
                      ? "Salvar alterações"
                      : "Confirmar agendamento"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <ModalConfirmarCancelamento
        sessao={confirmandoCancelamento ? (sessao ?? null) : null}
        carregando={cancelarMutation.isPending}
        erro={erroCancelamento}
        onFechar={() => setConfirmandoCancelamento(false)}
        onConfirmar={lidarConfirmarCancelamento}
      />
    </>
  );
}
