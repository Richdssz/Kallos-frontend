import { PACIENTES_MOCK, SESSOES_POR_PACIENTE_MOCK } from "@/mocks/pacientes/pacientes.mock";
import { ApiError, fetchApi } from "@/services/api";
import {
  PacienteRequestDTO,
  PacienteResponseDTO,
  PacienteResumoDTO,
  PaginaResponse,
  SessaoPacienteDTO,
  StatusPaciente,
} from "@/types/pacientes/paciente";

export interface FiltrosPacientes {
  busca?: string;
  status?: "Todos" | StatusPaciente;
  page?: number;
  size?: number;
}

const USAR_MOCK = process.env.NEXT_PUBLIC_USAR_MOCK === "true";

// Base em memória usada exclusivamente quando NEXT_PUBLIC_USAR_MOCK="true".
const bancoMock: PacienteResponseDTO[] = structuredClone(PACIENTES_MOCK);

function mascararCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11) return cpf;
  return `***.${digitos.slice(3, 6)}.***-${digitos.slice(9, 11)}`;
}

// GET /api/pacientes?busca=&status=&page=&size=
export async function listarPacientes(
  filtros: FiltrosPacientes = {}
): Promise<PaginaResponse<PacienteResumoDTO>> {
  const { busca = "", status = "Todos", page = 0, size = 5 } = filtros;

  if (USAR_MOCK) {
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

  const params = new URLSearchParams();
  if (busca.trim()) params.set("busca", busca.trim());
  if (status !== "Todos") params.set("status", status);
  params.set("page", String(page));
  params.set("size", String(size));

  return fetchApi<PaginaResponse<PacienteResumoDTO>>(
    `/pacientes?${params.toString()}`
  );
}

// GET /api/pacientes/{id}
export async function buscarPacientePorId(
  id: string
): Promise<PacienteResponseDTO> {
  if (USAR_MOCK) {
    const encontrado = bancoMock.find((p) => p.id === id);
    if (!encontrado) {
      throw new ApiError(404, "Paciente não encontrado.");
    }
    return structuredClone(encontrado);
  }

  return fetchApi<PacienteResponseDTO>(`/pacientes/${id}`);
}

// GET /api/pacientes/{id}/sessoes
export async function listarSessoesPaciente(
  id: string
): Promise<SessaoPacienteDTO[]> {
  if (USAR_MOCK) {
    return SESSOES_POR_PACIENTE_MOCK[id] ?? [];
  }

  return fetchApi<SessaoPacienteDTO[]>(`/pacientes/${id}/sessoes`);
}

// POST /api/pacientes
export async function criarPaciente(
  dto: PacienteRequestDTO
): Promise<PacienteResponseDTO> {
  if (USAR_MOCK) {
    const cpfLimpo = dto.cpf.replace(/\D/g, "");
    const duplicado = bancoMock.some(
      (p) => p.cpf.replace(/\D/g, "") === cpfLimpo
    );
    if (duplicado) {
      throw new ApiError(
        409,
        "Este CPF já está cadastrado para o psicólogo responsável.",
        [
          {
            campo: "cpf",
            mensagem: "Este CPF já está cadastrado para o psicólogo responsável.",
          },
        ]
      );
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

  return fetchApi<PacienteResponseDTO>("/pacientes", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// PUT /api/pacientes/{id}
export async function atualizarPaciente(
  id: string,
  dto: PacienteRequestDTO
): Promise<PacienteResponseDTO> {
  if (USAR_MOCK) {
    const indice = bancoMock.findIndex((p) => p.id === id);
    if (indice === -1) {
      throw new ApiError(404, "Paciente não encontrado.");
    }

    const cpfLimpo = dto.cpf.replace(/\D/g, "");
    const duplicado = bancoMock.some(
      (p) => p.id !== id && p.cpf.replace(/\D/g, "") === cpfLimpo
    );
    if (duplicado) {
      throw new ApiError(
        409,
        "Este CPF já está cadastrado para o psicólogo responsável.",
        [
          {
            campo: "cpf",
            mensagem: "Este CPF já está cadastrado para o psicólogo responsável.",
          },
        ]
      );
    }

    bancoMock[indice] = { ...bancoMock[indice], ...dto };
    return structuredClone(bancoMock[indice]);
  }

  return fetchApi<PacienteResponseDTO>(`/pacientes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

// DELETE /api/pacientes/{id} (desativação lógica)
export async function desativarPaciente(id: string): Promise<void> {
  if (USAR_MOCK) {
    const paciente = bancoMock.find((p) => p.id === id);
    if (!paciente) throw new ApiError(404, "Paciente não encontrado.");
    paciente.status = "Inativo";
    return;
  }

  await fetchApi<void>(`/pacientes/${id}`, { method: "DELETE" });
}

// PATCH /api/pacientes/{id}/reativar
export async function reativarPaciente(id: string): Promise<void> {
  if (USAR_MOCK) {
    const paciente = bancoMock.find((p) => p.id === id);
    if (!paciente) throw new ApiError(404, "Paciente não encontrado.");
    paciente.status = "Ativo";
    return;
  }

  await fetchApi<void>(`/pacientes/${id}/reativar`, { method: "PATCH" });
}
