export type ModalidadeSessao = "Presencial" | "Online";

export type StatusSessao =
  | "Agendada"
  | "EmAndamento"
  | "Concluida"
  | "Cancelada";

export type StatusPagamento = "Pendente" | "Pago";

export type FormaPagamento = "Pix" | "Cartao";

// Contrato retornado pela API REST para cada sessão na agenda (GET/POST/PUT /api/sessoes).
export interface SessaoResponseDTO {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  psicologoId: string;
  data: string; // YYYY-MM-DD (fuso local)
  horario: string; // HH:mm
  duracaoMinutos: number;
  modalidade: ModalidadeSessao;
  valor: number;
  status: StatusSessao;
  statusPagamento: StatusPagamento;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string;
}

// Payload para criação (POST /api/sessoes).
export interface AgendarSessaoRequestDTO {
  pacienteId: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  duracaoMinutos?: number;
  modalidade: ModalidadeSessao;
  valor: number;
  observacoes?: string;
}

// Payload para edição, remarcação e registro administrativo de pagamento (PUT /api/sessoes/{id}).
export interface AtualizarSessaoRequestDTO {
  pacienteId: string;
  data: string;
  horario: string;
  duracaoMinutos?: number;
  modalidade: ModalidadeSessao;
  valor: number;
  statusPagamento: StatusPagamento;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string;
}

// Parâmetros de filtragem da agenda semanal (GET /api/sessoes).
export interface FiltrosAgenda {
  inicioSemana: string; // YYYY-MM-DD (segunda-feira)
  fimSemana: string; // YYYY-MM-DD (sexta-feira)
  pacienteId?: string;
  status?: "Todos" | StatusSessao;
}

// Feriado nacional retornado pela BrasilAPI (/api/feriados/v1/{ano}).
export interface FeriadoDTO {
  date: string; // YYYY-MM-DD
  name: string;
  type: string;
}
