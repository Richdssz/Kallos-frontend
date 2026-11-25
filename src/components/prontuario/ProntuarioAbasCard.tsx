"use client";

import { useState } from "react";
import { Lock, Plus, Save } from "lucide-react";
import {
  EvolucaoClinica,
  ProntuarioPaciente,
} from "@/mocks/prontuario/prontuario.mock";

interface ProntuarioAbasCardProps {
  paciente: ProntuarioPaciente;
  abaAtiva: "anamnese" | "observacoes" | "evolucoes";
  onTrocarAba: (aba: "anamnese" | "observacoes" | "evolucoes") => void;
  anamnese: string;
  onChangeAnamnese: (valor: string) => void;
  observacoes: string;
  onChangeObservacoes: (valor: string) => void;
  evolucoes: EvolucaoClinica[];
  onAdicionarEvolucao: (texto: string) => void;
  onSalvar: () => void;
}

export function ProntuarioAbasCard({
  paciente,
  abaAtiva,
  onTrocarAba,
  anamnese,
  onChangeAnamnese,
  observacoes,
  onChangeObservacoes,
  evolucoes,
  onAdicionarEvolucao,
  onSalvar,
}: ProntuarioAbasCardProps) {
  const [novaEvolucao, setNovaEvolucao] = useState("");

  function registrarEvolucao() {
    if (!novaEvolucao.trim()) return;
    onAdicionarEvolucao(novaEvolucao.trim());
    setNovaEvolucao("");
  }

  return (
    <section className="rounded-2xl border border-salvia-claro bg-white p-6 shadow-xs lg:col-span-7">
      {/* Cabeçalho do paciente e selo Sigiloso */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="fonte-titulo text-xl font-bold text-verde-profundo">
            {paciente.nome}
          </h2>
          <p className="mt-0.5 text-xs text-verde-acinzentado">
            Prontuário aberto em {paciente.dataAbertura} · última evolução em{" "}
            {paciente.ultimaEvolucao}
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-salvia-claro bg-creme px-3 py-1 text-xs font-medium text-verde-kallos">
          <span className="h-1.5 w-1.5 rounded-full bg-verde-kallos" />
          <Lock className="h-3 w-3" />
          Sigiloso
        </span>
      </div>

      {/* Menu de Abas */}
      <div className="mt-6 flex gap-6 border-b border-salvia-claro text-xs font-medium">
        <button
          type="button"
          onClick={() => onTrocarAba("anamnese")}
          className={`pb-3 transition-colors cursor-pointer ${
            abaAtiva === "anamnese"
              ? "border-b-2 border-verde-kallos font-semibold text-verde-profundo"
              : "text-verde-acinzentado hover:text-verde-profundo"
          }`}
        >
          Anamnese
        </button>
        <button
          type="button"
          onClick={() => onTrocarAba("observacoes")}
          className={`pb-3 transition-colors cursor-pointer ${
            abaAtiva === "observacoes"
              ? "border-b-2 border-verde-kallos font-semibold text-verde-profundo"
              : "text-verde-acinzentado hover:text-verde-profundo"
          }`}
        >
          Observações gerais
        </button>
        <button
          type="button"
          onClick={() => onTrocarAba("evolucoes")}
          className={`pb-3 transition-colors cursor-pointer ${
            abaAtiva === "evolucoes"
              ? "border-b-2 border-verde-kallos font-semibold text-verde-profundo"
              : "text-verde-acinzentado hover:text-verde-profundo"
          }`}
        >
          Evoluções
        </button>
      </div>

      {/* Aba 1: Anamnese */}
      {abaAtiva === "anamnese" && (
        <div className="mt-5">
          <div className="mb-4 rounded-xl bg-salvia-claro/60 px-4 py-3 text-xs text-verde-acinzentado">
            Registrar o histórico inicial do paciente e as informações coletadas
            durante a avaliação.
          </div>

          <textarea
            rows={6}
            value={anamnese}
            onChange={(e) => onChangeAnamnese(e.target.value)}
            aria-label="Texto da anamnese"
            className="w-full rounded-xl border border-transparent bg-transparent p-1 text-sm leading-relaxed text-verde-profundo outline-none focus:border-salvia-claro focus:bg-creme/40 focus:p-3 transition-all"
          />

          <div className="mt-4 border-t border-salvia-claro pt-4">
            <button
              type="button"
              onClick={onSalvar}
              className="inline-flex items-center gap-2 rounded-xl bg-verde-kallos px-4 py-2.5 text-xs font-medium text-white hover:bg-verde-profundo transition-colors cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar registro
            </button>
          </div>
        </div>
      )}

      {/* Aba 2: Observações gerais */}
      {abaAtiva === "observacoes" && (
        <div className="mt-5">
          <div className="mb-4 rounded-xl bg-salvia-claro/60 px-4 py-3 text-xs text-verde-acinzentado">
            Anotações gerais sobre o acompanhamento, frequência e combinados
            terapêuticos.
          </div>

          <textarea
            rows={5}
            value={observacoes}
            onChange={(e) => onChangeObservacoes(e.target.value)}
            aria-label="Observações gerais"
            className="w-full rounded-xl border border-salvia-claro bg-creme/30 p-3 text-sm leading-relaxed text-verde-profundo outline-none focus:border-verde-kallos"
          />

          <div className="mt-4 border-t border-salvia-claro pt-4">
            <button
              type="button"
              onClick={onSalvar}
              className="inline-flex items-center gap-2 rounded-xl bg-verde-kallos px-4 py-2.5 text-xs font-medium text-white hover:bg-verde-profundo transition-colors cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar registro
            </button>
          </div>
        </div>
      )}

      {/* Aba 3: Evoluções (RF-F23 e RF-F24) */}
      {abaAtiva === "evolucoes" && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-salvia-claro bg-creme/40 p-3.5">
            <label className="block text-xs font-semibold text-verde-profundo">
              Nova evolução (vinculada à última sessão concluída)
            </label>
            <textarea
              rows={3}
              value={novaEvolucao}
              onChange={(e) => setNovaEvolucao(e.target.value)}
              placeholder="Descreva a evolução clínica da sessão..."
              className="mt-2 w-full rounded-lg border border-salvia-claro bg-white p-2.5 text-xs text-verde-profundo outline-none focus:border-verde-kallos"
            />
            <button
              type="button"
              onClick={registrarEvolucao}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-verde-kallos px-3 py-1.5 text-xs font-medium text-white hover:bg-verde-profundo transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar evolução
            </button>
          </div>

          {/* Lista somente leitura (RF-F24) */}
          <div className="space-y-2.5">
            {evolucoes.map((ev) => (
              <div
                key={ev.id}
                className="rounded-xl border border-salvia-claro p-3.5"
              >
                <div className="flex items-center justify-between text-xs text-verde-acinzentado">
                  <span className="font-semibold text-verde-profundo">
                    {ev.sessao}
                  </span>
                  <span className="fonte-codigo">{ev.data}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-verde-profundo/90">
                  {ev.resumo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
