"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { useAuthStore as usePainelAuthStore } from "@/store/painel/authStore";
import { useAuthStore as useSessionAuthStore } from "@/store/auth/authStore";
import { useUIStore } from "@/store/painel/uiStore";
import type { RotaNavegacao } from "@/types/painel/painel";

const ROTAS_PUBLICAS = ["/login", "/criar-conta", "/redefinir-senha"];

function obterRotaAtiva(pathname: string): RotaNavegacao {
  if (pathname.startsWith("/pacientes")) return "/pacientes";
  if (pathname.startsWith("/agenda")) return "/agenda";
  if (pathname.startsWith("/prontuario")) return "/prontuario";
  if (pathname.startsWith("/configuracoes")) return "/configuracoes";
  return "/painel";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/painel";
  const router = useRouter();
  const queryClient = useQueryClient();

  const encerrarSessaoPainel = usePainelAuthStore((s) => s.encerrarSessao);
  const logoutSessao = useSessionAuthStore((s) => s.logout);
  const limparNotificacao = useUIStore((s) => s.limparNotificacao);

  if (ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota))) {
    return <>{children}</>;
  }

  const rotaAtiva = obterRotaAtiva(pathname);

  const lidarNavegar = (rota: RotaNavegacao) => {
    if (rota !== pathname) {
      router.push(rota);
    }
  };

  const lidarSair = () => {
    limparNotificacao();
    queryClient.clear();
    encerrarSessaoPainel();
    logoutSessao();
    document.cookie = "kallos-auth=; Path=/; Max-Age=0; SameSite=Lax";
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#FAF6F2] text-[#1D2C20]">
      <Sidebar
        rotaAtiva={rotaAtiva}
        onNavegar={lidarNavegar}
        onSair={lidarSair}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
