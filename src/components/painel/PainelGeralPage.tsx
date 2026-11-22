"use client";

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  UserCheck,
  X,
} from 'lucide-react';
import {
  buscarIndicadores,
  buscarRitmoMes,
  buscarSessoesHoje,
} from '@/services/painel/painelApi';
import { useAuthStore } from '@/store/painel/authStore';
import { useUIStore } from '@/store/painel/uiStore';
import type {
  DestinoNavegacao,
  RotaNavegacao,
  SessaoHoje,
} from '@/types/painel/painel';
import { AtendimentosHojeCard } from './AtendimentosHojeCard';
import { PainelEstadoErro } from './PainelEstadoErro';
import { PainelIndicadores } from './PainelIndicadores';
import { RitmoMesCard } from './RitmoMesCard';
import { RotaExternaModal } from './RotaExternaModal';
import { SessaoDetalheDrawer } from './SessaoDetalheDrawer';

function formatarHoraAtualizacao(timestamp: number): string {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function PainelGeralPage() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((s) => s.usuario);
  const perfil = useAuthStore((s) => s.perfil);
  const definirPerfil = useAuthStore((s) => s.definirPerfil);

  const painelModo = useUIStore((s) => s.painelModo);
  const setPainelModo = useUIStore((s) => s.setPainelModo);
  const modoPrivacidade = useUIStore((s) => s.modoPrivacidade);
  const alternarModoPrivacidade = useUIStore((s) => s.alternarModoPrivacidade);
  const notificacao = useUIStore((s) => s.notificacao);
  const exibirNotificacao = useUIStore((s) => s.exibirNotificacao);
  const limparNotificacao = useUIStore((s) => s.limparNotificacao);

  const [sessaoSelecionada, setSessaoSelecionada] = useState<SessaoHoje | null>(
    null,
  );
  const [rotaModal, setRotaModal] = useState<DestinoNavegacao | null>(null);

  const psicologoId = perfil === 'psicologo' ? (usuario?.id ?? '') : '';
  const consultasAtivas = Boolean(psicologoId) && painelModo !== 'carregando';

  const consultaIndicadores = useQuery({
    queryKey: ['indicadores', psicologoId, painelModo],
    queryFn: () => buscarIndicadores(psicologoId, painelModo),
    enabled: consultasAtivas,
    retry: false,
  });

  const consultaSessoesHoje = useQuery({
    queryKey: ['sessoes-hoje', psicologoId, painelModo],
    queryFn: () => buscarSessoesHoje(psicologoId, painelModo),
    enabled: consultasAtivas,
    retry: false,
  });

  const consultaRitmoMes = useQuery({
    queryKey: ['ritmo-mes', psicologoId, painelModo],
    queryFn: () => buscarRitmoMes(psicologoId, painelModo),
    enabled: consultasAtivas,
    retry: false,
  });

  const carregandoIndicadores =
    painelModo === 'carregando' ||
    consultaIndicadores.isPending ||
    consultaIndicadores.isFetching;
  const carregandoSessoes =
    painelModo === 'carregando' ||
    consultaSessoesHoje.isPending ||
    consultaSessoesHoje.isFetching;
  const carregandoRitmo =
    painelModo === 'carregando' ||
    consultaRitmoMes.isPending ||
    consultaRitmoMes.isFetching;

  const carregandoAlgum =
    carregandoIndicadores || carregandoSessoes || carregandoRitmo;

  const erroTotal =
    painelModo === 'erro' ||
    (consultaIndicadores.isError &&
      consultaSessoesHoje.isError &&
      consultaRitmoMes.isError);

  const ultimaAtualizacaoTimestamp = Math.max(
    consultaIndicadores.dataUpdatedAt,
    consultaSessoesHoje.dataUpdatedAt,
    consultaRitmoMes.dataUpdatedAt,
  );
  const horarioAtualizado = formatarHoraAtualizacao(ultimaAtualizacaoTimestamp);

  const lidarAtualizar = async () => {
    if (
      painelModo === 'erro' ||
      painelModo === 'erro_parcial' ||
      painelModo === 'carregando'
    ) {
      setPainelModo('padrao');
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['indicadores'] }),
      queryClient.invalidateQueries({ queryKey: ['sessoes-hoje'] }),
      queryClient.invalidateQueries({ queryKey: ['ritmo-mes'] }),
    ]);
    exibirNotificacao({
      tipo: 'sucesso',
      titulo: 'Painel atualizado',
      mensagem: 'Indicadores, atendimentos de hoje e ritmo do mês recarregados.',
    });
  };

  const lidarTentarBloco = async (chave: 'indicadores' | 'sessoes-hoje' | 'ritmo-mes') => {
    if (painelModo === 'erro_parcial' || painelModo === 'erro') {
      setPainelModo('padrao');
    }
    await queryClient.invalidateQueries({ queryKey: [chave] });
  };

  const lidarTentarNovamenteTotal = async () => {
    setPainelModo('padrao');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['indicadores'] }),
      queryClient.invalidateQueries({ queryKey: ['sessoes-hoje'] }),
      queryClient.invalidateQueries({ queryKey: ['ritmo-mes'] }),
    ]);
    exibirNotificacao({
      tipo: 'sucesso',
      titulo: 'Conexão restabelecida',
      mensagem: 'Os dados do Painel geral foram carregados novamente.',
    });
  };

  const lidarNavegacao = (rota: RotaNavegacao, titulo: string) => {
    if (rota === '/painel') {
      setRotaModal(null);
      return;
    }
    setRotaModal({ rota, titulo });
  };

  const lidarAbrirAgenda = () => {
    setRotaModal({ rota: '/agenda', titulo: 'Agenda e consultas' });
  };

  const lidarAbrirProntuario = (pacienteId: string, pacienteNome: string) => {
    setRotaModal({
      rota: '/prontuario',
      rotaCompleta: `/prontuario/${pacienteId}`,
      titulo: `Prontuário de ${pacienteNome}`,
    });
  };

  return (
    <>
      <main className="mx-auto w-full max-w-[1280px] flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {notificacao && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start justify-between gap-3 rounded-xl border border-[#ACBFA9] bg-white px-4 py-3 text-sm"
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#334936]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-[#1D2C20]">
                    {notificacao.titulo}
                  </p>
                  <p className="text-xs text-[#556650]">
                    {notificacao.mensagem}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={limparNotificacao}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#556650] transition-colors hover:bg-[#FAF6F2] hover:text-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-[#556650] uppercase">
                Consultório · Visão geral
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1D2C20] sm:text-3xl">
                Painel geral
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#556650]">
                <span>
                  {perfil === 'administrador'
                    ? 'Acesso administrativo · Configurações do consultório'
                    : `Indicadores consolidados de ${usuario?.nome ?? ''}`}
                </span>
                {perfil === 'psicologo' && horarioAtualizado && !erroTotal && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-xs tabular-nums">
                      Atualizado às {horarioAtualizado}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {perfil === 'psicologo' && (
                <>
                  <button
                    type="button"
                    onClick={alternarModoPrivacidade}
                    aria-pressed={modoPrivacidade}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] ${
                      modoPrivacidade
                        ? 'border-[#334936] bg-[#E6ECE2]/80 text-[#1D2C20]'
                        : 'border-[#E6ECE2] bg-white text-[#1D2C20] hover:border-[#ACBFA9] hover:bg-[#E6ECE2]/40'
                    }`}
                    title="Ocultar sobrenomes dos pacientes na tabela"
                  >
                    {modoPrivacidade ? (
                      <EyeOff
                        className="h-4 w-4 text-[#334936]"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 text-[#334936]"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    )}
                    <span className="hidden sm:inline">
                      {modoPrivacidade ? 'Nomes ocultos' : 'Privacidade'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={lidarAtualizar}
                    disabled={carregandoAlgum && painelModo !== 'carregando'}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#E6ECE2] bg-white px-3.5 text-sm font-medium whitespace-nowrap text-[#1D2C20] transition-colors hover:border-[#ACBFA9] hover:bg-[#E6ECE2]/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936] disabled:opacity-60"
                    title="Recarregar consultas do painel"
                  >
                    <RefreshCw
                      className={`h-4 w-4 text-[#334936] ${
                        carregandoAlgum && painelModo !== 'carregando'
                          ? 'animate-spin'
                          : ''
                      }`}
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={lidarAbrirAgenda}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#334936] px-4 text-sm font-medium whitespace-nowrap text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
              >
                <CalendarDays
                  className="h-4 w-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>Abrir agenda</span>
              </button>
            </div>
          </div>

          {perfil === 'administrador' ? (
            <section
              aria-label="Aviso de perfil administrador no Painel geral"
              className="rounded-xl border border-[#E6ECE2] bg-white p-8"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6ECE2]/80 text-[#334936]">
                    <UserCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1D2C20]">
                      Indicadores clínicos disponíveis apenas para psicólogos
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#556650]">
                      Os indicadores do Painel geral consideram somente os
                      pacientes, sessões e prontuários vinculados ao psicólogo
                      autenticado. Como administrador, você gerencia o
                      consultório em Configurações.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => definirPerfil('psicologo')}
                    className="rounded-lg border border-[#E6ECE2] bg-[#FAF6F2] px-4 py-2 text-sm font-medium whitespace-nowrap text-[#1D2C20] transition-colors hover:border-[#ACBFA9] hover:bg-[#E6ECE2]/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                  >
                    Visualizar como psicólogo
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      lidarNavegacao('/configuracoes', 'Configurações')
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-[#334936] px-4 py-2 text-sm font-medium whitespace-nowrap text-[#FAF6F2] transition-colors hover:bg-[#1D2C20] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#334936]"
                  >
                    <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    <span>Ir para Configurações</span>
                  </button>
                </div>
              </div>
            </section>
          ) : erroTotal && !carregandoAlgum ? (
            <PainelEstadoErro
              mensagem={
                consultaIndicadores.error?.message ||
                consultaSessoesHoje.error?.message ||
                consultaRitmoMes.error?.message
              }
              onTentarNovamente={lidarTentarNovamenteTotal}
              tentando={consultaIndicadores.isFetching}
            />
          ) : (
            <>
              <PainelIndicadores
                dados={consultaIndicadores.data}
                carregando={carregandoIndicadores}
                erro={consultaIndicadores.isError}
                onTentarNovamente={() => lidarTentarBloco('indicadores')}
              />

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="xl:col-span-7">
                  <AtendimentosHojeCard
                    sessoes={consultaSessoesHoje.data}
                    carregando={carregandoSessoes}
                    erro={consultaSessoesHoje.isError}
                    modoPrivacidade={modoPrivacidade}
                    onTentarNovamente={() => lidarTentarBloco('sessoes-hoje')}
                    onVerAgenda={lidarAbrirAgenda}
                    onSelecionarSessao={setSessaoSelecionada}
                    sessaoSelecionadaId={sessaoSelecionada?.id}
                  />
                </div>

                <div className="xl:col-span-5">
                  <RitmoMesCard
                    ritmo={consultaRitmoMes.data}
                    carregando={carregandoRitmo}
                    erro={consultaRitmoMes.isError}
                    onTentarNovamente={() => lidarTentarBloco('ritmo-mes')}
                  />
                </div>
              </div>
            </>
          )}
        </main>

      <SessaoDetalheDrawer
        sessao={sessaoSelecionada}
        modoPrivacidade={modoPrivacidade}
        onFechar={() => setSessaoSelecionada(null)}
        onVerAgenda={lidarAbrirAgenda}
        onAbrirProntuario={lidarAbrirProntuario}
      />

      <RotaExternaModal
        destino={rotaModal}
        onFechar={() => setRotaModal(null)}
      />
    </>
  );
}
