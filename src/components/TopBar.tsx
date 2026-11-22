"use client";

import { usePathname } from 'next/navigation';
import { Calendar, ChevronRight, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/painel/authStore';
import { useUIStore } from '@/store/painel/uiStore';

function obterTituloRota(pathname: string): { secao: string; titulo: string } {
  if (pathname.startsWith('/pacientes')) {
    return { secao: 'Consultório', titulo: 'Pacientes' };
  }
  if (pathname.startsWith('/agenda')) {
    return { secao: 'Consultório', titulo: 'Agenda e consultas' };
  }
  if (pathname.startsWith('/prontuario')) {
    return { secao: 'Consultório', titulo: 'Prontuário e CID' };
  }
  if (pathname.startsWith('/configuracoes')) {
    return { secao: 'Administração', titulo: 'Configurações' };
  }
  return { secao: 'Consultório', titulo: 'Painel geral' };
}

function formatarDataAtual(): string {
  const agora = new Date();
  const formatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(agora);
  return formatada.charAt(0).toUpperCase() + formatada.slice(1);
}

function obterIniciais(nome: string): string {
  const partes = nome
    .replace(/^Dr\.?\s+|^Dra\.?\s+/i, '')
    .trim()
    .split(/\s+/);
  if (partes.length === 0) return 'KP';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export function TopBar() {
  const pathname = usePathname() || '/painel';
  const usuario = useAuthStore((s) => s.usuario);
  const setMenuMobileAberto = useUIStore((s) => s.setMenuMobileAberto);

  const dataAtual = formatarDataAtual();
  const iniciais = usuario ? obterIniciais(usuario.nome) : 'RP';
  const { secao, titulo } = obterTituloRota(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-[#E6ECE2] bg-[#FAF6F2]/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuMobileAberto(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E6ECE2] bg-white text-[#1D2C20] transition-colors hover:bg-[#E6ECE2]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] lg:hidden"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <nav aria-label="Trilha de navegação" className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="hidden text-[#556650] sm:inline">{secao}</span>
            <ChevronRight
              className="hidden h-4 w-4 shrink-0 text-[#7F8F7A] sm:inline"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="truncate font-medium text-[#1D2C20]">
              {titulo}
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden items-center gap-2 text-xs font-medium text-[#556650] md:flex">
            <Calendar className="h-4 w-4 text-[#7F8F7A]" strokeWidth={1.75} aria-hidden="true" />
            <time dateTime={new Date().toISOString().split('T')[0]}>
              {dataAtual}
            </time>
          </div>

          <div
            className="flex items-center gap-2.5"
            title={usuario ? `${usuario.nome} · CRP ${usuario.crp}` : 'Psicólogo'}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ACBFA9] bg-[#E6ECE2] text-xs font-semibold text-[#1D2C20]"
              aria-label={usuario ? `Avatar de ${usuario.nome}` : 'Avatar do usuário'}
            >
              {iniciais}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
