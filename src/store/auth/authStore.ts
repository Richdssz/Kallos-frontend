import { create } from "zustand";

interface AuthState {
  usuario: string | null;
  autenticado: boolean;
  rotaAnterior: string | null;

  login: (email: string) => void;
  logout: () => void;
  setRotaAnterior: (rota: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  autenticado: false,
  rotaAnterior: null,

  login: (email) =>
    set({
      usuario: email,
      autenticado: true,
    }),

  logout: () =>
    set({
      usuario: null,
      autenticado: false,
      rotaAnterior: null,
    }),

  setRotaAnterior: (rota) =>
    set({
      rotaAnterior: rota,
    }),
}));