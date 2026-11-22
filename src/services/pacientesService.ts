import { PACIENTES_MOCK, SESSOES_POR_PACIENTE_MOCK } from "@/mocks/pacientes.mock";
import { ApiError, fetchApi } from "@/services/api";
import {
  PacienteRequestDTO,
  PacienteResponseDTO,
  PacienteResumoDTO,
  PaginaResponse,
  SessaoPacienteDTO,
  StatusPaciente,
} from "@/types/paciente";

export interface FiltrosPacientes {
  busca?: string;
  status?: "Todos" | StatusPaciente;
  page?: number;
  size?: number;
}

// Estado em memória para o fallback funcionar em CRUD completo enquanto o backend não sobe.
const bancoMock: PacienteResponseDTO[] = structuredClone(PACIENTES_MOCK);

function mascararCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11) return cpf;
  return `***.${digitos.slice(3, 6)}.***-${digitos.slice(9, 11)}`;
}

function isErroDeConexao(erro: unknown): boolean {
  return !(erro instanceof ApiError);
}

/**
 * GET /api/pacientes?busca=&status=&page=&size=
 */
export async function listarPacientes(
  filtros: FiltrosPacientes = {}
): Promise<PaginaResponse<PacienteResumoDTO>> {
  const { busca = "", status = "Todos", page = 0, size = 5 } = filtros;

  const params = new URLSearchParams();
  if (busca.trim()) params.set("busca", busca.trim());
  if (status !== "Todos") params.set("status", status);
  params.set("page", String(page));
  params.set("size", String(size));

  try {
    return await fetchApi<PaginaResponse<PacienteResumoDTO>>(
      `/pacientes?${params.toString()}`
    );
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;

    const termo = busca.trim().toLowerCase();
    const termoDigitos = termo.replace(/\D/g, "");

    const filtrados = bancoMock.filter((p) => {
      const bateStatus = status === "Todos" || p.status === status;
      const bateNome = termo === "" || p.nome.toLowerCase().includes(termo);
      const bateCpf =
        termoDigitos !== "" &&
        p.cpf.replace(/\D/g, "").includes(termoDigitos);
      return bateStatus && (bateNome || bateCpf);
    });

    const totalElements = filtrados.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const inicio = page * size;
    const content: PacienteResumoDTO[] = filtrados
      .slice(inicio, inicio + size)
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        cpf: mascararCpf(p.cpf),
        telefone: p.telefone,
        ultimaSessao: p.ultimaSessao,
        status: p.status,
      }));

    return { content, totalElements, totalPages, number: page, size };
  }
}

/**
 * GET /api/pacientes/{id}
 */
export async function buscarPacientePorId(
  id: string
): Promise<PacienteResponseDTO> {
  try {
    return await fetchApi<PacienteResponseDTO>(`/pacientes/${id}`);
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;

    const encontrado = bancoMock.find((p) => p.id === id);
    if (!encontrado) {
      throw new ApiError(404, "Paciente não encontrado.");
    }
    return structuredClone(encontrado);
  }
}

/**
 * GET /api/pacientes/{id}/sessoes
 */
export async function listarSessoesPaciente(
  id: string
): Promise<SessaoPacienteDTO[]> {
  try {
    return await fetchApi<SessaoPacienteDTO[]>(`/pacientes/${id}/sessoes`);
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;
    return SESSOES_POR_PACIENTE_MOCK[id] ?? [];
  }
}

/**
 * POST /api/pacientes
 */
export async function criarPaciente(
  dto: PacienteRequestDTO
): Promise<PacienteResponseDTO> {
  try {
    return await fetchApi<PacienteResponseDTO>("/pacientes", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;

    const cpfLimpo = dto.cpf.replace(/\D/g, "");
    const duplicado = bancoMock.some(
      (p) => p.cpf.replace(/\D/g, "") === cpfLimpo
    );
    if (duplicado) {
      throw new ApiError(409, "Já existe um paciente cadastrado com este CPF.", [
        { campo: "cpf", mensagem: "CPF já cadastrado para este psicólogo." },
      ]);
    }

    const novo: PacienteResponseDTO = {
      id: String(Date.now()),
      ...dto,
      status: "Ativo",
      ultimaSessao: null,
    };
    bancoMock.unshift(novo);
    return structuredClone(novo);
  }
}

/**
 * PUT /api/pacientes/{id}
 */
export async function atualizarPaciente(
  id: string,
  dto: PacienteRequestDTO
): Promise<PacienteResponseDTO> {
  try {
    return await fetchApi<PacienteResponseDTO>(`/pacientes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;

    const indice = bancoMock.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ApiError(404, "Paciente não encontrado.");
    }

    const cpfLimpo = dto.cpf.replace(/\D/g, "");
    const duplicado = bancoMock.some(
      (p) => p.id !== id && p.cpf.replace(/\D/g, "") === cpfLimpo
    );
    if (duplicado) {
      throw new ApiError(409, "Já existe outro paciente com este CPF.", [
        { campo: "cpf", mensagem: "CPF já cadastrado para este psicólogo." },
      ]);
    }

    bancoMock[indice] = { ...bancoMock[indice], ...dto };
    return structuredClone(bancoMock[indice]);
  }
}

/**
 * DELETE /api/pacientes/{id} (desativação lógica)
 */
export async function desativarPaciente(id: string): Promise<void> {
  try {
    await fetchApi<void>(`/pacientes/${id}`, { method: "DELETE" });
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;

    const paciente = bancoMock.find((p) => p.id === id);
    if (!paciente) throw new ApiError(404, "Paciente não encontrado.");
    paciente.status = "Inativo";
  }
}

/**
 * PATCH /api/pacientes/{id}/reativar
 */
export async function reativarPaciente(id: string): Promise<void> {
  try {
    await fetchApi<void>(`/pacientes/${id}/reativar`, { method: "PATCH" });
  } catch (erro) {
    if (!isErroDeConexao(erro)) throw erro;

    const paciente = bancoMock.find((p) => p.id === id);
    if (!paciente) throw new ApiError(404, "Paciente não encontrado.");
    paciente.status = "Ativo";
  }
}
