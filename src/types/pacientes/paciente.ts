export type StatusPaciente = "Ativo" | "Inativo";

export interface EnderecoDTO {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

// Equivalente ao PacienteResumoDTO do backend (GET /api/pacientes).
// O CPF já vem mascarado pela API para proteger dados pessoais na listagem.
export interface PacienteResumoDTO {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  ultimaSessao: string | null;
  status: StatusPaciente;
}

// Equivalente ao PacienteResponseDTO do backend (GET /api/pacientes/{id}).
// Traz os dados completos para a tela de perfil e edição.
export interface PacienteResponseDTO {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  contatoEmergencia: string;
  telefoneEmergencia: string;
  status: StatusPaciente;
  ultimaSessao: string | null;
  endereco: EnderecoDTO;
  honorario?: number | null;
  cid?: string;
  observacoes?: string;
}

// Equivalente ao PacienteRequestDTO do backend (POST e PUT /api/pacientes).
export interface PacienteRequestDTO {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  contatoEmergencia: string;
  telefoneEmergencia: string;
  endereco: EnderecoDTO;
  honorario?: number | null;
  cid?: string;
  observacoes?: string;
}

// Equivalente ao histórico retornado por GET /api/pacientes/{id}/sessoes.
export interface SessaoPacienteDTO {
  id: string;
  inicioEm: string;
  fimEm: string;
  modalidade: "Presencial" | "Online";
  status: "Agendada" | "Concluida" | "Cancelada";
  valor: number;
  statusPagamento: "Pendente" | "Pago";
}

// Estrutura padrão de resposta paginada da API.
export interface PaginaResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página atual (começa em 0)
  size: number;
}
