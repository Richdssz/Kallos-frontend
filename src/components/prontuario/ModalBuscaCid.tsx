"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { CATALOGO_CID } from "@/mocks/prontuario/prontuario.mock";

interface ModalBuscaCidProps {
  aberto: boolean;
  onFechar: () => void;
  onSelecionarCid: (cid: string) => void;
}

export function ModalBuscaCid({
  aberto,
  onFechar,
  onSelecionarCid,
}: ModalBuscaCidProps) {
  const [busca, setBusca] = useState("");

  if (!aberto) return null;

  const cidsFiltrados = CATALOGO_CID.filter((item) =>
    item.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-verde-profundo/40 p-4 backdrop-blur-[1px]"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-salvia-claro bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="fonte-titulo text-base font-bold text-verde-profundo">
            Catálogo CID-10
          </h3>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar catálogo CID"
            className="rounded-lg p-1 text-verde-acinzentado hover:bg-salvia-claro/50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verde-acinzentado" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código ou descrição (ex: F41.1)"
            className="w-full rounded-xl border border-salvia-claro py-2 pl-9 pr-3 text-xs text-verde-profundo outline-none focus:border-verde-kallos"
          />
        </div>

        <div className="mt-3 max-h-60 space-y-1.5 overflow-y-auto">
          {cidsFiltrados.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onSelecionarCid(item);
                onFechar();
              }}
              className="fonte-codigo flex w-full items-center justify-between rounded-xl border border-salvia-claro/80 px-3 py-2 text-left text-xs text-verde-profundo hover:bg-salvia-claro/40 transition-colors cursor-pointer"
            >
              <span>{item}</span>
              <span className="font-sans text-[11px] font-medium text-verde-kallos">
                Selecionar
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
