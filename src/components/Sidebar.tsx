"use client";

import { useEffect } from "react";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/painel/authStore";
import { useConsultorioStore } from "@/store/painel/consultorioStore";
import { useUIStore } from "@/store/painel/uiStore";
import type { RotaNavegacao } from "@/types/painel/painel";
import Image from "next/image";

interface SidebarProps {
  rotaAtiva: RotaNavegacao;
  onNavegar: (rota: RotaNavegacao, titulo: string) => void;
  onSair: () => void;
}

interface ItemNavegacao {
  rota: RotaNavegacao;
  titulo: string;
  icone: typeof LayoutDashboard;
}

const ITENS_CONSULTORIO: ItemNavegacao[] = [
  { rota: "/painel", titulo: "Painel geral", icone: LayoutDashboard },
  { rota: "/pacientes", titulo: "Pacientes", icone: Users },
  { rota: "/agenda", titulo: "Agenda e consultas", icone: CalendarDays },
  { rota: "/prontuario", titulo: "Prontuário e CID", icone: FileText },
];

const ITENS_ADMINISTRACAO: ItemNavegacao[] = [
  { rota: "/configuracoes", titulo: "Configurações", icone: Settings },
];

function obterIniciais(nome: string): string {
  const partes = nome
    .replace(/^Dr\.?\s+|^Dra\.?\s+/i, "")
    .trim()
    .split(/\s+/);
  if (partes.length === 0) return "KP";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function Sidebar({ rotaAtiva, onNavegar, onSair }: SidebarProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const perfil = useAuthStore((s) => s.perfil);
  const consultorioNome = useConsultorioStore((s) => s.nome);
  const consultorioSubtitulo = useConsultorioStore((s) => s.subtitulo);
  const menuRecolhido = useUIStore((s) => s.menuRecolhido);
  const menuMobileAberto = useUIStore((s) => s.menuMobileAberto);
  const alternarMenuRecolhido = useUIStore((s) => s.alternarMenuRecolhido);
  const setMenuMobileAberto = useUIStore((s) => s.setMenuMobileAberto);

  useEffect(() => {
    if (!menuMobileAberto) return;
    const lidarTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuMobileAberto(false);
      }
    };
    window.addEventListener("keydown", lidarTecla);
    return () => window.removeEventListener("keydown", lidarTecla);
  }, [menuMobileAberto, setMenuMobileAberto]);

  const iniciais = usuario ? obterIniciais(usuario.nome) : "RP";
  const subtituloUsuario =
    perfil === "administrador"
      ? "Perfil Administrador"
      : `CRP ${usuario?.crp ?? ""}`;

  const renderizarConteudo = (modoRecolhido: boolean) => (
    <div className="flex h-full flex-col bg-[#334936] text-[#FAF6F2]">
      <div
        className={`flex items-center border-b border-[#FAF6F2]/12 px-4 py-5 ${
          modoRecolhido ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <Image
            src="/kallos-k-mono-branco.svg"
            alt="Logo Kallos"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain"
            priority
          />
          {!modoRecolhido && (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-[#FAF6F2]">
                {consultorioNome}
              </p>
              <p className="truncate text-xs text-[#ACBFA9]">
                {consultorioSubtitulo}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuMobileAberto(false)}
          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#E6ECE2] transition-colors hover:bg-[#FAF6F2]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2] lg:hidden"
          aria-label="Fechar menu lateral"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {!modoRecolhido && (
          <button
            type="button"
            onClick={alternarMenuRecolhido}
            className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#ACBFA9] transition-colors hover:bg-[#FAF6F2]/10 hover:text-[#FAF6F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2] lg:inline-flex"
            aria-label="Recolher menu lateral"
            title="Recolher menu lateral"
          >
            <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {modoRecolhido && (
        <div className="hidden justify-center border-b border-[#FAF6F2]/12 py-2.5 lg:flex">
          <button
            type="button"
            onClick={alternarMenuRecolhido}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[#ACBFA9] transition-colors hover:bg-[#FAF6F2]/10 hover:text-[#FAF6F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2]"
            aria-label="Expandir menu lateral"
            title="Expandir menu lateral"
          >
            <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      <nav
        aria-label="Navegação principal"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
      >
        <div>
          {!modoRecolhido && (
            <p className="mb-2 px-3 text-[11px] font-medium tracking-wider text-[#ACBFA9] uppercase">
              Consultório
            </p>
          )}
          <ul className="space-y-1">
            {ITENS_CONSULTORIO.map((item) => {
              const Icone = item.icone;
              const ativo = rotaAtiva === item.rota;
              return (
                <li key={item.rota}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavegar(item.rota, item.titulo);
                      setMenuMobileAberto(false);
                    }}
                    aria-current={ativo ? "page" : undefined}
                    title={modoRecolhido ? item.titulo : undefined}
                    className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2] ${
                      modoRecolhido ? "justify-center px-2" : ""
                    } ${
                      ativo
                        ? "bg-[#FAF6F2]/16 text-[#FAF6F2]"
                        : "text-[#E6ECE2]/85 hover:bg-[#FAF6F2]/10 hover:text-[#FAF6F2]"
                    }`}
                  >
                    <Icone
                      className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${
                        ativo
                          ? "text-[#FAF6F2]"
                          : "text-[#ACBFA9] group-hover:text-[#FAF6F2]"
                      }`}
                      strokeWidth={1.75}
                    />
                    {!modoRecolhido && (
                      <span className="truncate whitespace-nowrap">
                        {item.titulo}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          {!modoRecolhido && (
            <p className="mb-2 px-3 text-[11px] font-medium tracking-wider text-[#ACBFA9] uppercase">
              Administração
            </p>
          )}
          <ul className="space-y-1">
            {ITENS_ADMINISTRACAO.map((item) => {
              const Icone = item.icone;
              const ativo = rotaAtiva === item.rota;
              return (
                <li key={item.rota}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavegar(item.rota, item.titulo);
                      setMenuMobileAberto(false);
                    }}
                    aria-current={ativo ? "page" : undefined}
                    title={modoRecolhido ? item.titulo : undefined}
                    className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2] ${
                      modoRecolhido ? "justify-center px-2" : ""
                    } ${
                      ativo
                        ? "bg-[#FAF6F2]/16 text-[#FAF6F2]"
                        : "text-[#E6ECE2]/85 hover:bg-[#FAF6F2]/10 hover:text-[#FAF6F2]"
                    }`}
                  >
                    <Icone
                      className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${
                        ativo
                          ? "text-[#FAF6F2]"
                          : "text-[#ACBFA9] group-hover:text-[#FAF6F2]"
                      }`}
                      strokeWidth={1.75}
                    />
                    {!modoRecolhido && (
                      <span className="truncate whitespace-nowrap">
                        {item.titulo}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-[#FAF6F2]/12 p-3">
        {usuario && (
          <div
            className={`mb-2 flex items-center gap-3 rounded-lg bg-[#1D2C20]/45 p-2.5 ${
              modoRecolhido ? "justify-center" : ""
            }`}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ACBFA9] text-xs font-semibold text-[#1D2C20]"
              aria-hidden="true"
            >
              {iniciais}
            </div>
            {!modoRecolhido && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#FAF6F2]">
                  {usuario.nome}
                </p>
                <p className="truncate font-mono text-xs text-[#ACBFA9] tabular-nums">
                  {subtituloUsuario}
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onSair}
          title={modoRecolhido ? "Sair" : undefined}
          className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#E6ECE2] transition-colors duration-150 hover:bg-[#FAF6F2]/10 hover:text-[#FAF6F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAF6F2] ${
            modoRecolhido ? "justify-center px-2" : ""
          }`}
        >
          <LogOut
            className="h-[18px] w-[18px] shrink-0 text-[#ACBFA9] transition-colors duration-150 group-hover:text-[#FAF6F2]"
            strokeWidth={1.75}
          />
          {!modoRecolhido && <span className="whitespace-nowrap">Sair</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden shrink-0 transition-[width] duration-200 lg:block ${
          menuRecolhido ? "w-[76px]" : "w-[260px]"
        }`}
      >
        <div className="sticky top-0 h-screen">
          {renderizarConteudo(menuRecolhido)}
        </div>
      </aside>

      {menuMobileAberto && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div
            className="fixed inset-0 bg-[#1D2C20]/45 backdrop-blur-[1px]"
            onClick={() => setMenuMobileAberto(false)}
          />
          <aside className="relative z-10 h-full w-[272px] max-w-[85vw] shadow-xl">
            {renderizarConteudo(false)}
          </aside>
        </div>
      )}
    </>
  );
}
