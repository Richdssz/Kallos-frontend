import {
  AlertTriangle,
  CalendarCheck2,
  Clock,
  FileCheck2,
  RotateCw,
  Users,
} from 'lucide-react';
import type { IndicadoresPsicologo } from '../types/painel';

interface PainelIndicadoresProps {
  dados?: IndicadoresPsicologo;
  carregando: boolean;
  erro?: boolean;
  onTentarNovamente?: () => void;
}

export function PainelIndicadores({
  dados,
  carregando,
  erro = false,
  onTentarNovamente,
}: PainelIndicadoresProps) {
  if (erro && !carregando) {
    return (
      <section
        role="alert"
        aria-label="Erro nos indicadores do psicólogo"
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#F3C8C8] bg-white px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-[#8E2A2A]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-[#1D2C20]">
              Não foi possível carregar os indicadores do mês
            </p>
            <p className="text-xs text-[#556650]">
              Os demais blocos da tela continuam disponíveis normalmente.
            </p>
          </div>
        </div>
        {onTentarNovamente && (
          <button
            type="button"
            onClick={onTentarNovamente}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] px-3 py-1.5 text-xs font-medium text-[#1D2C20] transition-colors hover:border-[#ACBFA9] hover:bg-[#E6ECE2]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <RotateCw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            <span>Tentar novamente</span>
          </button>
        )}
      </section>
    );
  }

  if (carregando || !dados) {
    return (
      <section aria-label="Carregando indicadores do psicólogo" aria-busy="true">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E6ECE2] bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-28 animate-pulse rounded bg-[#E6ECE2]" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-[#E6ECE2]/80" />
              </div>
              <div className="mt-4 h-9 w-16 animate-pulse rounded bg-[#E6ECE2]" />
              <div className="mt-3 h-3.5 w-36 animate-pulse rounded bg-[#E6ECE2]/75" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const totalHoje =
    dados.atendimentosHojeRealizados + dados.atendimentosHojePrevistos;

  const textoPendencias =
    dados.evolucoesPendentes > 0
      ? ` · ${dados.evolucoesPendentes} ${
          dados.evolucoesPendentes === 1
            ? 'evolução pendente'
            : 'evoluções pendentes'
        }`
      : ' · Em dia';

  const cartoes = [
    {
      id: 'pacientes-ativos',
      titulo: 'Pacientes ativos',
      valor: dados.pacientesAtivos,
      detalhe: `+${dados.novosPacientesMes} ${
        dados.novosPacientesMes === 1 ? 'novo no mês' : 'novos no mês'
      }`,
      icone: Users,
    },
    {
      id: 'sessoes-mes',
      titulo: 'Sessões no mês',
      valor: dados.sessoesNoMes,
      detalhe: `${dados.sessoesAgendadasMes} ainda agendadas`,
      icone: CalendarCheck2,
    },
    {
      id: 'atendimentos-hoje',
      titulo: 'Atendimentos de hoje',
      valor: totalHoje,
      detalhe: `${dados.atendimentosHojeRealizados} realizados · ${dados.atendimentosHojePrevistos} previstos`,
      icone: Clock,
    },
    {
      id: 'prontuarios-7dias',
      titulo: 'Prontuários atualizados',
      valor: dados.prontuariosAtualizados7Dias,
      detalhe: `Últimos 7 dias${textoPendencias}`,
      icone: FileCheck2,
    },
  ];

  return (
    <section aria-label="Indicadores do psicólogo">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cartoes.map((cartao) => {
          const Icone = cartao.icone;
          return (
            <article
              key={cartao.id}
              className="rounded-xl border border-[#E6ECE2] bg-white p-5 transition-colors duration-150 hover:border-[#ACBFA9]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-medium text-[#556650]">
                  {cartao.titulo}
                </h2>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6ECE2]/70 text-[#334936]"
                  aria-hidden="true"
                >
                  <Icone className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-[#1D2C20] tabular-nums">
                {cartao.valor}
              </p>

              <p className="mt-2 text-xs font-medium text-[#556650] tabular-nums">
                {cartao.detalhe}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
