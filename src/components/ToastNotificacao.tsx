"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/uiStore";
import { CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";

export function ToastNotificacao() {
  const notificacao = useUiStore((s) => s.notificacao);
  const limparNotificacao = useUiStore((s) => s.limparNotificacao);

  useEffect(() => {
    if (!notificacao) return;
    const timer = setTimeout(() => {
      limparNotificacao();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notificacao, limparNotificacao]);

  if (!notificacao) return null;

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
  }[notificacao.tipo];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm"
    >
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${estilos.container}`}
      >
        {estilos.icone}
        <p className="text-sm font-medium">{notificacao.mensagem}</p>
        <button
          type="button"
          onClick={limparNotificacao}
          aria-label="Fechar notificação"
          className="ml-2 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
