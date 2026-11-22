"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Plus } from "lucide-react";
import type { FeriadoDTO, SessaoResponseDTO } from "@/types/agenda/sessao";
import {
  DiaUtilSemana,
  HORARIOS_GRADE_PADRAO,
} from "@/utils/agendaDatas";
import { CartaoSessao } from "./CartaoSessao";

interface GradeSemanalProps {
  diasSemana: DiaUtilSemana[];
  sessoes: SessaoResponseDTO[];
  feriadosPorData: Map<string, FeriadoDTO>;
  carregando: boolean;
  onSelecionarSessao: (sessao: SessaoResponseDTO) => void;
  onAgendarNoHorario: (data: string, horario: string) => void;
}

function extrairFaixaHora(horario: string): string {
  const hora = horario.slice(0, 2);
  return `${hora}:00`;
}

export function GradeSemanal({
  diasSemana,
  sessoes,
  feriadosPorData,
  carregando,
  onSelecionarSessao,
  onAgendarNoHorario,
}: GradeSemanalProps) {
  const diaPadraoMobile = useMemo(() => {
    const hoje = diasSemana.find((d) => d.ehHoje);
    return hoje?.iso ?? diasSemana[0]?.iso ?? "";
  }, [diasSemana]);

  const [diaMobileSelecionado, setDiaMobileSelecionado] =
    useState<string>(diaPadraoMobile);

  useEffect(() => {
    if (!diasSemana.some((d) => d.iso === diaMobileSelecionado)) {
      setDiaMobileSelecionado(diaPadraoMobile);
    }
  }, [diasSemana, diaMobileSelecionado, diaPadraoMobile]);

  // Garante que horários fora da grade padrão (ex.: 07:30 ou 20:00 vindos da API) também sejam exibidos.
  const faixasHorarias = useMemo(() => {
    const conjunto = new Set<string>(HORARIOS_GRADE_PADRAO);
    sessoes.forEach((s) => {
      if (/^\d{2}:\d{2}$/.test(s.horario)) {
        conjunto.add(extrairFaixaHora(s.horario));
      }
    });
    return Array.from(conjunto).sort((a, b) => a.localeCompare(b));
  }, [sessoes]);

  // Agrupa sessões por (data + faixaHora) para renderização O(1) na grade desktop.
  const sessoesPorCelula = useMemo(() => {
    const mapa = new Map<string, SessaoResponseDTO[]>();
    sessoes.forEach((sessao) => {
      const chave = `${sessao.data}__${extrairFaixaHora(sessao.horario)}`;
      const atuais = mapa.get(chave) ?? [];
      atuais.push(sessao);
      mapa.set(chave, atuais);
    });
    return mapa;
  }, [sessoes]);

  // Contagem e lista por dia (usada no mobile >= 360px).
  const sessoesPorDia = useMemo(() => {
    const mapa = new Map<string, SessaoResponseDTO[]>();
    diasSemana.forEach((d) => mapa.set(d.iso, []));
    sessoes.forEach((s) => {
      const lista = mapa.get(s.data);
      if (lista) lista.push(s);
    });
    return mapa;
  }, [diasSemana, sessoes]);

  if (carregando) {
    return (
      <section
        aria-label="Carregando agenda semanal"
        aria-busy="true"
        className="overflow-hidden rounded-2xl border border-[#E6ECE2] bg-white"
      >
        <div className="hidden lg:block">
          <div className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] border-b border-[#E6ECE2] bg-[#FAF6F2]">
            <div className="p-3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-l border-[#E6ECE2] p-3">
                <div className="h-3.5 w-16 animate-pulse rounded bg-[#E6ECE2]" />
                <div className="mt-1.5 h-4 w-20 animate-pulse rounded bg-[#E6ECE2]/80" />
              </div>
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] border-b border-[#E6ECE2] last:border-b-0"
            >
              <div className="flex items-start justify-center p-3">
                <div className="h-3.5 w-10 animate-pulse rounded bg-[#E6ECE2]" />
              </div>
              {[0, 1, 2, 3, 4].map((col) => (
                <div
                  key={col}
                  className="min-h-[82px] border-l border-[#E6ECE2] p-2"
                >
                  {(row + col) % 3 === 0 && (
                    <div className="h-16 animate-pulse rounded-xl bg-[#E6ECE2]/60" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-[#E6ECE2]/70"
              />
            ))}
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-[#E6ECE2]/60"
            />
          ))}
        </div>
      </section>
    );
  }

  const diaMobileObj =
    diasSemana.find((d) => d.iso === diaMobileSelecionado) ?? diasSemana[0];
  const sessoesDiaMobile = diaMobileObj
    ? (sessoesPorDia.get(diaMobileObj.iso) ?? [])
    : [];
  const feriadoMobile = diaMobileObj
    ? feriadosPorData.get(diaMobileObj.iso)
    : undefined;

  return (
    <section
      aria-label="Grade semanal de consultas"
      className="overflow-hidden rounded-2xl border border-[#E6ECE2] bg-white shadow-xs"
    >
      {/* VISUALIZAÇÃO DESKTOP (Segunda a Sexta por faixas horárias) */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-[76px_repeat(5,minmax(0,1fr))] border-b border-[#E6ECE2] bg-[#FAF6F2]">
          <div className="flex items-center justify-center p-3 text-[11px] font-semibold tracking-wider text-[#556650] uppercase">
            Hora
          </div>
          {diasSemana.map((dia) => {
            const feriado = feriadosPorData.get(dia.iso);
            const qtdDia = sessoesPorDia.get(dia.iso)?.length ?? 0;

            return (
              <div
                key={dia.iso}
                className={`border-l border-[#E6ECE2] px-3 py-3 ${
                  dia.ehHoje ? "bg-[#E6ECE2]/65" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        dia.ehHoje ? "text-[#334936]" : "text-[#556650]"
                      }`}
                    >
                      {dia.diaSemanaCurto}
                      {dia.ehHoje && (
                        <span className="ml-1.5 rounded bg-[#334936] px-1.5 py-0.5 text-[10px] font-medium text-[#FAF6F2] normal-case">
                          Hoje
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-[#1D2C20] tabular-nums">
                      {String(dia.diaNumero).padStart(2, "0")} {dia.mesCurto}
                    </p>
                  </div>

                  {qtdDia > 0 && (
                    <span className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-medium text-[#556650] border border-[#E6ECE2] tabular-nums">
                      {qtdDia}
                    </span>
                  )}
                </div>

                {feriado && (
                  <div
                    className="mt-2 flex items-center gap-1 truncate rounded-md border border-amber-300/70 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900"
                    title={`Feriado: ${feriado.name}`}
                  >
                    <Calendar className="h-3 w-3 shrink-0 text-amber-700" aria-hidden="true" />
                    <span className="truncate">{feriado.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="divide-y divide-[#E6ECE2]">
          {faixasHorarias.map((faixa) => (
            <div
              key={faixa}
              className="grid grid-cols-[76px_repeat(5,minmax(0,1fr))]"
            >
              <div className="flex items-start justify-center bg-[#FAF6F2]/40 px-2 py-3">
                <span className="font-mono text-xs font-medium text-[#556650] tabular-nums">
                  {faixa}
                </span>
              </div>

              {diasSemana.map((dia) => {
                const chave = `${dia.iso}__${faixa}`;
                const celulaSessoes = sessoesPorCelula.get(chave) ?? [];

                return (
                  <div
                    key={chave}
                    className={`group/cell relative min-h-[78px] border-l border-[#E6ECE2] p-2 transition-colors ${
                      dia.ehHoje ? "bg-[#E6ECE2]/20" : "bg-white"
                    }`}
                  >
                    {celulaSessoes.length > 0 ? (
                      <div className="space-y-1.5">
                        {celulaSessoes.map((sessao) => (
                          <CartaoSessao
                            key={sessao.id}
                            sessao={sessao}
                            onSelecionar={onSelecionarSessao}
                            compacto
                          />
                        ))}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAgendarNoHorario(dia.iso, faixa)}
                        aria-label={`Agendar sessão em ${dia.diaSemanaLongo}, dia ${dia.diaNumero}, às ${faixa}`}
                        className="flex h-full min-h-[60px] w-full items-center justify-center rounded-lg border border-transparent text-xs text-transparent transition-colors hover:border-dashed hover:border-[#ACBFA9] hover:bg-[#FAF6F2] hover:text-[#556650] focus-visible:border-dashed focus-visible:border-[#334936] focus-visible:bg-[#FAF6F2] focus-visible:text-[#334936] focus-visible:outline-none"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        <span>Agendar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* VISUALIZAÇÃO MOBILE / TABLET (utilizável a partir de 360px) */}
      <div className="p-3 sm:p-4 lg:hidden">
        <div
          role="tablist"
          aria-label="Selecionar dia útil da semana"
          className="grid grid-cols-5 gap-1.5"
        >
          {diasSemana.map((dia) => {
            const selecionado = dia.iso === diaMobileSelecionado;
            const qtd = sessoesPorDia.get(dia.iso)?.length ?? 0;
            const ehFeriado = feriadosPorData.has(dia.iso);

            return (
              <button
                key={dia.iso}
                type="button"
                role="tab"
                aria-selected={selecionado}
                onClick={() => setDiaMobileSelecionado(dia.iso)}
                className={`relative flex flex-col items-center rounded-xl border px-1.5 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
                  selecionado
                    ? "border-[#334936] bg-[#334936] text-[#FAF6F2]"
                    : dia.ehHoje
                      ? "border-[#ACBFA9] bg-[#E6ECE2]/60 text-[#1D2C20]"
                      : "border-[#E6ECE2] bg-[#FAF6F2] text-[#556650] hover:border-[#ACBFA9]"
                }`}
              >
                <span className="text-[11px] font-medium uppercase">
                  {dia.diaSemanaCurto}
                </span>
                <span className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                  {String(dia.diaNumero).padStart(2, "0")}
                </span>
                <div className="mt-1 flex items-center gap-1">
                  {qtd > 0 && (
                    <span
                      className={`rounded-full px-1.5 text-[10px] font-mono tabular-nums ${
                        selecionado
                          ? "bg-[#FAF6F2]/20 text-[#FAF6F2]"
                          : "bg-[#E6ECE2] text-[#1D2C20]"
                      }`}
                    >
                      {qtd}
                    </span>
                  )}
                  {ehFeriado && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-amber-500"
                      title={feriadosPorData.get(dia.iso)?.name}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {diaMobileObj && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#1D2C20]">
                  {diaMobileObj.diaSemanaLongo},{" "}
                  {String(diaMobileObj.diaNumero).padStart(2, "0")}{" "}
                  {diaMobileObj.mesCurto}
                </h3>
                {feriadoMobile && (
                  <p className="mt-0.5 text-xs font-medium text-amber-800">
                    Feriado: {feriadoMobile.name}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onAgendarNoHorario(diaMobileObj.iso, "09:00")}
                className="inline-flex items-center gap-1 rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] px-2.5 py-1.5 text-xs font-medium text-[#334936] hover:bg-[#E6ECE2]/60"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Agendar</span>
              </button>
            </div>

            {sessoesDiaMobile.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E6ECE2] bg-[#FAF6F2]/50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-[#1D2C20]">
                  Nenhuma consulta neste dia
                </p>
                <p className="mt-1 text-xs text-[#556650]">
                  Toque em &quot;Agendar&quot; para adicionar um atendimento em{" "}
                  {diaMobileObj.diaSemanaLongo.toLowerCase()}.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessoesDiaMobile.map((sessao) => (
                  <CartaoSessao
                    key={sessao.id}
                    sessao={sessao}
                    onSelecionar={onSelecionarSessao}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
