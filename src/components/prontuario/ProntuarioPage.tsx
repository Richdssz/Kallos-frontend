"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/store/uiStore";
import { ChevronDown, Lock, ScanFace, ShieldAlert } from "lucide-react";
import { PACIENTES_PRONTUARIO } from "@/mocks/prontuario/prontuario.mock";
import { ProntuarioAbasCard } from "./ProntuarioAbasCard";
import { ClassificacaoCidCard } from "./ClassificacaoCidCard";
import { ModalBuscaCid } from "./ModalBuscaCid";

interface ProntuarioPageProps {
  pacienteIdInicial?: string;
}

export function ProntuarioPage({
  pacienteIdInicial = "",
}: ProntuarioPageProps) {
  const router = useRouter();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  // Estados principais da tela
  const [pacienteId, setPacienteId] = useState(pacienteIdInicial);
  const [abaAtiva, setAbaAtiva] = useState<
    "anamnese" | "observacoes" | "evolucoes"
  >("anamnese");
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [modalCidAberto, setModalCidAberto] = useState(false);

  // Estados dos dados editáveis do prontuário
  const [anamnese, setAnamnese] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [cidPrincipal, setCidPrincipal] = useState("");
  const [cidSecundario, setCidSecundario] = useState("");
  const [evolucoes, setEvolucoes] = useState(PACIENTES_PRONTUARIO[0].evolucoes);

  const pacienteAtual = PACIENTES_PRONTUARIO.find((p) => p.id === pacienteId);

  // Carrega os dados do paciente selecionado nos campos
  useEffect(() => {
    if (pacienteAtual) {
      setAnamnese(pacienteAtual.anamnese);
      setObservacoes(pacienteAtual.observacoes);
      setCidPrincipal(pacienteAtual.cidPrincipal);
      setCidSecundario(pacienteAtual.cidSecundario);
      setEvolucoes(pacienteAtual.evolucoes);
    }
  }, [pacienteAtual]);

  // Seleciona o paciente e atualiza a rota (RF-F20)
  function selecionarPaciente(novoId: string) {
    setAcessoNegado(false);
    setPacienteId(novoId);
    router.push(novoId ? `/prontuario/${novoId}` : "/prontuario");
  }

  // Adiciona uma evolução clínica à lista (RF-F23)
  function adicionarEvolucao(resumo: string) {
    const novoItem = {
      id: String(Date.now()),
      data: "Hoje",
      sessao: "Sessão concluída · Registro clínico",
      resumo,
    };
    setEvolucoes([novoItem, ...evolucoes]);
    mostrarNotificacao("sucesso", "Evolução clínica registrada no histórico.");
  }

  return (
    <div className="min-h-screen bg-creme text-verde-profundo">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Cabeçalho da página */}
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-verde-acinzentado">
              ÁREA CLÍNICA · ACESSO RESTRITO
            </p>
            <h1 className="fonte-titulo mt-1 text-3xl font-bold tracking-tight text-verde-profundo">
              Prontuário e CID
            </h1>
            <p className="mt-1 text-sm text-verde-acinzentado">
              Registro clínico sigiloso do paciente responsável.
            </p>
          </div>

          {/* Seletor de paciente + botão de simular acesso 403 */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                value={pacienteId}
                onChange={(e) => selecionarPaciente(e.target.value)}
                aria-label="Selecionar paciente"
                className="appearance-none rounded-xl border border-salvia-claro bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-verde-profundo outline-none focus:border-verde-kallos cursor-pointer"
              >
                <option value="">Selecione um paciente</option>
                {PACIENTES_PRONTUARIO.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-verde-acinzentado" />
            </div>

            <button
              type="button"
              onClick={() => setAcessoNegado(!acessoNegado)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                acessoNegado
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-salvia-claro bg-white text-verde-acinzentado hover:bg-salvia-claro/40"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              Simular acesso 403
            </button>
          </div>
        </header>

        {/* ESTADO 1: Acesso negado (RF-F25) */}
        {acessoNegado ? (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-6 py-16 text-center shadow-xs">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="fonte-titulo text-lg font-bold text-verde-profundo">
              Acesso negado ao prontuário (Erro 403)
            </h2>
            <p className="mt-1 max-w-md text-xs text-verde-acinzentado">
              Este prontuário é restrito ao psicólogo vinculado ao paciente.
              Nenhum dado clínico foi exibido.
            </p>
            <button
              type="button"
              onClick={() => selecionarPaciente("")}
              className="mt-5 rounded-xl bg-verde-kallos px-4 py-2 text-xs font-medium text-white hover:bg-verde-profundo transition-colors cursor-pointer"
            >
              Voltar à seleção de paciente
            </button>
          </section>
        ) : !pacienteAtual ? (
          /* ESTADO 2: Nenhum paciente selecionado */
          <section className="flex flex-col items-center justify-center rounded-2xl border border-salvia-claro bg-white px-6 py-16 text-center shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center text-verde-kallos">
              <ScanFace className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h2 className="fonte-titulo text-lg font-bold text-verde-profundo">
              Selecione um paciente
            </h2>
            <p className="mt-1 text-xs text-verde-acinzentado">
              Escolha um paciente acima para abrir o prontuário clínico
              correspondente.
            </p>
          </section>
        ) : (
          /* ESTADO 3: Prontuário aberto com os 2 cartões separados */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ProntuarioAbasCard
              paciente={pacienteAtual}
              abaAtiva={abaAtiva}
              onTrocarAba={setAbaAtiva}
              anamnese={anamnese}
              onChangeAnamnese={setAnamnese}
              observacoes={observacoes}
              onChangeObservacoes={setObservacoes}
              evolucoes={evolucoes}
              onAdicionarEvolucao={adicionarEvolucao}
              onSalvar={() =>
                mostrarNotificacao(
                  "sucesso",
                  "Registro clínico salvo com sucesso!",
                )
              }
            />

            <ClassificacaoCidCard
              cidPrincipal={cidPrincipal}
              cidSecundario={cidSecundario}
              onChangeCidPrincipal={setCidPrincipal}
              onChangeCidSecundario={setCidSecundario}
              onAbrirBuscaCid={() => setModalCidAberto(true)}
            />
          </div>
        )}

        {/* Rodapé de atalhos: Fluxos e estados (Tela 06) */}
        <section className="mt-6 rounded-2xl border border-salvia-claro bg-white px-6 py-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-verde-profundo">
              Fluxos e estados
            </h3>
            <span className="text-[11px] text-verde-acinzentado">Tela 06</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (!pacienteId) selecionarPaciente("1");
                setModalCidAberto(true);
              }}
              className="rounded-lg border border-salvia-claro bg-creme/60 px-3 py-1.5 text-xs text-verde-profundo hover:bg-salvia-claro/50 transition-colors cursor-pointer"
            >
              Buscar CID{" "}
              <span className="fonte-codigo ml-1 text-[11px] text-verde-acinzentado">
                RF-F21
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                selecionarPaciente("1");
                setAbaAtiva("anamnese");
              }}
              className="rounded-lg border border-salvia-claro bg-creme/60 px-3 py-1.5 text-xs text-verde-profundo hover:bg-salvia-claro/50 transition-colors cursor-pointer"
            >
              Editar registro clínico{" "}
              <span className="fonte-codigo ml-1 text-[11px] text-verde-acinzentado">
                RF-F22
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAcessoNegado(true)}
              className="rounded-lg border border-salvia-claro bg-creme/60 px-3 py-1.5 text-xs text-verde-profundo hover:bg-salvia-claro/50 transition-colors cursor-pointer"
            >
              Acesso negado{" "}
              <span className="fonte-codigo ml-1 text-[11px] text-verde-acinzentado">
                RF-F25
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* Modal separado de busca no catálogo CID */}
      <ModalBuscaCid
        aberto={modalCidAberto}
        onFechar={() => setModalCidAberto(false)}
        onSelecionarCid={(cid) => {
          setCidPrincipal(cid);
          mostrarNotificacao(
            "sucesso",
            `CID "${cid}" associado ao prontuário.`,
          );
        }}
      />
    </div>
  );
}
