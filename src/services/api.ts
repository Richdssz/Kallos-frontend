const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export interface CampoErro {
  campo: string;
  mensagem: string;
}

// Erro padronizado devolvido pela API REST.
export class ApiError extends Error {
  status: number;
  campos?: CampoErro[];

  constructor(status: number, mensagem: string, campos?: CampoErro[]) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.campos = campos;
  }
}

interface FetchApiOptions extends RequestInit {
  token?: string | null;
  timeoutMs?: number;
}

// Cliente HTTP único da aplicação.
// Centraliza URL base, cabeçalhos, timeout e conversão de erros HTTP.
export async function fetchApi<T>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<T> {
  const { token, timeoutMs = 1500, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type") && rest.body) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const resposta = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: requestHeaders,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!resposta.ok) {
    let mensagem = `Erro na requisição (${resposta.status})`;
    let campos: CampoErro[] | undefined;

    try { 
      const erroJson = (await resposta.json()) as {
        mensagem?: string;
        message?: string;
        campos?: CampoErro[];
      };
      mensagem = erroJson.mensagem ?? erroJson.message ?? mensagem;
      campos = erroJson.campos;
    } catch {
      // Resposta sem JSON válido
    }

    throw new ApiError(resposta.status, mensagem, campos);
  }

  // 204 No Content (ex: DELETE lógico) não possui corpo JSON
  if (resposta.status === 204) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
}
