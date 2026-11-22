import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PainelEstadoModo, PerfilAcesso } from '../types/painel';

interface FluxosPainelBlocoProps {
  aberto: boolean;
  onAlternarAberto: () => void;
  modoAtual: PainelEstadoModo;
  perfilAtual: PerfilAcesso;
  onSelecionarModo: (modo: PainelEstadoModo) => void;
  onSelecionarPerfil: (perfil: PerfilAcesso) => void;
}

const REQUISITOS_PAINEL = [
  {
    codigo: 'RF-F05',
    titulo: 'Indicadores do psicólogo',
    descricao:
      'Quatro cartões consolidados (pacientes ativos, sessões no mês, atendimentos de hoje e prontuários atualizados nos últimos 7 dias com pendências), restritos ao psicólogo autenticado.',
  },
  {
    codigo: 'RF-F06',
    titulo: 'Atendimentos de hoje',
    descricao:
      'Tabela com destaque para a próxima sessão, filtros rápidos, horário, paciente, modalidade, selo de status, inspeção rápida e link Ver agenda.',
  },
  {
    codigo: 'RF-F07',
    titulo: 'Ritmo do mês',
    descricao:
      'Gráfico semanal com destaque para a semana de maior volume, linha de média semanal, variação mensal e resumo de concluídas e pendentes.',
  },
  {
    codigo: 'RF-F08',
    titulo: 'Atalho para a agenda',
    descricao:
      'Botão Abrir agenda no cabeçalho da página, trilha de navegação e data atual na barra superior.',
  },
];

const ESTADOS_TELA: {
  modo: PainelEstadoModo;
  titulo: string;
  referencia: string;
  resumo: string;
}[] = [
  {
    modo: 'padrao',
    titulo: 'Painel populado',
    referencia: 'RF-F05 a RF-F08',
    resumo: 'Cartões, gráfico semanal e lista de atendimentos do dia.',
  },
  {
    modo: 'carregando',
    titulo: 'Carregamento (Skeleton)',
    referencia: 'Seção 4.4 · RNF-F02',
    resumo: 'Esqueletos preservando a geometria dos cartões, tabela e gráfico.',
  },
  {
    modo: 'sem_atendimentos',
    titulo: 'Dia sem atendimentos',
    referencia: 'Seção 4.4 · Tela 02',
    resumo: 'Estado vazio objetivo com sugestão de acesso à agenda.',
  },
  {
    modo: 'erro_parcial',
    titulo: 'Erro parcial (Gráfico)',
    referencia: 'Seção 4.2 · Resiliência',
    resumo: 'Falha isolada no Ritmo do mês mantendo indicadores e agenda do dia.',
  },
  {
    modo: 'erro',
    titulo: 'Erro total',
    referencia: 'Seção 4.4 · RNF-F06',
    resumo: 'Mensagem clara de indisponibilidade com botão Tentar novamente.',
  },
];

export function FluxosPainelBloco({
  aberto,
  onAlternarAberto,
  modoAtual,
  perfilAtual,
  onSelecionarModo,
  onSelecionarPerfil,
}: FluxosPainelBlocoProps) {
  return (
    <section
      aria-label="Fluxos e estados do Painel geral"
      className="rounded-xl border border-[#E6ECE2] bg-white"
    >
      <button
        type="button"
        onClick={onAlternarAberto}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-[#FAF6F2]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-[#1D2C20]">
              Fluxos, estados e inspeção da Tela 02
            </h2>
            <span className="font-mono text-xs text-[#556650]">
              · RF-F05 a RF-F08
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#556650]">
            {aberto
              ? 'Alterne entre subtelas, falhas isoladas e perfis de acesso ou consulte os requisitos.'
              : 'Expandir para alternar entre estados de interface (skeleton, vazio, erro parcial/total, perfil administrador) e ver a documentação de fluxos.'}
          </p>
        </div>

        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] text-[#334936]">
          {aberto ? (
            <ChevronUp className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          )}
        </span>
      </button>

      {aberto && (
        <div className="space-y-6 border-t border-[#E6ECE2] p-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-[#556650]">
                Subtelas e estados disponíveis para inspeção
              </p>

              <div
                className="flex items-center gap-1 rounded-lg bg-[#FAF6F2] p-1"
                role="group"
                aria-label="Simular perfil de acesso no authStore"
              >
                <button
                  type="button"
                  onClick={() => onSelecionarPerfil('psicologo')}
                  aria-pressed={perfilAtual === 'psicologo'}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    perfilAtual === 'psicologo'
                      ? 'bg-[#334936] text-[#FAF6F2]'
                      : 'text-[#556650] hover:text-[#1D2C20]'
                  }`}
                >
                  Perfil Psicólogo
                </button>
                <button
                  type="button"
                  onClick={() => onSelecionarPerfil('administrador')}
                  aria-pressed={perfilAtual === 'administrador'}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    perfilAtual === 'administrador'
                      ? 'bg-[#334936] text-[#FAF6F2]'
                      : 'text-[#556650] hover:text-[#1D2C20]'
                  }`}
                >
                  Perfil Administrador
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
              {ESTADOS_TELA.map((estado) => {
                const ativo =
                  perfilAtual === 'psicologo' && modoAtual === estado.modo;
                return (
                  <button
                    key={estado.modo}
                    type="button"
                    onClick={() => {
                      if (perfilAtual !== 'psicologo') {
                        onSelecionarPerfil('psicologo');
                      }
                      onSelecionarModo(estado.modo);
                    }}
                    aria-pressed={ativo}
                    className={`rounded-lg border p-3.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
                      ativo
                        ? 'border-[#334936] bg-[#E6ECE2]/65'
                        : 'border-[#E6ECE2] bg-[#FAF6F2]/60 hover:border-[#ACBFA9] hover:bg-[#FAF6F2]'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[#1D2C20]">
                        {estado.titulo}
                      </span>
                      <span className="font-mono text-[11px] font-medium text-[#334936]">
                        {estado.referencia}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#556650]">
                      {estado.resumo}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[#E6ECE2] pt-5 md:grid-cols-2">
            {REQUISITOS_PAINEL.map((req) => (
              <div key={req.codigo}>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold text-[#334936]">
                    {req.codigo}
                  </span>
                  <span aria-hidden="true" className="text-xs text-[#7F8F7A]">
                    ·
                  </span>
                  <h3 className="text-sm font-semibold text-[#1D2C20]">
                    {req.titulo}
                  </h3>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#556650]">
                  {req.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
