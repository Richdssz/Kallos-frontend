"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { pacienteKeys } from "@/hooks/pacientes/usePacientes";
import { buscarFeriadosPorAno } from "@/services/agenda/feriadosService";
import {
  agendarSessao,
  atualizarSessao,
  cancelarSessao,
  concluirSessao,
  listarSessoesSemana,
} from "@/services/agenda/sessoesService";
import { ApiError } from "@/services/api";
import { useUiStore } from "@/store/uiStore";
import type {
  AgendarSessaoRequestDTO,
  AtualizarSessaoRequestDTO,
  FiltrosAgenda,
} from "@/types/agenda/sessao";

function tentarNovamenteSomenteErroServidor(count: number, erro: unknown) {
  return erro instanceof ApiError && erro.status >= 500 && count < 1;
}

export const agendaKeys = {
  all: ["sessoes"] as const,
  semana: (filtros: FiltrosAgenda) => ["sessoes", "semana", filtros] as const,
  feriados: (ano: number) => ["feriados", ano] as const,
};

function invalidarConsultasRelacionadas(
  queryClient: ReturnType<typeof useQueryClient>
) {
  queryClient.invalidateQueries({ queryKey: agendaKeys.all });
  queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
  queryClient.invalidateQueries({ queryKey: ["indicadores"] });
  queryClient.invalidateQueries({ queryKey: ["sessoes-hoje"] });
  queryClient.invalidateQueries({ queryKey: ["ritmo-mes"] });
}

// Consulta das sessões da semana selecionada (GET /api/sessoes).
export function useSessoesSemana(filtros: FiltrosAgenda) {
  return useQuery({
    queryKey: agendaKeys.semana(filtros),
    queryFn: () => listarSessoesSemana(filtros),
    placeholderData: keepPreviousData,
    retry: tentarNovamenteSomenteErroServidor,
  });
}

// Consulta de feriados nacionais do ano (BrasilAPI), cacheada em memória.
export function useFeriadosAno(ano: number) {
  return useQuery({
    queryKey: agendaKeys.feriados(ano),
    queryFn: () => buscarFeriadosPorAno(ano),
    enabled: Number.isInteger(ano) && ano >= 2000,
    staleTime: Infinity,
    retry: false,
  });
}

// Agendamento de nova sessão (POST /api/sessoes).
export function useAgendarSessao() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (dto: AgendarSessaoRequestDTO) => agendarSessao(dto),
    onSuccess: () => {
      invalidarConsultasRelacionadas(queryClient);
      mostrarNotificacao("sucesso", "Sessão agendada com sucesso!");
    },
  });
}

// Edição, remarcação e registro administrativo de pagamento (PUT /api/sessoes/{id}).
export function useAtualizarSessao() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: AtualizarSessaoRequestDTO;
    }) => atualizarSessao(id, dto),
    onSuccess: () => {
      invalidarConsultasRelacionadas(queryClient);
      mostrarNotificacao("sucesso", "Consulta atualizada com sucesso!");
    },
  });
}

// Cancelamento lógico de consulta (PATCH /api/sessoes/{id}/cancelar).
export function useCancelarSessao() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (id: string) => cancelarSessao(id),
    onSuccess: () => {
      invalidarConsultasRelacionadas(queryClient);
      mostrarNotificacao(
        "aviso",
        "Consulta cancelada. O registro foi mantido no histórico."
      );
    },
  });
}

// Conclusão de consulta (PATCH /api/sessoes/{id}/concluir).
export function useConcluirSessao() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (id: string) => concluirSessao(id),
    onSuccess: () => {
      invalidarConsultasRelacionadas(queryClient);
      mostrarNotificacao(
        "sucesso",
        "Consulta concluída! Agora elegível para registro no Prontuário."
      );
    },
  });
}
