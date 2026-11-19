"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Eye, EyeSlash, Lock, EnvelopeSimple } from "@phosphor-icons/react";

export default function LoginPage() {
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [erro, setErro] = useState("");
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (!email.trim() || !senha.trim()) {
    setErro("Preencha todos os campos.");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    setErro("Digite um e-mail válido.");
    return;
  }

  setErro("");
  alert("Dados preenchidos corretamente!");
}
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f4f7f5] px-4 py-10">
      
<section className="w-full max-w-md rounded-2xl border border-[#eae6df] bg-white p-8 shadow-sm">

  {/* Identidade visual */}
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

  {/* Título do formulário */}
  <div className="mb-6">
    <h2 className="fonte-titulo text-2xl font-bold text-[#0f172a]">
      Bem-vindo de volta
       </h2>

    <p className="mt-2 text-sm text-[#647067]">
      Entre com suas credenciais para acessar sua conta.
    </p>
  </div>

        {/* Formulário */}
        <form className="space-y-5" onSubmit={handleSubmit}>
            {erro && (
  <p className="text-sm text-red-600">
    {erro}
  </p>
)}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#28382c]">
              E-mail
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-[#eae6df] px-4 py-3">
              <EnvelopeSimple size={20} className="text-[#829087]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#28382c]">
              Senha
            </label>

            <div className="flex items-center gap-3 rounded-lg border border-[#eae6df] px-4 py-3">
              <Lock size={20} className="text-[#829087]" />
              <input
                id="password"
                type={senhaVisivel ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[#a1aaa3]"
              />
              <button
  type="button"
  onClick={() => setSenhaVisivel(!senhaVisivel)}
>
  {senhaVisivel ? (
    <EyeSlash size={20} className="text-[#829087]" />
  ) : (
    <Eye size={20} className="text-[#829087]" />
  )}
</button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-sm font-medium text-[#486b4f] hover:underline">
              Esqueci minha senha
            </a>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#28382c] py-3.5 font-semibold text-white transition hover:bg-[#486b4f]"
          >
            Entrar
            <ArrowRight size={20} />
          </button>
        </form>

        {/* Criar conta */}
        <div className="mt-7 border-t border-[#eae6df] pt-6 text-center">
          <p className="text-sm text-[#647067]">
            Ainda não tem uma conta?{" "}
            <a href="#" className="font-semibold text-[#486b4f] hover:underline">
              Criar conta
            </a>
          </p>
        </div>

        {/* Rodapé */}
        <footer className="mt-8 text-center text-xs text-[#9aa39c]">
          Kallos Psi · Plataforma de Gestão Clínica
        </footer>

      </section>
    </main>
  );
}
