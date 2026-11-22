import { obterDataReferenciaPainel } from '@/mocks/agenda/sessoes.mock';
import { PACIENTES_MOCK } from '@/mocks/pacientes/pacientes.mock';
import { obterSnapshotSessoesMock } from '@/services/agenda/sessoesService';
import type { SessaoResponseDTO } from '@/types/agenda/sessao';
import type {
  IndicadoresPsicologo,
  PainelEstadoModo,
  RitmoMes,
  SessaoHoje,
} from '@/types/painel/painel';
import { formatarDataISO } from '@/utils/agendaDatas';

const atraso = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MAPA_STATUS_PAINEL: Record<
  SessaoResponseDTO['status'],
  SessaoHoje['status']
> = {
  Agendada: 'agendada',
  EmAndamento: 'em_andamento',
  Concluida: 'concluida',
  Cancelada: 'cancelada',
};

function obterSessoesDiaPainel(psicologoId: string): SessaoResponseDTO[] {
  const todas = obterSnapshotSessoesMock().filter(
    (s) => s.psicologoId === psicologoId,
  );
  const hojeIso = formatarDataISO(new Date());
  const sessoesHojeExato = todas.filter((s) => s.data === hojeIso);
  if (sessoesHojeExato.length > 0) {
    return sessoesHojeExato;
  }

  const dataRef = obterDataReferenciaPainel();
  return todas.filter((s) => s.data === dataRef);
}

function mapearParaSessaoHoje(sessao: SessaoResponseDTO): SessaoHoje {
  return {
    id: sessao.id,
    horario: sessao.horario,
    duracaoMinutos: sessao.duracaoMinutos,
    pacienteId: sessao.pacienteId,
    pacienteNome: sessao.pacienteNome,
    tipoAtendimento: sessao.observacoes || 'Psicoterapia individual',
    modalidade: sessao.modalidade === 'Presencial' ? 'presencial' : 'online',
    status: MAPA_STATUS_PAINEL[sessao.status],
  };
}

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
  await atraso(180);
  if (!psicologoId) {
    throw new Error('Sessão do psicólogo não autenticada.');
  }
  if (modo === 'erro') {
    throw new Error(
      'Falha ao consultar os indicadores consolidados do consultório.',
    );
  }

  const todas = obterSnapshotSessoesMock().filter(
    (s) => s.psicologoId === psicologoId,
  );
  const sessoesDia = obterSessoesDiaPainel(psicologoId);
  const pacientesAtivos = PACIENTES_MOCK.filter(
    (p) => p.status === 'Ativo',
  ).length;

  const realizadasHoje = sessoesDia.filter(
    (s) => s.status === 'Concluida',
  ).length;
  const previstasHoje = sessoesDia.filter(
    (s) => s.status === 'Agendada' || s.status === 'EmAndamento',
  ).length;

  const concluidasTotal = todas.filter((s) => s.status === 'Concluida').length;
  const agendadasTotal = todas.filter(
    (s) => s.status === 'Agendada' || s.status === 'EmAndamento',
  ).length;

  const base: IndicadoresPsicologo = {
    pacientesAtivos,
    novosPacientesMes: Math.min(pacientesAtivos, 2),
    sessoesNoMes: concluidasTotal + agendadasTotal,
    sessoesAgendadasMes: agendadasTotal,
    atendimentosHojeRealizados: modo === 'sem_atendimentos' ? 0 : realizadasHoje,
    atendimentosHojePrevistos: modo === 'sem_atendimentos' ? 0 : previstasHoje,
    prontuariosAtualizados7Dias: concluidasTotal,
    evolucoesPendentes: Math.max(0, realizadasHoje - 1),
  };

  return base;
}

export async function buscarSessoesHoje(
  psicologoId: string,
  modo: PainelEstadoModo,
): Promise<SessaoHoje[]> {
  await atraso(200);
  if (!psicologoId) {
    throw new Error('Sessão do psicólogo não autenticada.');
  }
  if (modo === 'erro') {
    throw new Error('Falha ao carregar os atendimentos agendados para hoje.');
  }
  if (modo === 'sem_atendimentos') {
    return [];
  }

  return obterSessoesDiaPainel(psicologoId).map(mapearParaSessaoHoje);
}

export async function buscarRitmoMes(
  psicologoId: string,
  modo: PainelEstadoModo,
): Promise<RitmoMes> {
  await atraso(220);
  if (!psicologoId) {
    throw new Error('Sessão do psicólogo não autenticada.');
  }
  if (modo === 'erro' || modo === 'erro_parcial') {
    throw new Error('Falha ao carregar o ritmo mensal de sessões.');
  }

  const todas = obterSnapshotSessoesMock().filter(
    (s) => s.psicologoId === psicologoId,
  );
  const concluidasSemanaAtual = todas.filter(
    (s) => s.status === 'Concluida',
  ).length;
  const pendentesSemanaAtual = todas.filter(
    (s) => s.status === 'Agendada' || s.status === 'EmAndamento',
  ).length;

  const semanas = [
    {
      semanaNumero: 1,
      label: 'Sem 1',
      intervalo: '02–06 nov',
      realizadas: 6,
      ehMaiorVolume: false,
    },
    {
      semanaNumero: 2,
      label: 'Sem 2',
      intervalo: '09–13 nov',
      realizadas: 8,
      ehMaiorVolume: false,
    },
    {
      semanaNumero: 3,
      label: 'Sem 3',
      intervalo: '16–20 nov',
      realizadas: Math.max(concluidasSemanaAtual, 1),
      ehMaiorVolume: false,
    },
    {
      semanaNumero: 4,
      label: 'Sem 4',
      intervalo: '23–27 nov',
      realizadas: 0,
      ehMaiorVolume: false,
    },
  ];

  const maior = Math.max(...semanas.map((s) => s.realizadas));
  let pico = semanas[0];
  semanas.forEach((s) => {
    if (s.realizadas === maior && maior > 0 && pico.realizadas < s.realizadas) {
      pico = s;
    }
  });
  semanas.forEach((s) => {
    s.ehMaiorVolume = s.semanaNumero === pico.semanaNumero && maior > 0;
  });

  const totalConcluidas = semanas.reduce((acc, s) => acc + s.realizadas, 0);

  return {
    mesReferencia: 'Novembro de 2026',
    semanas,
    totalConcluidas,
    totalPendentes: pendentesSemanaAtual,
    mediaSemanal: Number((totalConcluidas / 3).toFixed(1)),
    variacaoMesAnteriorPercentual: 12,
    semanaPicoLabel: `Semana ${pico.semanaNumero} (${pico.intervalo})`,
    semanaPicoQuantidade: pico.realizadas,
  };
}
