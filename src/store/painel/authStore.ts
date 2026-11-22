import { create } from 'zustand';
import type {
  PerfilAcesso,
  SituacaoSessaoAuth,
  UsuarioAutenticado,
} from '@/types/painel/painel';

interface AuthState {
  usuario: UsuarioAutenticado | null;
  perfil: PerfilAcesso;
  situacao: SituacaoSessaoAuth;
  encerrarSessao: () => void;
  restaurarSessao: () => void;
  definirPerfil: (perfil: PerfilAcesso) => void;
}

const USUARIO_PSICOLOGO: UsuarioAutenticado = {
  id: 'psi-001',
  nome: 'Dr. Rafael Pimentel',
  crp: '06/148920',
  email: 'rafael.pimentel@kallospsi.com.br',
};

const USUARIO_ADMINISTRADOR: UsuarioAutenticado = {
  id: 'adm-001',
  nome: 'Marina Oliveira',
  crp: 'Gestão Administrativa',
  email: 'administracao@kallospsi.com.br',
};

export const useAuthStore = create<AuthState>((set) => ({
  usuario: USUARIO_PSICOLOGO,
  perfil: 'psicologo',
  situacao: 'autenticado',
  encerrarSessao: () =>
    set({
      usuario: null,
      situacao: 'encerrada',
    }),
  restaurarSessao: () =>
    set((state) => ({
      usuario:
        state.perfil === 'administrador'
          ? USUARIO_ADMINISTRADOR
          : USUARIO_PSICOLOGO,
      situacao: 'autenticado',
    })),
  definirPerfil: (perfil) =>
    set({
      perfil,
      usuario:
        perfil === 'administrador' ? USUARIO_ADMINISTRADOR : USUARIO_PSICOLOGO,
      situacao: 'autenticado',
    }),
}));
