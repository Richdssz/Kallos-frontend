import type { FeriadoDTO } from "@/types/agenda/sessao";

const BRASIL_API_FERIADOS_URL =
  process.env.NEXT_PUBLIC_BRASIL_API_FERIADOS_URL ??
  "https://brasilapi.com.br/api/feriados/v1";

// Consulta feriados nacionais do ano informado na BrasilAPI.
// Em caso de indisponibilidade externa, retorna lista vazia para nunca bloquear o agendamento.
export async function buscarFeriadosPorAno(ano: number): Promise<FeriadoDTO[]> {
  if (!Number.isInteger(ano) || ano < 1900 || ano > 2199) {
    return [];
  }

  try {
    const resposta = await fetch(`${BRASIL_API_FERIADOS_URL}/${ano}`, {
      signal: AbortSignal.timeout(4000),
    });

    if (!resposta.ok) {
      return [];
    }

    const dados = (await resposta.json()) as FeriadoDTO[];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}
