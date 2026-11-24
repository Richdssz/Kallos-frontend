"use client";

import { ArrowUpRight } from "lucide-react";

interface ClassificacaoCidCardProps {
  cidPrincipal: string;
  cidSecundario: string;
  onChangeCidPrincipal: (valor: string) => void;
  onChangeCidSecundario: (valor: string) => void;
  onAbrirBuscaCid: () => void;
}

export function ClassificacaoCidCard({
  cidPrincipal,
  cidSecundario,
  onChangeCidPrincipal,
  onChangeCidSecundario,
  onAbrirBuscaCid,
}: ClassificacaoCidCardProps) {
  return (
    <section className="rounded-2xl border border-salvia-claro bg-white p-6 shadow-xs lg:col-span-5">
      <h2 className="fonte-titulo text-xl font-bold text-verde-profundo">
        Classificação CID
      </h2>
      <p className="mt-0.5 text-xs text-verde-acinzentado">
        Códigos registrados no prontuário único.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-verde-acinzentado">
            CID principal
          </label>
          <input
            type="text"
            value={cidPrincipal}
            onChange={(e) => onChangeCidPrincipal(e.target.value)}
            className="fonte-codigo mt-1.5 w-full rounded-xl border border-salvia-claro bg-white px-3.5 py-2.5 text-xs font-semibold text-verde-profundo outline-none focus:border-verde-kallos"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-verde-acinzentado">
            CID secundário
          </label>
          <input
            type="text"
            value={cidSecundario}
            onChange={(e) => onChangeCidSecundario(e.target.value)}
            className="fonte-codigo mt-1.5 w-full rounded-xl border border-salvia-claro bg-white px-3.5 py-2.5 text-xs font-semibold text-verde-profundo outline-none focus:border-verde-kallos"
          />
        </div>

        <button
          type="button"
          onClick={onAbrirBuscaCid}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-verde-kallos hover:text-verde-profundo transition-colors cursor-pointer"
        >
          Buscar no catálogo
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
