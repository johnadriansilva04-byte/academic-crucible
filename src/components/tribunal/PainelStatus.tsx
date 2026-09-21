import { FASES, type Fase } from "@/lib/tribunal/fases";
import type { Progresso } from "@/lib/tribunal/db";

export function PainelStatus({
  progresso,
  fase,
  palavras,
  tempo,
  emMissao,
}: {
  progresso: Progresso;
  fase: Fase;
  palavras: number;
  tempo: number;
  emMissao: boolean;
}) {
  const min = String(Math.floor(tempo / 60)).padStart(2, "0");
  const seg = String(tempo % 60).padStart(2, "0");
  const critico = emMissao && tempo <= 60;
  const progressoPalavras = Math.min(100, Math.round((palavras / fase.minPalavras) * 100));

  return (
    <aside className="painel flex flex-col gap-5 p-5">
      <div>
        <p className="etiqueta">Grau atual</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-extrabold uppercase leading-tight">
          {fase.grau}
        </p>
        <p className="mt-1 text-[0.7rem] text-muted-foreground">{fase.genero}</p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        <Celula rotulo="Pontos" valor={String(progresso.pontuacao)} />
        <Celula rotulo="Aprovações" valor={String(progresso.aprovacoes)} />
        <Celula rotulo="Reprovações" valor={String(progresso.reprovacoes)} destaque={progresso.reprovacoes > 0} />
        <Celula rotulo="Banimentos" valor={String(progresso.banimentos)} destaque={progresso.banimentos > 0} />
      </div>

      <div>
        <p className="etiqueta">Cronômetro</p>
        <p
          className={`font-[family-name:var(--font-display)] text-4xl font-extrabold tabular-nums ${
            critico ? "pulsar text-destructive" : emMissao ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {min}:{seg}
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <p className="etiqueta">Volume exigido</p>
          <p className="text-[0.7rem] tabular-nums text-muted-foreground">
            {palavras}/{fase.minPalavras}
          </p>
        </div>
        <div className="mt-2 h-1.5 w-full bg-secondary">
          <div
            className={`h-full transition-all ${progressoPalavras >= 100 ? "bg-[var(--sucesso)]" : "bg-primary"}`}
            style={{ width: `${progressoPalavras}%` }}
          />
        </div>
      </div>

      <div>
        <p className="etiqueta">Trilha acadêmica</p>
        <ol className="mt-2 space-y-1">
          {FASES.map((f) => {
            const estado = f.id < progresso.fase ? "concluida" : f.id === progresso.fase ? "atual" : "bloqueada";
            return (
              <li
                key={f.id}
                className={`flex items-center gap-2 text-[0.68rem] uppercase tracking-wider ${
                  estado === "atual"
                    ? "text-primary"
                    : estado === "concluida"
                      ? "text-[var(--sucesso)]"
                      : "text-muted-foreground/50"
                }`}
              >
                <span className="tabular-nums">{String(f.id).padStart(2, "0")}</span>
                <span className="flex-1 truncate">{f.grau}</span>
                <span>{estado === "concluida" ? "OK" : estado === "atual" ? "▶" : "—"}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

function Celula({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="bg-card p-3">
      <p className="etiqueta">{rotulo}</p>
      <p className={`mt-0.5 text-lg font-bold tabular-nums ${destaque ? "text-destructive" : "text-foreground"}`}>
        {valor}
      </p>
    </div>
  );
}
