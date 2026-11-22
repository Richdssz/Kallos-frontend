import type { SessaoResponseDTO } from "@/types/agenda/sessao";

export interface DiaUtilSemana {
  iso: string; // YYYY-MM-DD
  diaSemanaCurto: string; // Seg, Ter, Qua, Qui, Sex
  diaSemanaLongo: string; // Segunda-feira, ...
  diaNumero: number; // 1..31
  mesCurto: string; // jan., fev., ...
  ehHoje: boolean;
}

const DIAS_CURTOS = ["Seg", "Ter", "Qua", "Qui", "Sex"] as const;
const DIAS_LONGOS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
] as const;

// Formata uma Date para YYYY-MM-DD usando o fuso local (evita desvio de UTC).
export function formatarDataISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Faz parse seguro de YYYY-MM-DD ao meio-dia local (evita deslocamento por fuso).
export function parseDataISO(iso: string): Date {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, (mes || 1) - 1, dia || 1, 12, 0, 0);
}

// Retorna a segunda-feira correspondente à semana da data informada.
// Se a data cair no sábado (6) ou domingo (0), ancora na segunda-feira daquela semana civil
// (ou próxima segunda quando domingo, mantendo segunda a sexta coerente com a semana ISO).
export function obterSegundaDaSemana(referencia: Date = new Date()): Date {
  const copia = new Date(
    referencia.getFullYear(),
    referencia.getMonth(),
    referencia.getDate(),
    12,
    0,
    0
  );
  const diaSemana = copia.getDay(); // 0=Dom, 1=Seg, ..., 6=Sab
  const diferencaParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  copia.setDate(copia.getDate() + diferencaParaSegunda);
  return copia;
}

export function avancarSemana(segundaAtual: Date, deltaSemanas: number): Date {
  const nova = new Date(segundaAtual.getTime());
  nova.setDate(nova.getDate() + deltaSemanas * 7);
  return nova;
}

export function obterDiasUteisSemana(segunda: Date): DiaUtilSemana[] {
  const hojeIso = formatarDataISO(new Date());
  const formatadorMes = new Intl.DateTimeFormat("pt-BR", { month: "short" });

  return DIAS_CURTOS.map((diaSemanaCurto, indice) => {
    const data = new Date(segunda.getTime());
    data.setDate(segunda.getDate() + indice);
    const iso = formatarDataISO(data);

    return {
      iso,
      diaSemanaCurto,
      diaSemanaLongo: DIAS_LONGOS[indice],
      diaNumero: data.getDate(),
      mesCurto: formatadorMes.format(data),
      ehHoje: iso === hojeIso,
    };
  });
}

// Calcula o número da semana ISO-8601 (1 a 53).
export function obterNumeroSemanaISO(data: Date): number {
  const copia = new Date(
    Date.UTC(data.getFullYear(), data.getMonth(), data.getDate())
  );
  const diaSemana = copia.getUTCDay() || 7;
  copia.setUTCDate(copia.getUTCDate() + 4 - diaSemana);
  const inicioAno = new Date(Date.UTC(copia.getUTCFullYear(), 0, 1));
  return Math.ceil(((copia.getTime() - inicioAno.getTime()) / 86400000 + 1) / 7);
}

// Ex.: "17 a 21 de nov. de 2026" ou "29 de set. a 3 de out. de 2026"
export function formatarIntervaloSemana(segunda: Date): string {
  const sexta = new Date(segunda.getTime());
  sexta.setDate(segunda.getDate() + 4);

  const fmtMes = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const diaIni = segunda.getDate();
  const diaFim = sexta.getDate();
  const mesIni = fmtMes.format(segunda);
  const mesFim = fmtMes.format(sexta);
  const anoIni = segunda.getFullYear();
  const anoFim = sexta.getFullYear();

  if (anoIni !== anoFim) {
    return `${diaIni} de ${mesIni} de ${anoIni} a ${diaFim} de ${mesFim} de ${anoFim}`;
  }

  if (mesIni === mesFim) {
    return `${diaIni} a ${diaFim} de ${mesFim} de ${anoFim}`;
  }

  return `${diaIni} de ${mesIni} a ${diaFim} de ${mesFim} de ${anoFim}`;
}

export function formatarDataExtensoBR(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const data = parseDataISO(iso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}

export function horarioParaMinutos(horario: string): number {
  const [horas, minutos] = horario.split(":").map(Number);
  return (horas || 0) * 60 + (minutos || 0);
}

// Verifica sobreposição de horário para o mesmo psicólogo (sessões canceladas liberam o horário).
export function haConflitoHorario(
  candidata: {
    psicologoId: string;
    data: string;
    horario: string;
    duracaoMinutos: number;
  },
  existentes: SessaoResponseDTO[],
  ignorarId?: string
): SessaoResponseDTO | undefined {
  const inicioNovo = horarioParaMinutos(candidata.horario);
  const fimNovo = inicioNovo + candidata.duracaoMinutos;

  return existentes.find((sessao) => {
    if (ignorarId && sessao.id === ignorarId) return false;
    if (sessao.status === "Cancelada") return false;
    if (sessao.psicologoId !== candidata.psicologoId) return false;
    if (sessao.data !== candidata.data) return false;

    const inicioExistente = horarioParaMinutos(sessao.horario);
    const fimExistente = inicioExistente + sessao.duracaoMinutos;

    return inicioNovo < fimExistente && fimNovo > inicioExistente;
  });
}

export function formatarMoedaBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function parseValorMonetarioBR(texto: string): number {
  const limpo = texto
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:[.,]|$))/g, "")
    .replace(",", ".");
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : NaN;
}

export const HORARIOS_GRADE_PADRAO = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
] as const;
