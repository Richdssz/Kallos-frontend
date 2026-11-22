import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TipoNotificacao = "sucesso" | "erro" | "aviso";

export interface NotificacaoUI {
  tipo: TipoNotificacao;
  mensagem: string;
}

interface UiState {
  sidebarRecolhida: boolean;
  notificacao: NotificacaoUI | null;

  alternarSidebar: () => void;
  mostrarNotificacao: (tipo: TipoNotificacao, mensagem: string) => void;
  limparNotificacao: () => void;
}

// Store global de interface (Zustand).
// Guarda apenas preferências visuais e notificações (nunca dados clínicos ou pessoais).
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarRecolhida: false,
      notificacao: null,

      alternarSidebar: () =>
        set((state) => ({ sidebarRecolhida: !state.sidebarRecolhida })),

      mostrarNotificacao: (tipo, mensagem) =>
        set({ notificacao: { tipo, mensagem } }),

      limparNotificacao: () => set({ notificacao: null }),
    }),
    {
      name: "kallos-ui-storage",
      // Persiste apenas a preferência da sidebar, nunca mensagens temporárias.
      partialize: (state) => ({ sidebarRecolhida: state.sidebarRecolhida }),
    },
  ),
);
