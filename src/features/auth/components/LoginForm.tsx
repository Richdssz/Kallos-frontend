"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Eye,
  EyeSlash,
  Lock,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import { useAuthStore } from "../store/authStore";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const rotaAnterior = searchParams.get("next");

  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState({
    email: "",
    senha: "",
  });
  const [carregando, setCarregando] = useState(false);

  function obterDestinoSeguro(destino: string | null) {
    if (!destino) return "/painel";

    if (
      !destino.startsWith("/") ||
      destino.startsWith("//") ||
      destino.includes("\\")
    ) {
      return "/painel";
    }

    try {
      const url = new URL(destino, window.location.origin);

      if (url.origin !== window.location.origin) {
        return "/painel";
      }

      return url.pathname + url.search + url.hash;
    } catch {
      return "/painel";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (carregando) return;

    setErro("");

    const novosErros = {
      email: "",
      senha: "",
    };

    if (!email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      novosErros.email = "Digite um e-mail válido.";
    }

    if (!senha.trim()) {
      novosErros.senha = "Informe sua senha.";
    }

    setErros(novosErros);

    if (novosErros.email || novosErros.senha) {
      return;
    }

    setCarregando(true);

    setTimeout(() => {
      if (
        email.trim() === "teste@kallospsi.com" &&
        senha === "123456"
      ) {
        login(email.trim());

        document.cookie =
          "kallos-auth=true; Path=/; SameSite=Lax";

        const destino = obterDestinoSeguro(rotaAnterior);

        router.replace(destino);
      } else {
        setErro("Não foi possível realizar o login. Verifique suas credenciais.");
      }

      setCarregando(false);
    }, 1500);
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
              priority
            />
          </div>
        </header>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0f172a]">
            Bem-vindo de volta
          </h1>

          <p className="mt-2 text-sm text-[#647067]">
            Entre com suas credenciais para acessar sua conta.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
              E-mail
            </label>

            <div
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
                erros.email ? "border-red-500" : "border-[#eae6df]"
              }`}
            >
              <EnvelopeSimple
                size={20}
                aria-hidden="true"
                className="text-[#829087]"
              />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErros((anterior) => ({
                    ...anterior,
                    email: "",
                  }));
                  setErro("");
                }}
                placeholder="seu@email.com"
                aria-invalid={!!erros.email}
                aria-describedby={erros.email ? "erro-email" : undefined}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
              />
            </div>

            {erros.email && (
              <p id="erro-email" className="mt-1 text-sm text-red-600">
                {erros.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#28382c]"
            >
              Senha
            </label>

            <div
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 focus-within:ring-2 focus-within:ring-[#486b4f] ${
                erros.senha ? "border-red-500" : "border-[#eae6df]"
              }`}
            >
              <Lock
                size={20}
                aria-hidden="true"
                className="text-[#829087]"
              />

              <input
                id="password"
                name="password"
                type={senhaVisivel ? "text" : "password"}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErros((anterior) => ({
                    ...anterior,
                    senha: "",
                  }));
                  setErro("");
                }}
                placeholder="Digite sua senha"
                aria-invalid={!!erros.senha}
                aria-describedby={erros.senha ? "erro-senha" : undefined}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
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

            {erros.senha && (
              <p id="erro-senha" className="mt-1 text-sm text-red-600">
                {erros.senha}
              </p>
            )}
          </div>

          <div className="text-right">
            <a
              href="/redefinir-senha"
              className="text-sm font-medium text-[#486b4f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
            >
              Esqueci minha senha
            </a>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {carregando ? (
              <>
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={20} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-[#eae6df] pt-6 text-center">
          <p className="text-sm text-[#647067]">
            Ainda não tem uma conta?{" "}
            <a
              href="/criar-conta"
              className="font-semibold text-[#486b4f] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#486b4f]"
            >
              Criar conta
            </a>
          </p>
        </div>

        <footer className="mt-8 text-center text-xs text-[#9aa39c]">
          Kallos Psi · Plataforma de Gestão Clínica
        </footer>
      </section>
    </main>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
