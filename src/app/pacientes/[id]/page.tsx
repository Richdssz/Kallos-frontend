"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useDesativarPaciente,
  usePaciente,
  useReativarPaciente,
  useSessoesPaciente,
} from "@/hooks/usePacientes";
import { formatarDataBR } from "@/utils/formatadores";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

export default function PerfilPacientePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);

  const { data: paciente, isLoading, isError, error } = usePaciente(id);
  const { data: sessoes = [], isLoading: carregandoSessoes } =
    useSessoesPaciente(id);
  const desativarMutation = useDesativarPaciente();
  const reativarMutation = useReativarPaciente();

  const processandoStatus =
    desativarMutation.isPending || reativarMutation.isPending;

  async function confirmarAlteracaoStatus() {
    if (!paciente) return;
    if (paciente.status === "Ativo") {
      await desativarMutation.mutateAsync(paciente.id);
    } else {
      await reativarMutation.mutateAsync(paciente.id);
    }
    setModalConfirmacaoAberto(false);
  }

  const isAtivo = paciente?.status === "Ativo";

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-verde-profundo/35 p-4 backdrop-blur-[2px]"
      onClick={() => router.push("/pacientes")}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-salvia-claro bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 space-y-5 animate-pulse">
            <div className="h-6 w-48 rounded bg-salvia-claro" />
            <div className="h-4 w-64 rounded bg-salvia-claro" />
            <div className="h-40 rounded-xl bg-creme border border-salvia-claro" />
            <div className="h-32 rounded-xl bg-creme border border-salvia-claro" />
          </div>
        ) : isError || !paciente ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="h-9 w-9 text-red-600 mb-3" />
            <h2 className="fonte-titulo text-lg font-bold text-verde-profundo">
              Não foi possível abrir o perfil
            </h2>
            <p className="mt-1 text-sm text-verde-acinzentado">
              {error instanceof Error
                ? error.message
                : "Paciente não encontrado ou sem vínculo ativo."}
            </p>
            <Link
              href="/pacientes"
              className="mt-5 rounded-xl bg-verde-kallos px-4 py-2 text-sm font-medium text-white hover:bg-verde-profundo transition-colors"
            >
              Fechar
            </Link>
          </div>
        ) : (
          <>
            {/* Cabeçalho do Drawer */}
            <div className="flex items-start justify-between gap-3 border-b border-salvia-claro bg-creme/70 px-6 py-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="fonte-titulo text-xl font-bold text-verde-profundo">
                    {paciente.nome}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isAtivo
                        ? "bg-salvia-claro text-verde-kallos"
                        : "bg-white text-verde-acinzentado border border-salvia-claro"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isAtivo ? "bg-verde-kallos" : "bg-verde-acinzentado"
                      }`}
                    />
                    {paciente.status}
                  </span>
                </div>
                <p className="fonte-codigo mt-1 text-xs text-verde-acinzentado">
                  CPF: {paciente.cpf} · Nascimento:{" "}
                  {formatarDataBR(paciente.dataNascimento)}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/pacientes/${paciente.id}/editar`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-salvia-claro bg-white px-3 py-1.5 text-xs font-medium text-verde-profundo hover:bg-salvia-claro/40 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar
                </Link>
                <Link
                  href="/pacientes"
                  aria-label="Fechar perfil"
                  className="rounded-lg p-1.5 text-verde-acinzentado hover:bg-salvia-claro/60 hover:text-verde-profundo transition-colors"
                >
                  <X className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Conteúdo rolável */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Atalhos rápidos */}
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={`/agenda?pacienteId=${paciente.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-verde-kallos px-3.5 py-2 text-xs font-medium text-white hover:bg-verde-profundo transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Abrir na Agenda
                </Link>
                <Link
                  href={`/prontuario/${paciente.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-salvia-claro bg-white px-3.5 py-2 text-xs font-medium text-verde-kallos hover:bg-salvia-claro/50 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Prontuário e CID
                </Link>
                <button
                  type="button"
                  onClick={() => setModalConfirmacaoAberto(true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    isAtivo
                      ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border border-salvia-claro bg-salvia-claro text-verde-kallos hover:bg-salvia-claro/80"
                  }`}
                >
                  {isAtivo ? (
                    <>
                      <UserX className="h-3.5 w-3.5" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      Reativar
                    </>
                  )}
                </button>
              </div>

              {/* Contatos e Endereço */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-verde-kallos">
                  Contatos e Endereço
                </h3>
                <div className="rounded-xl border border-salvia-claro bg-creme/40 p-4 space-y-2.5 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-verde-kallos shrink-0" />
                    <span>{paciente.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-verde-kallos shrink-0" />
                    <span>{paciente.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-verde-kallos shrink-0" />
                    <span>
                      Emergência: {paciente.contatoEmergencia} —{" "}
                      {paciente.telefoneEmergencia}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-verde-kallos shrink-0 mt-0.5" />
                    <span>
                      {paciente.endereco.logradouro}, {paciente.endereco.numero}
                      {paciente.endereco.complemento
                        ? ` (${paciente.endereco.complemento})`
                        : ""}{" "}
                      — {paciente.endereco.bairro}, {paciente.endereco.cidade}/
                      {paciente.endereco.uf} ({paciente.endereco.cep})
                    </span>
                  </div>
                </div>
              </section>

              {/* Definições Clínicas */}
              <section className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-verde-kallos">
                  Definições Clínicas
                </h3>
                <div className="rounded-xl border border-salvia-claro p-4 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-verde-acinzentado">
                      Honorário por sessão
                    </span>
                    <span className="font-semibold text-verde-profundo">
                      {paciente.honorario != null
                        ? paciente.honorario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "Valor padrão do consultório"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-verde-acinzentado">CID vinculado</span>
                    <span className="font-medium text-verde-profundo">
                      {paciente.cid || "Não informado"}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-salvia-claro/70">
                    <p className="text-xs text-verde-acinzentado mb-1">
                      Observações preliminares
                    </p>
                    <p className="text-verde-profundo/90">
                      {paciente.observacoes || "Sem observações registradas."}
                    </p>
                  </div>
                </div>
              </section>

              {/* Sessões Vinculadas */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-verde-kallos">
                    Sessões Vinculadas
                  </h3>
                  <span className="text-xs text-verde-acinzentado">
                    {sessoes.length}{" "}
                    {sessoes.length === 1 ? "sessão" : "sessões"}
                  </span>
                </div>

                {carregandoSessoes ? (
                  <div className="space-y-2.5 animate-pulse">
                    <div className="h-14 rounded-xl bg-salvia-claro/60" />
                    <div className="h-14 rounded-xl bg-salvia-claro/60" />
                  </div>
                ) : sessoes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-salvia-claro p-5 text-center text-sm text-verde-acinzentado">
                    Nenhuma sessão registrada até o momento.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sessoes.map((sessao) => {
                      const horario =
                        sessao.inicioEm.split("T")[1]?.slice(0, 5) ?? "";
                      return (
                        <div
                          key={sessao.id}
                          className="flex items-center justify-between rounded-xl border border-salvia-claro bg-creme/40 px-3.5 py-3 text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-salvia-claro text-verde-kallos">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="fonte-codigo text-xs font-semibold text-verde-profundo">
                                {formatarDataBR(sessao.inicioEm)}
                                {horario ? ` às ${horario}` : ""}
                              </p>
                              <p className="text-xs text-verde-acinzentado">
                                {sessao.modalidade} · {sessao.status}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-verde-profundo">
                              {sessao.valor.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                sessao.statusPagamento === "Pago"
                                  ? "text-verde-kallos"
                                  : "text-amber-700"
                              }`}
                            >
                              <CreditCard className="h-3 w-3" />
                              {sessao.statusPagamento}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmação de desativação/reativação */}
      {modalConfirmacaoAberto && paciente && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-verde-profundo/40 p-4 backdrop-blur-[2px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl border border-salvia-claro bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setModalConfirmacaoAberto(false)}
                aria-label="Fechar diálogo"
                className="rounded-lg p-1 text-verde-acinzentado hover:bg-salvia-claro/60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="fonte-titulo mt-4 text-lg font-bold text-verde-profundo">
              {isAtivo ? "Desativar paciente?" : "Reativar paciente?"}
            </h3>
            <p className="mt-1.5 text-sm text-verde-acinzentado">
              {isAtivo ? (
                <>
                  <strong className="text-verde-profundo">{paciente.nome}</strong>{" "}
                  passará para o status <strong>Inativo</strong>. Todos os registros
                  clínicos e sessões serão preservados.
                </>
              ) : (
                <>
                  <strong className="text-verde-profundo">{paciente.nome}</strong>{" "}
                  voltará para o status <strong>Ativo</strong>.
                </>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalConfirmacaoAberto(false)}
                className="rounded-xl border border-salvia-claro px-4 py-2 text-sm font-medium text-verde-profundo hover:bg-creme transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={processandoStatus}
                onClick={confirmarAlteracaoStatus}
                className={`rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60 transition-colors cursor-pointer ${
                  isAtivo
                    ? "bg-amber-700 hover:bg-amber-800"
                    : "bg-verde-kallos hover:bg-verde-profundo"
                }`}
              >
                {processandoStatus
                  ? "Processando..."
                  : isAtivo
                    ? "Confirmar desativação"
                    : "Confirmar reativação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
