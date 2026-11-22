"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePaciente } from "@/hooks/usePacientes";
import { FormularioPaciente } from "@/components/pacientes/FormularioPaciente";
import { AlertCircle, X } from "lucide-react";

export default function EditarPacientePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data: paciente, isLoading, isError, error } = usePaciente(id);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-verde-profundo/35 p-4 backdrop-blur-[2px]"
      onClick={() => router.push(`/pacientes/${id}`)}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-salvia-claro bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            <div className="h-6 w-48 rounded bg-salvia-claro" />
            <div className="h-64 rounded-xl bg-creme" />
          </div>
        ) : isError || !paciente ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-red-600 mb-3" />
            <h1 className="fonte-titulo text-lg font-bold text-verde-profundo">
              Não foi possível carregar o paciente
            </h1>
            <p className="mt-1 text-sm text-verde-acinzentado">
              {error instanceof Error ? error.message : "Paciente não encontrado."}
            </p>
            <Link
              href="/pacientes"
              className="mt-5 inline-block rounded-xl bg-verde-kallos px-4 py-2 text-sm font-medium text-white hover:bg-verde-profundo transition-colors"
            >
              Voltar para pacientes
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-salvia-claro bg-creme/70 px-6 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-verde-kallos">
                  Atualização cadastral
                </p>
                <h1 className="fonte-titulo mt-0.5 text-xl font-bold text-verde-profundo">
                  Editar — {paciente.nome}
                </h1>
              </div>

              <Link
                href={`/pacientes/${paciente.id}`}
                aria-label="Fechar modal"
                className="rounded-lg p-1.5 text-verde-acinzentado hover:bg-salvia-claro/60 hover:text-verde-profundo transition-colors"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>

            <FormularioPaciente modo="editar" pacienteInicial={paciente} />
          </>
        )}
      </div>
    </div>
  );
}
