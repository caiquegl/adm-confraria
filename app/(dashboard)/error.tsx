"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[adm] dashboard error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold text-brand-dark">
        Não foi possível carregar esta página
      </h1>
      <p className="text-sm text-muted">
        Ocorreu um erro no servidor do ADM. Se você estava enviando imagens
        grandes no cadastro de evento, tente com arquivos menores (até ~4 MB no
        total) e tente novamente.
      </p>
      <button className="btn-primary" onClick={reset} type="button">
        Tentar de novo
      </button>
    </div>
  );
}
