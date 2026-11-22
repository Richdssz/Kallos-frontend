import { useState } from 'react';
import { AlertTriangle, BarChart3, RotateCw } from 'lucide-react';
import type { RitmoMes } from '../types/painel';

interface RitmoMesCardProps {
  ritmo?: RitmoMes;
  carregando: boolean;
  erro?: boolean;
  onTentarNovamente?: () => void;
}

export function RitmoMesCard({
  ritmo,
  carregando,
  erro = false,
  onTentarNovamente,
}: RitmoMesCardProps) {
  const [semanaFocada, setSemanaFocada] = useState<number | null>(null);

  if (erro && !carregando) {
    return (
      <section
        role="alert"
        aria-label="Erro ao carregar ritmo do mês"
        className="flex flex-col items-center justify-center rounded-xl border border-[#F3C8C8] bg-white px-6 py-14 text-center"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDF2F2] text-[#8E2A2A]">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h2 className="mt-3 text-base font-semibold text-[#1D2C20]">
          Ritmo do mês indisponível
        </h2>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#556650]">
          Não foi possível carregar o gráfico semanal agora. Os seus
          atendimentos de hoje continuam acessíveis ao lado.
        </p>
        {onTentarNovamente && (
          <button
            type="button"
            onClick={onTentarNovamente}
            className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[#334936] px-4 py-2 text-xs font-medium text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Recarregar gráfico</span>
          </button>
        )}
      </section>
    );
  }

  if (carregando || !ritmo) {
    return (
      <section
        aria-label="Carregando ritmo do mês"
        aria-busy="true"
        className="flex flex-col rounded-xl border border-[#E6ECE2] bg-white p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-[#E6ECE2]" />
            <div className="h-3.5 w-44 animate-pulse rounded bg-[#E6ECE2]/75" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-[#E6ECE2]/80" />
        </div>

        <div className="mt-8 flex h-44 items-end justify-between gap-3 border-b border-[#E6ECE2] pb-3">
          {[55, 72, 90, 35, 18].map((altura, idx) => (
            <div
              key={idx}
              className="flex flex-1 flex-col items-center justify-end gap-2"
            >
              <div
                className="w-full max-w-[40px] animate-pulse rounded-t-md bg-[#E6ECE2]"
                style={{ height: `${altura}%` }}
              />
              <div className="h-3 w-10 animate-pulse rounded bg-[#E6ECE2]/75" />
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-[#E6ECE2]/75" />
            <div className="h-6 w-12 animate-pulse rounded bg-[#E6ECE2]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-20 animate-pulse rounded bg-[#E6ECE2]/75" />
            <div className="h-6 w-12 animate-pulse rounded bg-[#E6ECE2]" />
          </div>
        </div>
      </section>
    );
  }

  const maxRealizadas = Math.max(
    ...ritmo.semanas.map((s) => s.realizadas),
    1,
  );

  const semanaAtiva =
    ritmo.semanas.find((s) => s.semanaNumero === semanaFocada) ??
    ritmo.semanas.find((s) => s.ehMaiorVolume) ??
    ritmo.semanas[0];

  const posicaoLinhaMedia = Math.min(
    Math.max(Math.round((ritmo.mediaSemanal / maxRealizadas) * 100), 10),
    92,
  );

  const sinalVariacao =
    ritmo.variacaoMesAnteriorPercentual >= 0 ? '+' : '';

  return (
    <section
      aria-label="Ritmo do mês"
      className="flex flex-col rounded-xl border border-[#E6ECE2] bg-white p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1D2C20]">
            Ritmo do mês
          </h2>
          <p className="mt-0.5 text-xs text-[#556650] tabular-nums">
            {ritmo.mesReferencia}
            <span aria-hidden="true"> · </span>
            <span className="font-medium text-[#334936]">
              {sinalVariacao}
              {ritmo.variacaoMesAnteriorPercentual}% vs. mês anterior
            </span>
          </p>
        </div>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6ECE2]/70 text-[#334936]"
          aria-hidden="true"
        >
          <BarChart3 className="h-4 w-4" strokeWidth={1.75} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg bg-[#FAF6F2] px-3.5 py-2.5 text-xs">
        <span className="font-medium text-[#556650]">
          {semanaFocada !== null ? 'Semana selecionada' : 'Maior volume do mês'}
        </span>
        <span className="font-mono font-semibold text-[#1D2C20] tabular-nums">
          {semanaAtiva.label} ({semanaAtiva.intervalo}) · {semanaAtiva.realizadas}{' '}
          {semanaAtiva.realizadas === 1 ? 'sessão' : 'sessões'}
        </span>
      </div>

      <div className="relative mt-6 border-b border-[#E6ECE2] pb-3">
        <div
          className="relative flex h-48 items-end justify-between gap-2.5"
          role="list"
          aria-label="Sessões realizadas por semana"
        >
          <div
            className="pointer-events-none absolute right-0 left-0 z-0 border-t border-dashed border-[#7F8F7A]/70"
            style={{ bottom: `calc(${posicaoLinhaMedia}% * 0.72 + 24px)` }}
            aria-hidden="true"
          >
            <span className="absolute -top-4 right-0 rounded bg-[#FAF6F2] px-1.5 font-mono text-[10px] font-medium text-[#556650] tabular-nums">
              Média {ritmo.mediaSemanal.toLocaleString('pt-BR')}/sem
            </span>
          </div>

          {ritmo.semanas.map((semana) => {
            const alturaPercentual =
              semana.realizadas === 0
                ? 4
                : Math.max(
                    Math.round((semana.realizadas / maxRealizadas) * 100),
                    12,
                  );
            const selecionada = semanaFocada === semana.semanaNumero;

            return (
              <button
                key={semana.semanaNumero}
                type="button"
                role="listitem"
                onMouseEnter={() => setSemanaFocada(semana.semanaNumero)}
                onMouseLeave={() => setSemanaFocada(null)}
                onFocus={() => setSemanaFocada(semana.semanaNumero)}
                onBlur={() => setSemanaFocada(null)}
                onClick={() =>
                  setSemanaFocada((prev) =>
                    prev === semana.semanaNumero ? null : semana.semanaNumero,
                  )
                }
                aria-label={`${semana.label} (${semana.intervalo}): ${semana.realizadas} sessões realizadas${
                  semana.ehMaiorVolume ? ', semana de maior volume' : ''
                }`}
                className="group relative z-10 flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-lg px-1 pt-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
              >
                <span
                  className={`font-mono text-xs tabular-nums transition-colors ${
                    semana.ehMaiorVolume || selecionada
                      ? 'font-semibold text-[#1D2C20]'
                      : 'font-medium text-[#556650]'
                  }`}
                >
                  {semana.realizadas}
                </span>

                <div className="flex w-full flex-1 items-end justify-center">
                  <div
                    className={`w-full max-w-[40px] rounded-t-md transition-all duration-200 ${
                      semana.ehMaiorVolume
                        ? 'bg-[#334936] group-hover:bg-[#1D2C20]'
                        : semana.realizadas === 0
                          ? 'bg-[#E6ECE2]'
                          : 'bg-[#ACBFA9] group-hover:bg-[#7F8F7A]'
                    } ${selecionada ? 'ring-2 ring-[#334936]/30 ring-offset-1' : ''}`}
                    style={{ height: `${alturaPercentual}%` }}
                  />
                </div>

                <span
                  className={`text-xs whitespace-nowrap ${
                    semana.ehMaiorVolume
                      ? 'font-semibold text-[#1D2C20]'
                      : 'font-medium text-[#556650]'
                  }`}
                >
                  {semana.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-[#556650]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-xs bg-[#334936]"
            aria-hidden="true"
          />
          Maior volume
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-xs bg-[#ACBFA9]"
            aria-hidden="true"
          />
          Demais semanas
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-3 border-t border-dashed border-[#7F8F7A]"
            aria-hidden="true"
          />
          Média semanal
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#E6ECE2] pt-4">
        <div>
          <p className="text-xs font-medium text-[#556650]">
            Sessões concluídas
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-[#1D2C20] tabular-nums">
            {ritmo.totalConcluidas}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#556650]">
            Sessões pendentes
          </p>
          <p className="mt-1 font-mono text-xl font-semibold text-[#1D2C20] tabular-nums">
            {ritmo.totalPendentes}
          </p>
        </div>
      </div>
    </section>
  );
}
