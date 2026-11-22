export type PerfilAcesso = 'psicologo' | 'administrador';

export type SituacaoSessaoAuth = 'autenticado' | 'encerrada';

export type ModalidadeSessao = 'presencial' | 'online';

export type StatusSessao = 'concluida' | 'em_andamento' | 'agendada' | 'cancelada';

export type PainelEstadoModo =
  | 'padrao'
  | 'carregando'
  | 'sem_atendimentos'
  | 'erro_parcial'
  | 'erro';

export type FiltroSessoesHoje = 'todas' | 'proximas' | 'concluidas';

export type RotaNavegacao =
  | '/painel'
  | '/pacientes'
  | '/agenda'
  | '/prontuario'
  | '/configuracoes';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  crp: string;
  email: string;
}

export interface IndicadoresPsicologo {
  pacientesAtivos: number;
  novosPacientesMes: number;
  sessoesNoMes: number;
  sessoesAgendadasMes: number;
  atendimentosHojeRealizados: number;
  atendimentosHojePrevistos: number;
  prontuariosAtualizados7Dias: number;
  evolucoesPendentes: number;
}

export interface SessaoHoje {
  id: string;
  horario: string;
  duracaoMinutos: number;
  pacienteId: string;
  pacienteNome: string;
  tipoAtendimento: string;
  modalidade: ModalidadeSessao;
  status: StatusSessao;
}

export interface RitmoSemana {
  semanaNumero: number;
  label: string;
  intervalo: string;
  realizadas: number;
  ehMaiorVolume: boolean;
}

export interface RitmoMes {
  mesReferencia: string;
  semanas: RitmoSemana[];
  totalConcluidas: number;
  totalPendentes: number;
  mediaSemanal: number;
  variacaoMesAnteriorPercentual: number;
  semanaPicoLabel: string;
  semanaPicoQuantidade: number;
}

export interface NotificacaoUI {
  id: string;
  tipo: 'sucesso' | 'erro' | 'info';
  titulo: string;
  mensagem: string;
}

export interface DestinoNavegacao {
  rota: RotaNavegacao;
  rotaCompleta?: string;
  titulo: string;
}
