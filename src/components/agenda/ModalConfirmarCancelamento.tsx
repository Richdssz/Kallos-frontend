"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import type { SessaoResponseDTO } from "@/types/agenda/sessao";
import { formatarDataExtensoBR } from "@/utils/agendaDatas";

interface ModalConfirmarCancelamentoProps {
  sessao: SessaoResponseDTO | null;
  carregando: boolean;
  erro?: string | null;
  onFechar: () => void;
  onConfirmar: () => void;
}

export function ModalConfirmarCancelamento({
  sessao,
  carregando,
  erro,
  onFechar,
  onConfirmar,
}: ModalConfirmarCancelamentoProps) {
  useEffect(() => {
    if (!sessao) return;
    const lidarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !carregando) {
        onFechar();
      }
    };
    window.addEventListener("keydown", lidarTecla);
    return () => window.removeEventListener("keydown", lidarTecla);
  }, [sessao, carregando, onFechar]);

  if (!sessao) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-cancelar-consulta"
    >
      <div
        className="fixed inset-0 bg-[#1D2C20]/50 backdrop-blur-[1px]"
        onClick={() => {
          if (!carregando) onFechar();
        }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[#E6ECE2] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#E6ECE2] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div>
              <h3
                id="titulo-cancelar-consulta"
                className="text-base font-semibold text-[#1D2C20]"
              >
                Cancelar consulta
              </h3>
              <p className="text-xs text-[#556650]">
                Confirmação necessária antes de atualizar o status
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={carregando}
            onClick={onFechar}
            aria-label="Fechar diálogo de cancelamento"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#556650] transition-colors hover:bg-[#FAF6F2] hover:text-[#1D2C20] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-xl border border-[#E6ECE2] bg-[#FAF6F2] px-4 py-3 text-xs">
            <p className="font-semibold text-[#1D2C20]">{sessao.pacienteNome}</p>
            <p className="mt-1 font-mono text-[#556650] tabular-nums">
              {formatarDataExtensoBR(sessao.data)} · {sessao.horario} ({sessao.duracaoMinutos} min) · {sessao.modalidade}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-[#556650]">
            Deseja realmente cancelar esta consulta? O registro será mantido no
            histórico com status <strong className="text-[#1D2C20]">Cancelada</strong>.
          </p>

          {erro && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
            >
              {erro}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#E6ECE2] bg-[#FAF6F2]/60 px-6 py-4">
          <button
            type="button"
            disabled={carregando}
            onClick={onFechar}
            className="rounded-lg border border-[#E6ECE2] bg-white px-4 py-2 text-sm font-medium text-[#1D2C20] transition-colors hover:bg-[#FAF6F2] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            Manter consulta
          </button>
          <button
            type="button"
            disabled={carregando}
            onClick={onConfirmar}
            className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          >
            {carregando && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            <span>{carregando ? "Cancelando..." : "Confirmar cancelamento"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
