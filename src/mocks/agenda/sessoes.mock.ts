import { PACIENTES_MOCK } from "@/mocks/pacientes/pacientes.mock";
import type { SessaoResponseDTO } from "@/types/agenda/sessao";
import { formatarDataISO, obterSegundaDaSemana } from "@/utils/agendaDatas";

const PSICOLOGO_PADRAO_ID = "psi-001";

function dataDiaUtil(deslocamentoDias: number): string {
  const segunda = obterSegundaDaSemana(new Date());
  segunda.setDate(segunda.getDate() + deslocamentoDias);
  return formatarDataISO(segunda);
}

function nomePaciente(id: string, fallback: string): string {
  return PACIENTES_MOCK.find((p) => p.id === id)?.nome ?? fallback;
}

// Sessões iniciais em memória ancoradas na semana atual (Seg a Sex),
// utilizando pacientes reais vinculados em PACIENTES_MOCK.
export function criarSessoesIniciaisMock(): SessaoResponseDTO[] {
  return [
    {
      id: "ag-001",
      pacienteId: "1",
      pacienteNome: nomePaciente("1", "Mariana Costa"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(0), // Segunda
      horario: "09:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 180,
      status: "Concluida",
      statusPagamento: "Pago",
      formaPagamento: "Pix",
      observacoes: "Acompanhamento semanal regular.",
    },
    {
      id: "ag-002",
      pacienteId: "2",
      pacienteNome: nomePaciente("2", "Lucas Almeida"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(0), // Segunda
      horario: "14:00",
      duracaoMinutos: 50,
      modalidade: "Online",
      valor: 200,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
    },
    {
      id: "ag-003",
      pacienteId: "3",
      pacienteNome: nomePaciente("3", "Beatriz Nogueira"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(1), // Terça
      horario: "10:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 160,
      status: "Concluida",
      statusPagamento: "Pago",
      formaPagamento: "Cartao",
    },
    {
      id: "ag-004",
      pacienteId: "1",
      pacienteNome: nomePaciente("1", "Mariana Costa"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(1), // Terça
      horario: "14:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 180,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
    },
    {
      id: "ag-005",
      pacienteId: "4",
      pacienteNome: nomePaciente("4", "Pedro Azevedo"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(2), // Quarta
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
      id: "ag-006",
      pacienteId: "2",
      pacienteNome: nomePaciente("2", "Lucas Almeida"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(3), // Quinta
      horario: "15:00",
      duracaoMinutos: 50,
      modalidade: "Online",
      valor: 200,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
    },
    {
      id: "ag-007",
      pacienteId: "3",
      pacienteNome: nomePaciente("3", "Beatriz Nogueira"),
      psicologoId: PSICOLOGO_PADRAO_ID,
      data: dataDiaUtil(4), // Sexta
      horario: "09:00",
      duracaoMinutos: 50,
      modalidade: "Presencial",
      valor: 160,
      status: "Agendada",
      statusPagamento: "Pago",
      formaPagamento: "Pix",
    },
  ];
}
