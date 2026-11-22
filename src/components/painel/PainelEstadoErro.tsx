import { AlertTriangle, RotateCw } from 'lucide-react';

interface PainelEstadoErroProps {
  mensagem?: string;
  onTentarNovamente: () => void;
  tentando?: boolean;
}

export function PainelEstadoErro({
  mensagem,
  onTentarNovamente,
  tentando = false,
}: PainelEstadoErroProps) {
  return (
    <section
      role="alert"
      aria-label="Erro ao carregar o painel geral"
      className="flex flex-col items-center justify-center rounded-xl border border-[#F3C8C8] bg-white px-6 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FDF2F2] text-[#8E2A2A]">
        <AlertTriangle className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-[#1D2C20]">
        Não foi possível carregar o painel geral
      </h2>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#556650]">
        {mensagem ||
          'Ocorreu uma falha temporária ao buscar os indicadores, atendimentos de hoje e ritmo mensal. Tente novamente em instantes.'}
      </p>

      <button
        type="button"
        onClick={onTentarNovamente}
        disabled={tentando}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] disabled:opacity-60"
      >
        <RotateCw
          className={`h-4 w-4 ${tentando ? 'animate-spin' : ''}`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <span>{tentando ? 'Carregando...' : 'Tentar novamente'}</span>
      </button>
    </section>
  );
}
