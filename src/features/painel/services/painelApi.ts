import type {
  IndicadoresPsicologo,
  PainelEstadoModo,
  RitmoMes,
  SessaoHoje,
} from '../types/painel';

const atraso = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const INDICADORES_PADRAO: IndicadoresPsicologo = {
  pacientesAtivos: 28,
  novosPacientesMes: 4,
  sessoesNoMes: 64,
  sessoesAgendadasMes: 18,
  atendimentosHojeRealizados: 2,
  atendimentosHojePrevistos: 4,
  prontuariosAtualizados7Dias: 19,
  evolucoesPendentes: 2,
};

const SESSOES_HOJE_PADRAO: SessaoHoje[] = [
  {
    id: 'ses-101',
    horario: '08:30',
    duracaoMinutos: 50,
    pacienteId: 'pac-01',
    pacienteNome: 'Camila Ferreira Vasconcelos',
    tipoAtendimento: 'Psicoterapia individual',
    modalidade: 'presencial',
    status: 'concluida',
  },
  {
    id: 'ses-102',
    horario: '09:45',
    duracaoMinutos: 50,
    pacienteId: 'pac-02',
    pacienteNome: 'Lucas Henrique Mendonça',
    tipoAtendimento: 'Acompanhamento semanal',
    modalidade: 'online',
    status: 'concluida',
  },
  {
    id: 'ses-103',
    horario: '11:00',
    duracaoMinutos: 50,
    pacienteId: 'pac-03',
    pacienteNome: 'Beatriz Almeida Prado',
    tipoAtendimento: 'Avaliação inicial',
    modalidade: 'presencial',
    status: 'em_andamento',
  },
  {
    id: 'ses-104',
    horario: '14:00',
    duracaoMinutos: 50,
    pacienteId: 'pac-04',
    pacienteNome: 'Eduardo Nogueira Campos',
    tipoAtendimento: 'Psicoterapia individual',
    modalidade: 'online',
    status: 'agendada',
  },
  {
    id: 'ses-105',
    horario: '15:30',
    duracaoMinutos: 50,
    pacienteId: 'pac-05',
    pacienteNome: 'Mariana Costa Ribeiro',
    tipoAtendimento: 'Retorno quinzenal',
    modalidade: 'presencial',
    status: 'agendada',
  },
  {
    id: 'ses-106',
    horario: '17:00',
    duracaoMinutos: 50,
    pacienteId: 'pac-06',
    pacienteNome: 'Thiago Silveira Moura',
    tipoAtendimento: 'Psicoterapia individual',
    modalidade: 'online',
    status: 'agendada',
  },
];

const RITMO_MES_PADRAO: RitmoMes = {
  mesReferencia: 'Novembro de 2026',
  semanas: [
    {
      semanaNumero: 1,
      label: 'Sem 1',
      intervalo: '02–06 nov',
      realizadas: 11,
      ehMaiorVolume: false,
    },
    {
      semanaNumero: 2,
      label: 'Sem 2',
      intervalo: '09–13 nov',
      realizadas: 14,
      ehMaiorVolume: false,
    },
    {
      semanaNumero: 3,
      label: 'Sem 3',
      intervalo: '16–20 nov',
      realizadas: 16,
      ehMaiorVolume: true,
    },
    {
      semanaNumero: 4,
      label: 'Sem 4',
      intervalo: '23–27 nov',
      realizadas: 5,
      ehMaiorVolume: false,
    },
    {
      semanaNumero: 5,
      label: 'Sem 5',
      intervalo: '30 nov',
      realizadas: 0,
      ehMaiorVolume: false,
    },
  ],
  totalConcluidas: 46,
  totalPendentes: 18,
  mediaSemanal: 11.5,
  variacaoMesAnteriorPercentual: 12,
  semanaPicoLabel: 'Semana 3 (16–20 nov)',
  semanaPicoQuantidade: 16,
};

export function formatarNomePaciente(
  nomeCompleto: string,
  ocultarSobrenome: boolean,
): string {
  if (!ocultarSobrenome) return nomeCompleto;
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length <= 1) return nomeCompleto;
  const primeiro = partes[0];
  const iniciaisRestantes = partes
    .slice(1)
    .map((p) => `${p.charAt(0).toUpperCase()}.`)
    .join(' ');
  return `${primeiro} ${iniciaisRestantes}`;
}

export async function buscarIndicadores(
  psicologoId: string,
  modo: PainelEstadoModo,
): Promise<IndicadoresPsicologo> {
  await atraso(240);
  if (!psicologoId) {
    throw new Error('Sessão do psicólogo não autenticada.');
  }
  if (modo === 'erro') {
    throw new Error(
      'Falha ao consultar os indicadores consolidados do consultório.',
    );
  }
  if (modo === 'sem_atendimentos') {
    return {
      ...INDICADORES_PADRAO,
      atendimentosHojeRealizados: 0,
      atendimentosHojePrevistos: 0,
    };
  }
  return INDICADORES_PADRAO;
}

export async function buscarSessoesHoje(
  psicologoId: string,
  modo: PainelEstadoModo,
): Promise<SessaoHoje[]> {
  await atraso(280);
  if (!psicologoId) {
    throw new Error('Sessão do psicólogo não autenticada.');
  }
  if (modo === 'erro') {
    throw new Error('Falha ao carregar os atendimentos agendados para hoje.');
  }
  if (modo === 'sem_atendimentos') {
    return [];
  }
  return SESSOES_HOJE_PADRAO;
}

export async function buscarRitmoMes(
  psicologoId: string,
  modo: PainelEstadoModo,
): Promise<RitmoMes> {
  await atraso(300);
  if (!psicologoId) {
    throw new Error('Sessão do psicólogo não autenticada.');
  }
  if (modo === 'erro' || modo === 'erro_parcial') {
    throw new Error('Falha ao carregar o ritmo mensal de sessões.');
  }
  return RITMO_MES_PADRAO;
}
