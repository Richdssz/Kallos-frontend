"use client";

import {
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  Video,
  XCircle,
} from "lucide-react";
import type { SessaoResponseDTO, StatusSessao } from "@/types/agenda/sessao";
import { formatarMoedaBRL } from "@/utils/agendaDatas";

interface CartaoSessaoProps {
  sessao: SessaoResponseDTO;
  onSelecionar: (sessao: SessaoResponseDTO) => void;
  compacto?: boolean;
}

const ESTILO_STATUS: Record<
  StatusSessao,
  {
    rotulo: string;
    bordaCard: string;
    badge: string;
    icone: typeof Clock;
  }
> = {
  Agendada: {
    rotulo: "Agendada",
    bordaCard: "border-l-[#334936] bg-white hover:bg-[#FAF6F2]",
    badge: "border border-[#E6ECE2] bg-[#FAF6F2] text-[#334936]",
    icone: Clock,
  },
  EmAndamento: {
    rotulo: "Em andamento",
    bordaCard: "border-l-[#486b4f] bg-[#E6ECE2]/35 hover:bg-[#E6ECE2]/55",
    badge: "border border-[#ACBFA9] bg-[#E6ECE2] text-[#1D2C20]",
    icone: Radio,
  },
  Concluida: {
    rotulo: "Concluída",
    bordaCard: "border-l-[#556650] bg-[#FAF6F2]/75 hover:bg-[#E6ECE2]/40",
    badge: "border border-[#ACBFA9]/70 bg-[#E6ECE2]/85 text-[#1D2C20]",
    icone: CheckCircle2,
  },
  Cancelada: {
    rotulo: "Cancelada",
    bordaCard: "border-l-[#C55B5B] bg-[#FDF7F7]/80 hover:bg-[#FDECEC]/70 opacity-85",
    badge: "border border-[#F3C8C8] bg-[#FDECEC] text-[#8E2A2A]",
    icone: XCircle,
  },
};

export function CartaoSessao({
  sessao,
  onSelecionar,
  compacto = false,
}: CartaoSessaoProps) {
  const estilo = ESTILO_STATUS[sessao.status];
  const IconeStatus = estilo.icone;
  const formaLabel =
    sessao.formaPagamento === "Cartao"
      ? "Cartão"
      : sessao.formaPagamento ?? "";

  return (
    <button
      type="button"
      onClick={() => onSelecionar(sessao)}
      aria-label={`Gerenciar consulta de ${sessao.pacienteNome}, ${sessao.horario}, ${sessao.modalidade}, ${sessao.duracaoMinutos} minutos, status ${estilo.rotulo}`}
      className={`group flex w-full flex-col rounded-xl border border-[#E6ECE2] border-l-[3px] text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
        compacto ? "gap-1.5 p-2.5" : "gap-2 p-3.5"
      } ${estilo.bordaCard}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`font-mono text-xs font-semibold tabular-nums ${
            sessao.status === "Cancelada"
              ? "text-[#8E2A2A] line-through"
              : "text-[#334936]"
          }`}
        >
          {sessao.horario}
          <span className="font-normal text-[#556650]">
            {" "}
            · {sessao.duracaoMinutos} min
          </span>
        </span>

        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${estilo.badge}`}
        >
          <IconeStatus className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          <span>{estilo.rotulo}</span>
        </span>
      </div>

      <p
        className={`truncate font-semibold text-[#1D2C20] group-hover:text-[#334936] ${
          compacto ? "text-xs" : "text-sm"
        }`}
      >
        {sessao.pacienteNome}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-[#556650]">
        <span className="inline-flex items-center gap-1">
          {sessao.modalidade === "Presencial" ? (
            <MapPin className="h-3 w-3 shrink-0 text-[#7F8F7A]" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Video className="h-3 w-3 shrink-0 text-[#7F8F7A]" strokeWidth={1.75} aria-hidden="true" />
          )}
          <span>{sessao.modalidade}</span>
        </span>

        <span
          className={`font-mono tabular-nums ${
            sessao.statusPagamento === "Pago"
              ? "font-medium text-[#334936]"
              : "text-[#7F8F7A]"
          }`}
          title={
            sessao.statusPagamento === "Pago" && formaLabel
              ? `Pago via ${formaLabel}`
              : `Pagamento ${sessao.statusPagamento.toLowerCase()}`
          }
        >
          {sessao.statusPagamento === "Pago"
            ? formaLabel
              ? `Pago · ${formaLabel}`
              : "Pago"
            : formatarMoedaBRL(sessao.valor)}
        </span>
      </div>
    </button>
  );
}
