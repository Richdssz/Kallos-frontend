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
    card: string;
    badge: string;
    icone: typeof Clock;
  }
> = {
  Agendada: {
    rotulo: "Agendada",
    card: "border-l-[#334936] bg-white hover:border-[#ACBFA9] hover:bg-[#FAF6F2]/70",
    badge: "border border-[#E6ECE2] bg-[#FAF6F2] text-[#334936]",
    icone: Clock,
  },
  EmAndamento: {
    rotulo: "Em andamento",
    card: "border-l-[#486b4f] bg-[#E6ECE2]/40 hover:border-[#334936]/50 hover:bg-[#E6ECE2]/65",
    badge: "border border-[#ACBFA9] bg-[#E6ECE2] text-[#1D2C20]",
    icone: Radio,
  },
  Concluida: {
    rotulo: "Concluída",
    card: "border-l-[#6B7E68] bg-[#FAF6F2]/80 hover:border-[#ACBFA9] hover:bg-[#E6ECE2]/35",
    badge: "border border-[#ACBFA9]/70 bg-[#E6ECE2]/85 text-[#1D2C20]",
    icone: CheckCircle2,
  },
  Cancelada: {
    rotulo: "Cancelada",
    card: "border-l-[#C55B5B] bg-[#FDF7F7]/85 hover:border-[#E5A9A9] hover:bg-[#FDECEC]/70 opacity-85",
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
      className={`group flex w-full flex-col rounded-xl border border-[#E6ECE2] border-l-[3px] text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_rgba(29,44,32,0.14)] active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
        compacto ? "gap-1.5 p-2.5" : "gap-2 p-3.5"
      } ${estilo.card}`}
    >
      <div className="flex items-center justify-between gap-2">
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
            · {sessao.duracaoMinutos}m
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
        className={`truncate font-semibold tracking-tight text-[#1D2C20] transition-colors group-hover:text-[#334936] ${
          compacto ? "text-[13px] leading-snug" : "text-sm leading-snug"
        }`}
      >
        {sessao.pacienteNome}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-[#E6ECE2]/70 pt-1.5 text-[11px] text-[#556650]">
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
              ? "font-semibold text-[#334936]"
              : "text-[#556650]"
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
