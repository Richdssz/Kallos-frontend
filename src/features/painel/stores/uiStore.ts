import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { NotificacaoUI, PainelEstadoModo } from '../types/painel';

interface UIState {
  menuRecolhido: boolean;
  menuMobileAberto: boolean;
  modoPrivacidade: boolean;
  inspecaoAberta: boolean;
  painelModo: PainelEstadoModo;
  notificacao: NotificacaoUI | null;
  alternarMenuRecolhido: () => void;
  setMenuMobileAberto: (aberto: boolean) => void;
  alternarModoPrivacidade: () => void;
  alternarInspecaoAberta: () => void;
  setPainelModo: (modo: PainelEstadoModo) => void;
  exibirNotificacao: (notificacao: Omit<NotificacaoUI, 'id'>) => void;
  limparNotificacao: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      menuRecolhido: false,
      menuMobileAberto: false,
      modoPrivacidade: false,
      inspecaoAberta: false,
      painelModo: 'padrao',
      notificacao: null,
      alternarMenuRecolhido: () =>
        set((state) => ({ menuRecolhido: !state.menuRecolhido })),
      setMenuMobileAberto: (aberto) => set({ menuMobileAberto: aberto }),
      alternarModoPrivacidade: () =>
        set((state) => ({ modoPrivacidade: !state.modoPrivacidade })),
      alternarInspecaoAberta: () =>
        set((state) => ({ inspecaoAberta: !state.inspecaoAberta })),
      setPainelModo: (modo) => set({ painelModo: modo }),
      exibirNotificacao: (notificacao) =>
        set({
          notificacao: {
            ...notificacao,
            id: `${Date.now()}`,
          },
        }),
      limparNotificacao: () => set({ notificacao: null }),
    }),
    {
      name: 'kallos-psi-ui-preferencias',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        menuRecolhido: state.menuRecolhido,
        modoPrivacidade: state.modoPrivacidade,
      }),
    },
  ),
);
