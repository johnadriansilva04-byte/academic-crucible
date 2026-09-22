import { useEffect, useRef, useState } from "react";
import type { Progresso } from "@/lib/tribunal/db";
import type { Nivel } from "@/lib/tribunal/progressao";
import { formatarXP } from "@/lib/tribunal/progressao";

/** Contador que sobe suavemente até o valor alvo — nunca apenas texto. */
export function ContadorAnimado({
  valor,
  formatar = (v: number) => String(v),
  duracao = 900,
  className,
}: {
  valor: number;
  formatar?: (v: number) => string;
  duracao?: number;
  className?: string;
}) {
  const [exibido, setExibido] = useState(valor);
  const anterior = useRef(valor);

  useEffect(() => {
    const de = anterior.current;
    const para = valor;
    anterior.current = valor;
    if (de === para) {
      setExibido(para);
      return;
    }
    const inicio = performance.now();
    let raf = 0;
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      setExibido(de + (para - de) * suave);
      if (t < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor, duracao]);

  return <span className={className}>{formatar(Math.round(exibido))}</span>;
}

/** Barra de progresso animada com preenchimento luminoso. */
export function BarraXP({
  percentual,
  rotulo,
  detalhe,
  tom = "neon",
  compacta,
}: {
  percentual: number;
  rotulo?: string;
  detalhe?: string;
  tom?: "neon" | "sucesso" | "sistema" | "perigo";
  compacta?: boolean;
}) {
  const cor =
    tom === "sucesso"
      ? "var(--sucesso)"
      : tom === "sistema"
        ? "var(--color-sistema)"
        : tom === "perigo"
          ? "var(--destructive)"
          : "var(--color-neon)";
  const seguro = Math.max(0, Math.min(100, percentual));

  return (
    <div>
      {(rotulo || detalhe) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          {rotulo && <span className="etiqueta">{rotulo}</span>}
          {detalhe && (
            <span className="text-[0.68rem] tabular-nums text-muted-foreground">{detalhe}</span>
          )}
        </div>
      )}
      <div
        className={`chanfro-suave relative w-full overflow-hidden bg-black/55 ${compacta ? "h-2" : "h-3.5"}`}
        style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${cor} 35%, transparent)` }}
      >
        <div
          className="barra-xp h-full transition-[width] duration-700 ease-out"
          style={{
            width: `${seguro}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${cor} 55%, transparent), ${cor})`,
            boxShadow: `0 0 16px color-mix(in oklab, ${cor} 80%, transparent)`,
          }}
        />
      </div>
    </div>
  );
}

export function CabecalhoJogador({
  progresso,
  nivel,
  apelido,
  email,
  aoSair,
}: {
  progresso: Progresso;
  nivel: Nivel;
  apelido: string | null;
  email: string | undefined;
  aoSair: () => void;
}) {
  const nome = apelido ?? email?.split("@")[0] ?? "RECRUTA";
  const iniciais = nome.slice(0, 2).toUpperCase();

  return (
    <header className="painel-holo chanfro entrada-hud relative z-10 flex flex-wrap items-center gap-4 px-4 py-3 sm:px-5">
      <div className="relative flex items-center gap-3">
        <div
          className="brilho-pulso chanfro-suave relative grid h-14 w-14 shrink-0 place-items-center"
          style={{
            background: "linear-gradient(140deg, var(--color-sistema), var(--color-neon))",
            boxShadow: "0 0 24px -4px var(--color-neon)",
          }}
        >
          <span className="font-[family-name:var(--font-display)] text-lg font-extrabold text-black/85">
            {iniciais}
          </span>
          <span
            className="chanfro-suave absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center text-[0.6rem] font-bold text-black"
            style={{ background: "var(--patente)" }}
          >
            {nivel.nivel}
          </span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-wide">
            {nome}
          </p>
          <p className="neon-texto truncate text-[0.66rem] font-bold uppercase tracking-[0.18em]">
            {nivel.patente.nome}
          </p>
          <p className="etiqueta">Patente acadêmica · Nível {nivel.nivel}</p>
        </div>
      </div>

      <div className="min-w-[190px] flex-1">
        <BarraXP
          percentual={nivel.percentual}
          rotulo={`XP · Nível ${nivel.nivel}`}
          detalhe={`${formatarXP(nivel.xpNoNivel)} / ${formatarXP(nivel.xpNecessario)}`}
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
          <span>
            🎖️ Moedas{" "}
            <ContadorAnimado
              valor={progresso.moedas}
              formatar={formatarXP}
              className="font-bold text-[var(--conquista)]"
            />
          </span>
          <span>
            🔥 Sequência{" "}
            <ContadorAnimado
              valor={progresso.combo}
              className="font-bold text-[var(--color-neon)]"
            />
          </span>
          <span>
            ⭐ XP Total{" "}
            <ContadorAnimado
              valor={progresso.pontuacao}
              formatar={formatarXP}
              className="font-bold text-foreground"
            />
          </span>
        </div>
      </div>

      <button
        onClick={aoSair}
        className="chanfro-suave etiqueta border border-border px-3 py-2 transition-colors hover:border-destructive hover:text-destructive"
      >
        Encerrar sessão
      </button>
    </header>
  );
}
