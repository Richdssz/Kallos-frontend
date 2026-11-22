"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/services/api";
import {
  atualizarPaciente,
  buscarPacientePorId,
  criarPaciente,
  desativarPaciente,
  FiltrosPacientes,
  listarPacientes,
  listarSessoesPaciente,
  reativarPaciente,
} from "@/services/pacientesService";
import { useUiStore } from "@/store/uiStore";
import { PacienteRequestDTO } from "@/types/paciente";

function tentarNovamenteSomenteErroServidor(count: number, erro: unknown) {
  return erro instanceof ApiError && erro.status >= 500 && count < 1;
}

// Chaves de cache centralizadas para o TanStack Query.
// Sempre que uma mutação altera dados no servidor, invalidamos essas chaves.
export const pacienteKeys = {
  all: ["pacientes"] as const,
  lista: (filtros: FiltrosPacientes) => ["pacientes", "lista", filtros] as const,
  detalhe: (id: string) => ["pacientes", "detalhe", id] as const,
  sessoes: (id: string) => ["pacientes", "sessoes", id] as const,
};

// Consulta paginada de pacientes (GET /api/pacientes).
export function usePacientes(filtros: FiltrosPacientes) {
  return useQuery({
    queryKey: pacienteKeys.lista(filtros),
    queryFn: () => listarPacientes(filtros),
    // Mantém a página anterior visível enquanto a próxima carrega (sem piscar a tabela).
    placeholderData: keepPreviousData,
    retry: tentarNovamenteSomenteErroServidor,
  });
}

// Consulta dos dados completos de 1 paciente (GET /api/pacientes/{id}).
export function usePaciente(id: string) {
  return useQuery({
    queryKey: pacienteKeys.detalhe(id),
    queryFn: () => buscarPacientePorId(id),
    enabled: Boolean(id),
    retry: tentarNovamenteSomenteErroServidor,
  });
}

// Histórico de sessões vinculadas ao paciente (GET /api/pacientes/{id}/sessoes).
export function useSessoesPaciente(id: string) {
  return useQuery({
    queryKey: pacienteKeys.sessoes(id),
    queryFn: () => listarSessoesPaciente(id),
    enabled: Boolean(id),
    retry: tentarNovamenteSomenteErroServidor,
  });
}

// Mutação de criação (POST /api/pacientes).
export function useCriarPaciente() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (dto: PacienteRequestDTO) => criarPaciente(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
      mostrarNotificacao("sucesso", "Paciente cadastrado com sucesso!");
    },
  });
}

// Mutação de atualização (PUT /api/pacientes/{id}).
export function useAtualizarPaciente(id: string) {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (dto: PacienteRequestDTO) => atualizarPaciente(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.detalhe(id) });
      mostrarNotificacao("sucesso", "Cadastro atualizado com sucesso!");
    },
  });
}

// Mutação de desativação lógica (DELETE /api/pacientes/{id}).
export function useDesativarPaciente() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (id: string) => desativarPaciente(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.detalhe(id) });
      mostrarNotificacao("sucesso", "Paciente desativado com sucesso.");
    },
  });
}

// Mutação de reativação (PATCH /api/pacientes/{id}/reativar).
export function useReativarPaciente() {
  const queryClient = useQueryClient();
  const mostrarNotificacao = useUiStore((s) => s.mostrarNotificacao);

  return useMutation({
    mutationFn: (id: string) => reativarPaciente(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: pacienteKeys.all });
      queryClient.invalidateQueries({ queryKey: pacienteKeys.detalhe(id) });
      mostrarNotificacao("sucesso", "Paciente reativado com sucesso!");
    },
  });
}
