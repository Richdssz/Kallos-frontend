"use client";

import { ShieldCheck, Stethoscope } from "lucide-react";
import { useAuthStore } from "@/store/painel/authStore";

export default function ConfiguracoesPage() {
  const perfil = useAuthStore((state) => state.perfil);
  const administrador = perfil === "administrador";
  const IconePerfil = administrador ? ShieldCheck : Stethoscope;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-verde-acinzentado">
          Administração
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-verde-profundo sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-verde-acinzentado">
          Gerencie os dados do consultório e as informações do seu perfil.
        </p>

        <div
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-salvia-claro bg-white px-3 py-1.5 text-sm font-medium text-verde-profundo"
          aria-label={`Perfil atual: ${administrador ? "Administrador" : "Psicólogo"}`}
        >
          <IconePerfil
            className="h-4 w-4 text-verde-kallos"
            aria-hidden="true"
          />
          {administrador ? "Administrador" : "Psicólogo"}
        </div>
      </header>

      <section
        aria-labelledby="dados-configuracoes"
        className="rounded-2xl border border-salvia-claro bg-white p-5 shadow-sm sm:p-6 lg:p-8"
      >
        <div className="border-b border-salvia-claro pb-5">
          <h2
            id="dados-configuracoes"
            className="text-lg font-semibold text-verde-profundo"
          >
            {administrador ? "Dados do consultório" : "Perfil profissional"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-verde-acinzentado">
            {administrador
              ? "Atualize as informações e a identidade visual do consultório."
              : "Atualize seus dados de contato e suas informações profissionais."}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-verde-salvia px-4 py-10 text-center">
          <p className="text-sm text-verde-acinzentado">
            {administrador
              ? "O formulário do consultório será adicionado na próxima etapa."
              : "O formulário do perfil será adicionado na próxima etapa."}
          </p>
        </div>
      </section>
    </main>
  );
}
