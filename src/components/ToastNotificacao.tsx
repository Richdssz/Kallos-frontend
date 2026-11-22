"use client";

import { useEffect, useRef, useState } from "react";
import { NotificacaoUI, useUiStore } from "@/store/uiStore";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

const DURACAO_EXIBICAO_MS = 3800;
const DURACAO_SAIDA_MS = 250;

export function ToastNotificacao() {
  const notificacao = useUiStore((s) => s.notificacao);
  const limparNotificacao = useUiStore((s) => s.limparNotificacao);

  const [notificacaoAtual, setNotificacaoAtual] =
    useState<NotificacaoUI | null>(null);
  const [visivel, setVisivel] = useState(false);

  const timerFecharRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerLimparRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function limparTimers() {
    if (timerFecharRef.current) clearTimeout(timerFecharRef.current);
    if (timerLimparRef.current) clearTimeout(timerLimparRef.current);
  }

  function fecharComAnimacao() {
    limparTimers();
    setVisivel(false);
    timerLimparRef.current = setTimeout(() => {
      setNotificacaoAtual(null);
      limparNotificacao();
    }, DURACAO_SAIDA_MS);
  }

  useEffect(() => {
    if (!notificacao) {
      setVisivel(false);
      return;
    }

    limparTimers();
    setNotificacaoAtual(notificacao);

    const frame = requestAnimationFrame(() => {
      setVisivel(true);
    });

    timerFecharRef.current = setTimeout(() => {
      fecharComAnimacao();
    }, DURACAO_EXIBICAO_MS);

    return () => {
      cancelAnimationFrame(frame);
      limparTimers();
    };
  }, [notificacao]);

  if (!notificacaoAtual) return null;

  const estilos = {
    sucesso: {
      container: "border-verde-kallos/25 bg-white text-verde-profundo",
      icone: <CheckCircle2 className="h-5 w-5 text-verde-kallos shrink-0" />,
    },
    erro: {
      container: "border-red-200 bg-red-50 text-red-900",
      icone: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
    },
    aviso: {
      container: "border-amber-200 bg-amber-50 text-amber-900",
      icone: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    },
  }[notificacaoAtual.tipo];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`t-toast ${visivel ? "is-open" : ""} fixed bottom-5 right-5 z-50 max-w-sm`}
    >
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${estilos.container}`}
      >
        {estilos.icone}
        <p className="text-sm font-medium">{notificacaoAtual.mensagem}</p>
        <button
          type="button"
          onClick={fecharComAnimacao}
          aria-label="Fechar notificação"
          className="ml-2 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}