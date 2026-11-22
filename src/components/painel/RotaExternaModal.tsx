import { useEffect } from 'react';
import { ArrowLeft, Compass, X } from 'lucide-react';
import type { DestinoNavegacao, RotaNavegacao } from '@/types/painel/painel';

interface RotaExternaModalProps {
  destino: DestinoNavegacao | null;
  onFechar: () => void;
}

const INFO_ROTAS: Record<
  Exclude<RotaNavegacao, '/painel'>,
  { tela: string; responsavel: string; descricao: string }
> = {
  '/agenda': {
    tela: 'Tela 07 — Agenda e consultas',
    responsavel: 'Richard Silva',
    descricao:
      'Grade semanal de segunda a sexta, agendamento, remarcação, pagamento e conclusão de sessões.',
  },
  '/pacientes': {
    tela: 'Tela 05 — Pacientes',
    responsavel: 'Richard Silva',
    descricao:
      'Listagem paginada com CPF mascarado, busca, filtros por status e cadastro em três etapas.',
  },
  '/prontuario': {
    tela: 'Tela 06 — Prontuário e CID',
    responsavel: 'Micael Barros',
    descricao:
      'Acesso restrito a psicólogos vinculados, busca de CID, registro clínico e histórico permanente de evoluções.',
  },
  '/configuracoes': {
    tela: 'Tela 01 — Configurações',
    responsavel: 'Matheus Alves',
    descricao:
      'Edição de dados do perfil profissional do psicólogo ou configurações do consultório conforme o perfil.',
  },
};

export function RotaExternaModal({ destino, onFechar }: RotaExternaModalProps) {
  useEffect(() => {
    if (!destino) return;
    const lidarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFechar();
      }
    };
    window.addEventListener('keydown', lidarTecla);
    return () => window.removeEventListener('keydown', lidarTecla);
  }, [destino, onFechar]);

  if (!destino || destino.rota === '/painel') return null;

  const info = INFO_ROTAS[destino.rota];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-rota-escopo"
    >
      <div
        className="fixed inset-0 bg-[#1D2C20]/40 backdrop-blur-[1px]"
        onClick={onFechar}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl border border-[#E6ECE2] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6ECE2]/80 text-[#334936]">
            <Compass className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#556650] transition-colors hover:bg-[#FAF6F2] hover:text-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
            aria-label="Fechar aviso de navegação"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <h2
          id="titulo-rota-escopo"
          className="mt-4 text-lg font-semibold text-[#1D2C20]"
        >
          Navegação para {destino.titulo}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#556650]">
          Esta entrega contempla exclusivamente as telas e estados do{' '}
          <strong className="font-semibold text-[#1D2C20]">
            Painel geral (/painel)
          </strong>
          . A rota acionada faz parte de outro módulo especificado no documento:
        </p>

        <div className="mt-4 rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] p-4 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#1D2C20]">{info.tela}</span>
            <span className="font-mono font-medium text-[#334936]">
              {destino.rotaCompleta ?? destino.rota}
            </span>
          </div>
          <p className="mt-1.5 leading-relaxed text-[#556650]">
            {info.descricao}
          </p>
          <p className="mt-2 text-[#556650]">
            Responsável no mapa de telas:{' '}
            <span className="font-medium text-[#1D2C20]">
              {info.responsavel}
            </span>
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2.5 text-sm font-medium text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            <span>Continuar no Painel geral</span>
          </button>
        </div>
      </div>
    </div>
  );
}
