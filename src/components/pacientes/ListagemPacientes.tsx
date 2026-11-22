"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePacientes } from "@/hooks/usePacientes";
import { StatusPaciente } from "@/types/paciente";
import { formatarDataBR } from "@/utils/formatadores";
import {
  Search,
  Plus,
  ChevronDown,
  Users,
  AlertCircle,
  Eye,
} from "lucide-react";

const ITENS_POR_PAGINA = 5;

export function ListagemPacientes() {
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | StatusPaciente>("Todos");
  const [pagina, setPagina] = useState(0);

  // Aguarda 300ms após o usuário parar de digitar antes de consultar a API.
  useEffect(() => {
    const timer = setTimeout(() => {
      setBuscaDebounced(busca);
      setPagina(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const { data, isLoading, isError, refetch } = usePacientes({
    busca: buscaDebounced,
    status: filtroStatus,
    page: pagina,
    size: ITENS_POR_PAGINA,
  });

  const pacientes = data?.content ?? [];
  const totalElementos = data?.totalElements ?? 0;
  const totalPaginas = data?.totalPages ?? 1;
  const inicio = totalElementos === 0 ? 0 : pagina * ITENS_POR_PAGINA + 1;
  const fim = Math.min((pagina + 1) * ITENS_POR_PAGINA, totalElementos);

  function limparFiltros() {
    setBusca("");
    setBuscaDebounced("");
    setFiltroStatus("Todos");
    setPagina(0);
  }

  return (
    <div className="min-h-screen bg-creme text-verde-profundo">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Trilha de navegação */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-verde-acinzentado"
        >
          <span>Consultório</span>
          <span>/</span>
          <span className="font-medium text-verde-profundo">Pacientes</span>
        </nav>

        {/* Cabeçalho da página */}
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-verde-kallos">
              Cadastro e Acompanhamento
            </p>
            <h1 className="fonte-titulo mt-1 text-3xl font-bold tracking-tight text-verde-profundo">
              Pacientes
            </h1>
            <p className="mt-1 text-sm text-verde-acinzentado">
              Histórico, contatos e sessões em um só lugar.
            </p>
          </div>

          <Link
            href="/pacientes/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-verde-kallos px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-verde-profundo transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo paciente
          </Link>
        </header>

        {/* Cartão principal */}
        <section className="rounded-2xl border border-salvia-claro bg-white shadow-xs">
          {/* Barra de busca, filtro e contador */}
          <div className="flex flex-col gap-3 border-b border-salvia-claro px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-verde-acinzentado" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou CPF"
                aria-label="Buscar paciente por nome ou CPF"
                className="w-full rounded-xl border border-salvia-claro bg-white py-2 pl-10 pr-3.5 text-sm text-verde-profundo placeholder:text-verde-acinzentado/70 outline-none focus:border-verde-kallos"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-verde-acinzentado">
                {totalElementos} {totalElementos === 1 ? "paciente" : "pacientes"}
              </span>

              <div className="relative">
                <select
                  value={filtroStatus}
                  onChange={(e) => {
                    setFiltroStatus(e.target.value as "Todos" | StatusPaciente);
                    setPagina(0);
                  }}
                  aria-label="Filtrar por status"
                  className="appearance-none rounded-xl border border-salvia-claro bg-white py-2 pl-3.5 pr-9 text-sm text-verde-profundo outline-none focus:border-verde-kallos cursor-pointer"
                >
                  <option value="Todos">Todos os status</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-verde-acinzentado" />
              </div>
            </div>
          </div>

          {/* Conteúdo: Carregamento / Erro / Vazio / Tabela */}
          {isLoading ? (
            <div className="divide-y divide-salvia-claro/70 p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between pt-3 first:pt-0 animate-pulse"
                >
                  <div className="h-4 w-40 rounded bg-salvia-claro" />
                  <div className="h-4 w-28 rounded bg-salvia-claro" />
                  <div className="h-4 w-32 rounded bg-salvia-claro hidden sm:block" />
                  <div className="h-5 w-16 rounded-full bg-salvia-claro" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mb-3" />
              <p className="text-sm font-medium text-verde-profundo">
                Não foi possível carregar a lista de pacientes.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-xl border border-salvia-claro px-4 py-2 text-xs font-medium text-verde-profundo hover:bg-creme transition-colors cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          ) : pacientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-salvia-claro text-verde-kallos">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-verde-profundo">
                Nenhum paciente encontrado
              </p>
              <p className="mt-1 text-xs text-verde-acinzentado">
                Tente buscar por outro nome/CPF ou limpe os filtros aplicados.
              </p>
              {(busca || filtroStatus !== "Todos") && (
                <button
                  type="button"
                  onClick={limparFiltros}
                  className="mt-4 rounded-xl border border-salvia-claro px-4 py-2 text-xs font-medium text-verde-kallos hover:bg-salvia-claro/50 transition-colors cursor-pointer"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-salvia-claro text-xs font-medium text-verde-acinzentado">
                    <th className="px-6 py-3.5 font-medium">Paciente</th>
                    <th className="px-4 py-3.5 font-medium">CPF</th>
                    <th className="px-4 py-3.5 font-medium">Contato</th>
                    <th className="px-4 py-3.5 font-medium">Última sessão</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-salvia-claro/80 text-sm">
                  {pacientes.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className="transition-colors hover:bg-creme/70"
                    >
                      <td className="px-6 py-4 font-semibold text-verde-profundo">
                        {paciente.nome}
                      </td>
                      <td className="fonte-codigo px-4 py-4 text-xs text-verde-acinzentado">
                        {paciente.cpf}
                      </td>
                      <td className="px-4 py-4 text-verde-profundo/85">
                        {paciente.telefone}
                      </td>
                      <td className="fonte-codigo px-4 py-4 text-xs text-verde-acinzentado">
                        {formatarDataBR(paciente.ultimaSessao)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            paciente.status === "Ativo"
                              ? "bg-salvia-claro text-verde-kallos"
                              : "bg-creme text-verde-acinzentado border border-salvia-claro"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              paciente.status === "Ativo"
                                ? "bg-verde-kallos"
                                : "bg-verde-acinzentado"
                            }`}
                          />
                          {paciente.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/pacientes/${paciente.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-salvia-claro bg-white px-3 py-1.5 text-xs font-medium text-verde-kallos hover:bg-salvia-claro/60 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver perfil
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rodapé de paginação */}
          <div className="flex items-center justify-between border-t border-salvia-claro px-6 py-3.5 text-xs text-verde-acinzentado">
            <span>
              {totalElementos === 0
                ? "Exibindo 0 de 0"
                : `Exibindo ${inicio}–${fim} de ${totalElementos}`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagina <= 0}
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-salvia-claro bg-white px-3 py-1.5 font-medium text-verde-profundo hover:bg-creme disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={pagina + 1 >= totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
                className="rounded-lg border border-salvia-claro bg-white px-3 py-1.5 font-medium text-verde-profundo hover:bg-creme disabled:opacity-45 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Próxima
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
