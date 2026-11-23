export interface EnderecoBrasilApi {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface BrasilApiCepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood?: string;
  street?: string;
}

const BRASIL_API_CEP_URL =
  process.env.NEXT_PUBLIC_BRASIL_API_CEP_URL ??
  "https://brasilapi.com.br/api/cep/v2";

// Consulta endereço automático na BrasilAPI (CEP v2) quando o CEP possui 8 dígitos.
export async function buscarEnderecoPorCep(
  cep: string
): Promise<EnderecoBrasilApi> {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    throw new Error("Informe um CEP com 8 dígitos.");
  }

  const resposta = await fetch(`${BRASIL_API_CEP_URL}/${cepLimpo}`, {
    signal: AbortSignal.timeout(4000),
  });

  if (!resposta.ok) {
    throw new Error("CEP não encontrado.");
  }

  const dados = (await resposta.json()) as BrasilApiCepResponse;

  return {
    logradouro: dados.street ?? "",
    bairro: dados.neighborhood ?? "",
    cidade: dados.city ?? "",
    uf: dados.state ?? "",
  };
}
