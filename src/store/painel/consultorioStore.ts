import { create } from 'zustand';

interface ConsultorioState {
  nome: string;
  subtitulo: string;
  valorPadraoSessao: number;
  possuiLogotipoPersonalizado: boolean;
}

export const useConsultorioStore = create<ConsultorioState>(() => ({
  nome: 'Kallos Psi',
  subtitulo: 'Gestão clínica',
  valorPadraoSessao: 220,
  possuiLogotipoPersonalizado: true,
}));
