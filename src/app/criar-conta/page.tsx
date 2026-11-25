
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeSlash,
  Lock,
  EnvelopeSimple,
  User,
  IdentificationCard,
} from "@phosphor-icons/react";

// Regras de validação do formulário
const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe seu nome completo."),

  crp: z
  .string()
  .min(1, "Informe seu CRP.")
  .regex(
    /^\d{2}\/\d{6}$/,
    "Informe um CRP válido no formato 00/000000."
  ),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail profissional.")
    .email("Informe um endereço de e-mail válido."),

  senha: z
    .string()
    .min(1, "Informe sua senha.")
    .min(8, "A senha deve conter no mínimo 8 caracteres."),
});

type CadastroData = z.infer<typeof cadastroSchema>;

export default function CriarContaPage() {
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CadastroData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      crp: "",
      email: "",
      senha: "",
    },
  });

  const crpAtual = watch("crp");

  // Aplica a máscara 00/000000 ao CRP
  function formatarCRP(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
      return numeros;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  function handleCRPChange(valor: string) {
    setValue("crp", formatarCRP(valor), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  // Por enquanto, somente validamos o formulário.
  // A integração com a API será feita após conhecermos seu contrato.
  function handleCadastro(data: CadastroData) {
    console.log("Formulário validado:", {
      nome: data.nome,
      crp: data.crp,
      email: data.email,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f5] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#eae6df] bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-5 w-full max-w-[240px]">
            <Image
              src="/logo-kallos.png"
              alt="Logo Kallos Psi"
              width={589}
              height={256}
              className="h-auto w-full object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-[#0f172a]">
            Criar conta
          </h1>

          <p className="mt-2 text-sm text-[#647067]">
            Cadastre seus dados profissionais para acessar o Kallos Psi.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(handleCadastro)}
          noValidate
          className="space-y-5"
        >
          {/* Nome completo */}
          <div>
            <label
              htmlFor="nome"
              className="mb-2 block text-sm font-medium text-[#28382c]"
            >
              Nome completo *
            </label>

            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
              errors.nome ? "border-red-500" : "border-[#eae6df]"
            }`}>
              <User size={20} className="text-[#829087]" aria-hidden="true" />

              <input
                id="nome"
                type="text"
                autoComplete="name"
                placeholder="Digite seu nome completo"
                aria-invalid={!!errors.nome}
                aria-required="true"
                aria-describedby={errors.nome ? "erro-nome" : undefined}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
                {...register("nome")}
              />
            </div>

            {errors.nome && (
              <p id="erro-nome" role="alert" className="mt-1 text-sm text-red-600">
                {errors.nome.message}
              </p>
            )}
          </div>

          {/* CRP */}
          <div>
            <label
              htmlFor="crp"
              className="mb-2 block text-sm font-medium text-[#28382c]"
            >
              CRP *
            </label>

            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
              errors.crp ? "border-red-500" : "border-[#eae6df]"
            }`}>
              <IdentificationCard size={20} className="text-[#829087]" aria-hidden="true" />

              <input
                id="crp"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="00/000000"
                value={crpAtual}
                onChange={(e) => handleCRPChange(e.target.value)}
                aria-invalid={!!errors.crp}
                aria-required="true"
                aria-describedby={errors.crp ? "erro-crp" : undefined}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
              />
            </div>

            {errors.crp && (
              <p id="erro-crp" role="alert" className="mt-1 text-sm text-red-600">
                {errors.crp.message}
              </p>
            )}
          </div>

          {/* E-mail */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#28382c]"
            >
              E-mail profissional *
            </label>

            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
              errors.email ? "border-red-500" : "border-[#eae6df]"
            }`}>
              <EnvelopeSimple size={20} className="text-[#829087]" aria-hidden="true" />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={!!errors.email}
                aria-required="true"
                aria-describedby={errors.email ? "erro-email" : undefined}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
                {...register("email")}
              />
            </div>

            {errors.email && (
              <p id="erro-email" role="alert" className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-medium text-[#28382c]"
            >
              Senha *
            </label>

            <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
              errors.senha ? "border-red-500" : "border-[#eae6df]"
            }`}>
              <Lock size={20} className="text-[#829087]" aria-hidden="true" />

              <input
                id="senha"
                type={senhaVisivel ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                aria-invalid={!!errors.senha}
                aria-required="true"
                aria-describedby={errors.senha ? "erro-senha" : undefined}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
                {...register("senha")}
              />

              <button
                type="button"
                onClick={() => setSenhaVisivel(!senhaVisivel)}
                aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={senhaVisivel}
                className="rounded p-1 text-[#829087] hover:text-[#28382c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
              >
                {senhaVisivel ? (
                  <EyeSlash size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>

            {errors.senha && (
              <p id="erro-senha" role="alert" className="mt-1 text-sm text-red-600">
                {errors.senha.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
          >
            Criar conta
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>

        <div className="mt-7 border-t border-[#eae6df] pt-6 text-center">
          <p className="text-sm text-[#647067]">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#486b4f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
            >
              Entrar
            </Link>
          </p>
        </div>

        <footer className="mt-8 text-center text-xs text-[#9aa39c]">
          Kallos Psi · Plataforma de Gestão Clínica
        </footer>
      </section>
    </main>
  );
}
