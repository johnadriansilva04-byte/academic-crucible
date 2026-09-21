import { useEffect, useState } from "react";
import type { DesafioOrtografico } from "@/lib/tribunal/corretor";

export function CorretorSabotado({
  desafio,
  onResolver,
}: {
  desafio: DesafioOrtografico;
  onResolver: (acertou: boolean) => void;
}) {
  const [restante, setRestante] = useState(8);

  useEffect(() => {
    setRestante(8);
  }, [desafio]);

  useEffect(() => {
    if (restante <= 0) {
      onResolver(false);
      return;
    }
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restante, onResolver]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-4">
      <div className="painel w-full max-w-lg border-primary p-6">
        <div className="flex items-center justify-between">
          <p className="etiqueta text-primary">Corretor sabotado — checagem obrigatória</p>
          <p className="text-lg font-bold tabular-nums text-destructive">{restante}s</p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Desvio detectado. O sistema <span className="text-foreground">não</span> entrega a resposta. Selecione a
          grafia exata para retomar a digitação.
        </p>
        <p className="mt-2 text-xs italic text-muted-foreground">Pista: {desafio.pista}</p>

        <div className="mt-5 grid gap-2">
          {desafio.opcoes.map((op) => (
            <button
              key={op}
              onClick={() => onResolver(op === desafio.correta)}
              className="border border-border px-4 py-3 text-left text-sm transition-colors hover:border-primary hover:bg-secondary"
            >
              {op}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          Erro ou omissão: penalidade de tempo e pontos.
        </p>
      </div>
    </div>
  );
}
