import { criarSessoesIniciaisMock } from "@/mocks/agenda/sessoes.mock";
import { PACIENTES_MOCK } from "@/mocks/pacientes/pacientes.mock";
import { ApiError, fetchApi } from "@/services/api";
import type {
  AgendarSessaoRequestDTO,
  AtualizarSessaoRequestDTO,
  FiltrosAgenda,
  SessaoResponseDTO,
} from "@/types/agenda/sessao";
import { haConflitoHorario } from "@/utils/agendaDatas";

const USAR_MOCK = process.env.NEXT_PUBLIC_USAR_MOCK === "true";
const PSICOLOGO_MOCK_ID = "psi-001";

// Base em memória usada exclusivamente quando NEXT_PUBLIC_USAR_MOCK="true".
// Nunca persistida em localStorage (proteção de dados clínicos).
const bancoSessoesMock: SessaoResponseDTO[] = criarSessoesIniciaisMock();

// Snapshot somente leitura compartilhado com o Painel Geral para manter
// Agenda e Painel 100% alinhados em modo mock.
export function obterSnapshotSessoesMock(): SessaoResponseDTO[] {
  return structuredClone(ordenarSessoes(bancoSessoesMock));
}

function ordenarSessoes(lista: SessaoResponseDTO[]): SessaoResponseDTO[] {
  return [...lista].sort((a, b) => {
    const compData = a.data.localeCompare(b.data);
    if (compData !== 0) return compData;
    return a.horario.localeCompare(b.horario);
  });
}

// GET /api/sessoes?inicio=YYYY-MM-DD&fim=YYYY-MM-DD&pacienteId=&status=
export async function listarSessoesSemana(
  filtros: FiltrosAgenda
): Promise<SessaoResponseDTO[]> {
  const { inicioSemana, fimSemana, pacienteId, status = "Todos" } = filtros;

  if (USAR_MOCK) {
    const filtradas = bancoSessoesMock.filter((sessao) => {
      const naSemana = sessao.data >= inicioSemana && sessao.data <= fimSemana;
      const batePaciente = !pacienteId || sessao.pacienteId === pacienteId;
      const bateStatus = status === "Todos" || sessao.status === status;
      const mesmoPsicologo = sessao.psicologoId === PSICOLOGO_MOCK_ID;
      return naSemana && batePaciente && bateStatus && mesmoPsicologo;
    });

    return structuredClone(ordenarSessoes(filtradas));
  }

  const params = new URLSearchParams();
  params.set("inicio", inicioSemana);
  params.set("fim", fimSemana);
  if (pacienteId) params.set("pacienteId", pacienteId);
  if (status !== "Todos") params.set("status", status);

  const lista = await fetchApi<SessaoResponseDTO[]>(
    `/sessoes?${params.toString()}`
  );
  return ordenarSessoes(lista);
}

// POST /api/sessoes
export async function agendarSessao(
  dto: AgendarSessaoRequestDTO
): Promise<SessaoResponseDTO> {
  if (USAR_MOCK) {
    const duracao = dto.duracaoMinutos ?? 50;
    const conflito = haConflitoHorario(
      {
        psicologoId: PSICOLOGO_MOCK_ID,
        data: dto.data,
        horario: dto.horario,
        duracaoMinutos: duracao,
      },
      bancoSessoesMock
    );

    if (conflito) {
      throw new ApiError(
        409,
        `Conflito de horário: já existe uma consulta com ${conflito.pacienteNome} às ${conflito.horario}.`,
        [
          {
            campo: "horario",
            mensagem: `Horário ocupado por ${conflito.pacienteNome} (${conflito.horario}).`,
          },
        ]
      );
    }

    const paciente = PACIENTES_MOCK.find((p) => p.id === dto.pacienteId);
    if (!paciente) {
      throw new ApiError(
        404,
        "Paciente selecionado não encontrado ou sem vínculo com este psicólogo.",
        [{ campo: "pacienteId", mensagem: "Selecione um paciente válido." }]
      );
    }

    const nova: SessaoResponseDTO = {
      id: `ag-${Date.now()}`,
      pacienteId: paciente.id,
      pacienteNome: paciente.nome,
      psicologoId: PSICOLOGO_MOCK_ID,
      data: dto.data,
      horario: dto.horario,
      duracaoMinutos: duracao,
      modalidade: dto.modalidade,
      valor: dto.valor,
      status: "Agendada",
      statusPagamento: "Pendente",
      formaPagamento: null,
      observacoes: dto.observacoes?.trim() || undefined,
    };

    bancoSessoesMock.push(nova);
    return structuredClone(nova);
  }

  return fetchApi<SessaoResponseDTO>("/sessoes", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

// PUT /api/sessoes/{id}
export async function atualizarSessao(
  id: string,
  dto: AtualizarSessaoRequestDTO
): Promise<SessaoResponseDTO> {
  if (USAR_MOCK) {
    const indice = bancoSessoesMock.findIndex((s) => s.id === id);
    if (indice === -1) {
      throw new ApiError(404, "Sessão não encontrada.");
    }

    const atual = bancoSessoesMock[indice];
    const duracao = dto.duracaoMinutos ?? atual.duracaoMinutos;

    if (atual.status !== "Cancelada") {
      const conflito = haConflitoHorario(
        {
          psicologoId: atual.psicologoId,
          data: dto.data,
          horario: dto.horario,
          duracaoMinutos: duracao,
        },
        bancoSessoesMock,
        id
      );

      if (conflito) {
        throw new ApiError(
          409,
          `Conflito de horário: já existe uma consulta com ${conflito.pacienteNome} às ${conflito.horario}.`,
          [
            {
              campo: "horario",
              mensagem: `Horário ocupado por ${conflito.pacienteNome} (${conflito.horario}).`,
            },
          ]
        );
      }
    }

    const paciente = PACIENTES_MOCK.find((p) => p.id === dto.pacienteId);
    const atualizada: SessaoResponseDTO = {
      ...atual,
      pacienteId: dto.pacienteId,
      pacienteNome: paciente?.nome ?? atual.pacienteNome,
      data: dto.data,
      horario: dto.horario,
      duracaoMinutos: duracao,
      modalidade: dto.modalidade,
      valor: dto.valor,
      statusPagamento: dto.statusPagamento,
      formaPagamento:
        dto.statusPagamento === "Pago" ? (dto.formaPagamento ?? null) : null,
      observacoes: dto.observacoes?.trim() || undefined,
    };

    bancoSessoesMock[indice] = atualizada;
    return structuredClone(atualizada);
  }

  return fetchApi<SessaoResponseDTO>(`/sessoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

// PATCH /api/sessoes/{id}/cancelar (preserva o registro com status Cancelada)
export async function cancelarSessao(id: string): Promise<SessaoResponseDTO> {
  if (USAR_MOCK) {
    const indice = bancoSessoesMock.findIndex((s) => s.id === id);
    if (indice === -1) {
      throw new ApiError(404, "Sessão não encontrada.");
    }

    const atual = bancoSessoesMock[indice];
    if (atual.status === "Cancelada") {
      throw new ApiError(400, "Esta consulta já está cancelada.");
    }
    if (atual.status === "Concluida") {
      throw new ApiError(400, "Consultas já concluídas não podem ser canceladas.");
    }

    const cancelada: SessaoResponseDTO = {
      ...atual,
      status: "Cancelada",
    };

    bancoSessoesMock[indice] = cancelada;
    return structuredClone(cancelada);
  }

  return fetchApi<SessaoResponseDTO>(`/sessoes/${id}/cancelar`, {
    method: "PATCH",
  });
}

// PATCH /api/sessoes/{id}/concluir (habilita associação futura a evolução no Prontuário)
export async function concluirSessao(id: string): Promise<SessaoResponseDTO> {
  if (USAR_MOCK) {
    const indice = bancoSessoesMock.findIndex((s) => s.id === id);
    if (indice === -1) {
      throw new ApiError(404, "Sessão não encontrada.");
    }

    const atual = bancoSessoesMock[indice];
    if (atual.status === "Cancelada") {
      throw new ApiError(400, "Não é possível concluir uma consulta cancelada.");
    }
    if (atual.status === "Concluida") {
      throw new ApiError(400, "Esta consulta já está concluída.");
    }

    const concluida: SessaoResponseDTO = {
      ...atual,
      status: "Concluida",
    };

    bancoSessoesMock[indice] = concluida;
    return structuredClone(concluida);
  }

  return fetchApi<SessaoResponseDTO>(`/sessoes/${id}/concluir`, {
    method: "PATCH",
  });
}
