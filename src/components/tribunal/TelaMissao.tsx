import { useEffect, useState } from "react";
import type { Fase } from "@/lib/tribunal/fases";

/** Terminal de escrita — vigilância ativa, feedback visual em tudo. */
export function TelaMissao({
  fase,
  texto,
  palavras,
  alerta,
  processando,
  fx,
  aoDigitar,
  aoJulgar,
}: {
  fase: Fase;
  texto: string;
  palavras: number;
  alerta: { texto: string; tom: "ok" | "erro" } | null;
  processando: boolean;
  fx: "aprovado" | "reprovado" | null;
  aoDigitar: (valor: string) => void;
  aoJulgar: () => void;
}) {
  const [pulso, setPulso] = useState(0);

  // Cada palavra digitada gera uma micro-reação visual no contador.
  useEffect(() => {
    setPulso((p) => p + 1);
  }, [palavras]);

  const glitchAtivo = fx === "reprovado";

  return (
    <div
      className={`painel-holo chanfro entrada-hud relative z-10 flex h-full flex-col overflow-hidden p-5 ${
        glitchAtivo ? "glitch alerta-vermelho" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
        <p className="etiqueta text-destructive pulsar">● Gravando — vigilância ativa</p>
        <p className="neon-texto font-[family-name:var(--font-display)] text-[0.7rem] font-bold uppercase tracking-[0.24em]">
          {fase.missao} · {fase.tipoMissao}
        </p>
        <p className="text-[0.66rem] font-bold tabular-nums uppercase tracking-[0.16em] text-muted-foreground">
          <span key={pulso} className="subir-contador inline-block">
            {palavras}
          </span>
          /{fase.minPalavras} fragmentos
        </p>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{fase.tema}</p>

      {alerta && (
        <p
          className={`chanfro-suave subir-contador mt-3 border px-3 py-2 text-[0.7rem] font-bold uppercase tracking-[0.18em] ${
            alerta.tom === "ok"
              ? "border-[var(--sucesso)] bg-[color-mix(in_oklab,var(--sucesso)_12%,transparent)] text-[var(--sucesso)]"
              : "border-destructive bg-destructive/12 text-destructive pulsar"
          }`}
        >
          {alerta.texto}
        </p>
      )}

      <textarea
        autoFocus
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        data-gramm="false"
        value={texto}
        onChange={(e) => aoDigitar(e.target.value)}
        onPaste={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
        placeholder="Transmita sua produção textual. O tribunal não aceita rascunhos importados."
        className="chanfro-suave mt-4 min-h-[46vh] flex-1 resize-none border border-input bg-black/55 p-4 text-sm leading-relaxed outline-none transition-colors focus:border-[var(--color-neon)]"
      />

      <button
        onClick={aoJulgar}
        disabled={processando}
        className="chanfro-suave mt-4 w-full border border-[var(--color-neon)] px-4 py-3.5 font-[family-name:var(--font-display)] text-xs font-extrabold uppercase tracking-[0.24em] text-[var(--color-neon)] transition-all hover:bg-[var(--color-neon)] hover:text-black disabled:opacity-40"
      >
        {processando ? "Computando veredicto…" : "▶ Enviar ao tribunal"}
      </button>
    </div>
  );
}
