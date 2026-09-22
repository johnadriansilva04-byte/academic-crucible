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
  const [selecionada, setSelecionada] = useState<string | null>(null);

  useEffect(() => {
    setRestante(8);
    setSelecionada(null);
  }, [desafio]);

  useEffect(() => {
    if (restante <= 0) {
      onResolver(false);
      return;
    }
    const t = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [restante, onResolver]);

  const critico = restante <= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 px-4 backdrop-blur-sm">
      <div className="painel-holo chanfro entrada-hud w-full max-w-lg border-[var(--color-sistema)] p-6">
        <span
          aria-hidden
          className="varredura pointer-events-none absolute inset-x-0 top-0 h-20 opacity-40"
          style={{
            background: "linear-gradient(180deg, transparent, var(--color-sistema), transparent)",
          }}
        />
        <div className="relative flex items-center justify-between gap-3">
          <p
            className="font-[family-name:var(--font-display)] text-[0.68rem] font-extrabold uppercase tracking-[0.22em]"
            style={{ color: "var(--color-sistema)" }}
          >
            ⚠ Corretor sabotado — checagem obrigatória
          </p>
          <p
            className={`text-lg font-bold tabular-nums ${critico ? "pulsar text-destructive" : "text-[var(--color-sistema)]"}`}
          >
            {restante}s
          </p>
        </div>

        <div className="relative mt-3 h-1.5 w-full overflow-hidden bg-black/60">
          <div
            className="h-full transition-[width] duration-1000 ease-linear"
            style={{
              width: `${(restante / 8) * 100}%`,
              background: critico ? "var(--destructive)" : "var(--color-sistema)",
            }}
          />
        </div>

        <p className="relative mt-4 text-sm text-muted-foreground">
          Desvio detectado. O sistema <span className="neon-texto">não</span> entrega a resposta.
          Selecione a grafia exata para retomar a digitação.
        </p>
        <p className="relative mt-2 text-xs italic text-muted-foreground">Pista: {desafio.pista}</p>

        <div className="relative mt-5 grid gap-2">
          {desafio.opcoes.map((op, i) => {
            const ativa = selecionada === op;
            return (
              <button
                key={op}
                onClick={() => {
                  setSelecionada(op);
                  setTimeout(() => onResolver(op === desafio.correta), 260);
                }}
                className={`chanfro-suave flex items-center gap-3 border px-4 py-3 text-left text-sm transition-all ${
                  ativa
                    ? "neon-borda bg-black/60 neon-texto"
                    : "border-border hover:border-[var(--color-sistema)] hover:bg-black/40"
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center border border-border/80 text-[0.6rem] font-bold tabular-nums">
                  {String.fromCharCode(65 + i)}
                </span>
                {op}
              </button>
            );
          })}
        </div>

        <p className="relative mt-4 text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
          Erro ou omissão: penalidade de 30s e perda de estabilidade do sistema.
        </p>
      </div>
    </div>
  );
}
