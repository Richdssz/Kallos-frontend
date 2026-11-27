"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  EnvelopeSimple,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  redefinirSenhaSchema,
  type RedefinirSenhaFormData,
} from "@/schemas/auth/redefinirSenhaSchema";

import { supabase } from "@/services/supabaseClient";

type Modo = "email" | "senha" | "concluido";

export function RedefinirSenhaForm() {
  const [modo, setModo] = useState<Modo>("email");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [processando, setProcessando] = useState(false);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

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

  // Detecta quando o usuário chega pelo link de recuperação.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "PASSWORD_RECOVERY" && sessao) {
        setModo("senha");
        setErro("");
        setSucesso("");
      }
    });

    async function verificarLink() {
      const parametrosHash = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const parametrosUrl = new URLSearchParams(
        window.location.search
      );

      const erroUrl =
        parametrosHash.get("error_description") ||
        parametrosUrl.get("error_description");

      if (erroUrl) {
        setErro(erroUrl);
        return;
      }

      if (parametrosHash.get("type") === "recovery") {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setErro("Não foi possível validar o link de recuperação.");
          return;
        }

        if (data.session) {
          setModo("senha");
        } else {
          setErro(
            "O link de recuperação expirou ou é inválido. Solicite um novo."
          );
        }
      }
    }

    void verificarLink();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Solicita o envio do e-mail de recuperação.
  async function handleSolicitacao(data: RedefinirSenhaFormData) {
    setErro("");
    setSucesso("");
    setProcessando(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        }
      );

      if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
          setErro(
            "O envio de e-mails está temporariamente limitado. Aguarde antes de tentar novamente."
          );
        } else {
          setErro(
            "Não foi possível solicitar a recuperação de senha. Tente novamente mais tarde."
          );
        }

        return;
      }

      setSucesso(
        "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
      );
    } catch {
      setErro("Ocorreu um erro ao solicitar a recuperação de senha.");
    } finally {
      setProcessando(false);
    }
  }

  // Atualiza a senha após validar a sessão de recuperação.
  async function handleRedefinirSenha(
  event: FormEvent<HTMLFormElement>
) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (senha.length < 8) {
      setErro("A senha deve possuir pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    setProcessando(true);

    try {
      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (erroSessao || !session) {
        setModo("email");
        setErro(
          "Sua sessão de recuperação expirou. Solicite um novo link."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setSenha("");
      setConfirmarSenha("");
      setModo("concluido");
      setSucesso("Sua senha foi atualizada com sucesso.");
    } catch {
      setErro("Não foi possível atualizar sua senha. Tente novamente.");
    } finally {
      setProcessando(false);
    }
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

        {modo === "email" && (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#0f172a]">
                Recuperar acesso
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-[#647067]">
                Informe seu e-mail profissional. Se ele estiver
                cadastrado em nossa plataforma, você receberá as
                instruções para redefinir sua senha.
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

              {sucesso && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                  {sucesso}
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
                    errors.email
                      ? "border-red-500"
                      : "border-[#eae6df]"
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
                      onChange: () => {
                        setErro("");
                        setSucesso("");
                      },
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
                disabled={processando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processando
                  ? "Enviando..."
                  : "Enviar link de redefinição"}

                {!processando && (
                  <ArrowRight size={20} aria-hidden="true" />
                )}
              </button>
            </form>
          </>
        )}

        {modo === "senha" && (
          <>
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#0f172a]">
                Criar nova senha
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-[#647067]">
                Informe sua nova senha e confirme para recuperar
                o acesso à plataforma.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleRedefinirSenha}
              noValidate
            >
              {erro && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {erro}
                </div>
              )}

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-medium text-[#28382c]"
                >
                  Nova senha
                </label>

                <input
                  id="senha"
                  type="password"
                  autoComplete="new-password"
                  value={senha}
                  onChange={(event) => {
                    setSenha(event.target.value);
                    setErro("");
                  }}
                  placeholder="Mínimo de 8 caracteres"
                  className="w-full rounded-lg border border-[#eae6df] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#486b4f]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block text-sm font-medium text-[#28382c]"
                >
                  Confirmar nova senha
                </label>

                <input
                  id="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  value={confirmarSenha}
                  onChange={(event) => {
                    setConfirmarSenha(event.target.value);
                    setErro("");
                  }}
                  placeholder="Digite a senha novamente"
                  className="w-full rounded-lg border border-[#eae6df] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#486b4f]"
                />
              </div>

              <button
                type="submit"
                disabled={processando}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processando ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}

        {modo === "concluido" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0f172a]">
              Senha redefinida!
            </h1>

            <p
              role="status"
              className="mt-3 text-sm leading-relaxed text-[#486b4f]"
            >
              {sucesso}
            </p>

            <Link
              href="/login"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f]"
            >
              Ir para o login
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        )}

        {modo !== "concluido" && (
          <div className="mt-7 border-t border-[#eae6df] pt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#486b4f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar ao login
            </Link>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-[#9aa39c]">
          Kallos Psi · Plataforma de Gestão Clínica
        </footer>
      </section>
    </main>
  );
}