import { PACIENTES_MOCK } from "@/mocks/pacientes/pacientes.mock";
import type { SessaoResponseDTO } from "@/types/agenda/sessao";
import { formatarDataISO, obterSegundaDaSemana } from "@/utils/agendaDatas";

const PSICOLOGO_PADRAO_ID = "psi-001";

function dataDiaUtil(deslocamentoDias: number): string {
  const segunda = obterSegundaDaSemana(new Date());
  segunda.setDate(segunda.getDate() + deslocamentoDias);
  return formatarDataISO(segunda);
}

// Em dias úteis (Seg-Sex), retorna o índice 0..4 correspondente a hoje.
// Em fim de semana (Sáb/Dom), ancora em Segunda-feira (0) para alinhar Agenda e Painel.
export function obterIndiceDiaReferenciaPainel(): number {
  const diaSemana = new Date().getDay(); // 0=Dom, 1=Seg ... 5=Sex, 6=Sab
  if (diaSemana >= 1 && diaSemana <= 5) {
    return diaSemana - 1;
  }
  return 0;
}

export function obterDataReferenciaPainel(): string {
  return dataDiaUtil(obterIndiceDiaReferenciaPainel());
}

function nomePaciente(id: string, fallback: string): string {
  return PACIENTES_MOCK.find((p) => p.id === id)?.nome ?? fallback;
}

// Sessões iniciais em memória ancoradas na semana atual (Seg a Sex),
// compartilhadas entre a Agenda (/agenda) e o Painel Geral (/painel).
export function criarSessoesIniciaisMock(): SessaoResponseDTO[] {
  const diaHoje = obterIndiceDiaReferenciaPainel();
  const outrosDias = [0, 1, 2, 3, 4].filter((d) => d !== diaHoje);

  return [
    // Sessões do dia de referência (aparecem em "Atendimentos de hoje" no Painel e na coluna correspondente da Agenda)
    {
      id: "ag-001",
      pacienteId: "1",
      pacienteNome: nomePaciente("1", "Mariana Costa"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(diaHoje),
      horario: "09:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 180,
      status: "Concluida",
      statusPagamento: "Pago",
      formaPagamento: "Pix",
      observacoes: "Psicoterapia individual",
    },
    {
      id: "ag-002",
      pacienteId: "2",
      pacienteNome: nomePaciente("2", "Lucas Almeida"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(diaHoje),
      horario: "11:00",
      duracaoMinutos: 50,
      modalidade: "Online",
      valor: 200,
      status: "EmAndamento",
      statusPagamento: "Pendente",
      formaPagamento: null,
      observacoes: "Acompanhamento semanal",
    },
    {
      id: "ag-003",
      pacienteId: "3",
      pacienteNome: nomePaciente("3", "Beatriz Nogueira"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(diaHoje),
      horario: "14:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 160,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
      observacoes: "Retorno quinzenal",
    },
    {
      id: "ag-004",
      pacienteId: "4",
      pacienteNome: nomePaciente("4", "Pedro Azevedo"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(diaHoje),
      horario: "16:00",
      duracaoMinutos: 50,
      modalidade: "Online",
      valor: 220,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
      observacoes: "Psicoterapia individual",
    },

    // Sessões distribuídas nos demais dias úteis da mesma semana
    {
      id: "ag-005",
      pacienteId: "1",
      pacienteNome: nomePaciente("1", "Mariana Costa"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(outrosDias[0]),
      horario: "10:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 180,
      status: "Concluida",
      statusPagamento: "Pago",
      formaPagamento: "Cartao",
      observacoes: "Psicoterapia individual",
    },
    {
      id: "ag-006",
      pacienteId: "4",
      pacienteNome: nomePaciente("4", "Pedro Azevedo"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(outrosDias[1]),
      horario: "11:00",
      duracaoMinutos: 50,
      modalidade: "Online",
      valor: 220,
      status: "Cancelada",
      statusPagamento: "Pendente",
      formaPagamento: null,
      observacoes: "Paciente solicitou cancelamento prévio.",
    },
    {
      id: "ag-007",
      pacienteId: "2",
      pacienteNome: nomePaciente("2", "Lucas Almeida"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(outrosDias[2]),
      horario: "15:00",
      duracaoMinutos: 50,
      modalidade: "Online",
      valor: 200,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
      observacoes: "Acompanhamento semanal",
    },
    {
      id: "ag-008",
      pacienteId: "3",
      pacienteNome: nomePaciente("3", "Beatriz Nogueira"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(outrosDias[3]),
      horario: "09:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 160,
      status: "Agendada",
      statusPagamento: "Pago",
      formaPagamento: "Pix",
      observacoes: "Psicoterapia individual",
    },
  ];
}
