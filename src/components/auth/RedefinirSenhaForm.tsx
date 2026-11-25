
"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { EnvelopeSimple, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "@/schemas/auth/redefinirSenhaSchema";

export function RedefinirSenhaForm() {
  const [erro, setErro] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedefinirSenhaFormData>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: {
      email: "",
    },
  });

  function handleSolicitacao(data: RedefinirSenhaFormData) {
    setErro("");

    // A integração com o backend será implementada posteriormente.
    // Não simulamos o envio nem exibimos uma confirmação falsa.
    console.log("E-mail validado:", data.email);

    setErro(
      "O serviço de recuperação de senha ainda não está conectado. Tente novamente após a integração."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f5] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#eae6df] bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-6 w-full max-w-[280px]">
           <Image
  src="/logo-kallos.png"
  alt="Logo Kallos Psi"
  width={589}
  height={256}
  className="h-auto w-full object-contain"
/>
          </div>
        </header>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[#0f172a]">
            Recuperar acesso
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#647067]">
            Informe seu e-mail profissional. Se ele estiver cadastrado
            em nossa plataforma, você receberá as instruções para
            redefinir sua senha.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(handleSolicitacao)}
          noValidate
        >
          {erro && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {erro}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#28382c]"
            >
              E-mail profissional
            </label>

            <div
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
                errors.email ? "border-red-500" : "border-[#eae6df]"
              }`}
            >
              <EnvelopeSimple
                size={20}
                aria-hidden="true"
                className="text-[#829087]"
              />

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? "erro-email" : undefined
                }
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
                {...register("email", {
                  onChange: () => setErro(""),
                })}
              />
            </div>

            {errors.email && (
              <p
                id="erro-email"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
          >
            Enviar link de redefinição
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>

        <div className="mt-7 border-t border-[#eae6df] pt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#486b4f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Voltar ao login
          </Link>
        </div>

        <footer className="mt-8 text-center text-xs text-[#9aa39c]">
          Kallos Psi · Plataforma de Gestão Clínica
        </footer>
      </section>
    </main>
  );
}
