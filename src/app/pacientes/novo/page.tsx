"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormularioPaciente } from "@/components/pacientes/FormularioPaciente";
import { X } from "lucide-react";

export default function NovoPacientePage() {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-verde-profundo/35 p-4 backdrop-blur-[2px]"
      onClick={() => router.push("/pacientes")}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-salvia-claro bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-salvia-claro bg-creme/70 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-verde-kallos">
              Cadastro em 3 etapas
            </p>
            <h1 className="fonte-titulo mt-0.5 text-xl font-bold text-verde-profundo">
              Novo paciente
            </h1>
          </div>

          <Link
            href="/pacientes"
            aria-label="Fechar modal"
            className="rounded-lg p-1.5 text-verde-acinzentado hover:bg-salvia-claro/60 hover:text-verde-profundo transition-colors"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        <FormularioPaciente modo="criar" />
      </div>
    </div>
  );
}
