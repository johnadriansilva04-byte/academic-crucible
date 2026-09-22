import type { Fase } from "@/lib/tribunal/fases";
import type { Progresso } from "@/lib/tribunal/db";
import {
  CONQUISTAS,
  calcularEstabilidade,
  classeRaridade,
  conquistasAtivas,
  estatisticasDe,
  formatarXP,
} from "@/lib/tribunal/progressao";
import { BarraXP, ContadorAnimado } from "./CabecalhoJogador";

/** HUD de combate: combo, XP, conquistas, missões e conhecimento recuperado. */
export function HudGamer({
  progresso,
  fase,
  palavras,
  tempo,
  emMissao,
  comboFlash,
}: {
  progresso: Progresso;
  fase: Fase;
  palavras: number;
  tempo: number;
  emMissao: boolean;
  comboFlash?: number;
}) {
  const min = String(Math.floor(tempo / 60)).padStart(2, "0");
  const seg = String(tempo % 60).padStart(2, "0");
  const critico = emMissao && tempo <= 60;
  const progressoPalavras = Math.min(100, Math.round((palavras / fase.minPalavras) * 100));
  const estabilidade = calcularEstabilidade(progresso.reprovacoes, progresso.banimentos);
  const desbloqueadas = conquistasAtivas(estatisticasDe(progresso));

  return (
    <aside className="entrada-hud relative z-10 flex flex-col gap-4">
      <div className="painel-holo chanfro p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="etiqueta">Patente acadêmica</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-extrabold uppercase leading-tight">
              {fase.grau}
            </p>
            <p className="mt-1 text-[0.68rem] uppercase tracking-wider text-muted-foreground">
              {fase.tipoMissao}
            </p>
          </div>
          <span
            className="chanfro-suave shrink-0 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-black"
            style={{ background: "var(--patente)" }}
          >
            {fase.missao}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-px bg-border/70">
          <Celula
            icone="🔥"
            rotulo="Combo"
            valor={progresso.combo}
            tom={comboFlash && comboFlash > 0 ? "neon" : "conquista"}
          />
          <Celula icone="⚔️" rotulo="Missões" valor={progresso.missoes_concluidas} />
          <Celula
            icone="🏆"
            rotulo="Conquistas"
            valor={`${desbloqueadas.length}/${CONQUISTAS.length}`}
          />
          <Celula icone="🎖️" rotulo="Medalhas" valor={progresso.medalhas} tom="conquista" />
        </div>

        <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
          <LinhaRecurso icone="⭐" rotulo="XP Total" valor={progresso.pontuacao} tom="patente" />
          <LinhaRecurso
            icone="📚"
            rotulo="Conhecimento"
            valor={progresso.conhecimento}
            tom="neon"
          />
          <LinhaRecurso icone="🪙" rotulo="Moedas" valor={progresso.moedas} tom="conquista" />
        </div>
      </div>

      <div className="painel-holo chanfro p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="etiqueta">Cronômetro</p>
            <p
              className={`font-[family-name:var(--font-display)] text-4xl font-extrabold tabular-nums ${
                critico
                  ? "pulsar text-destructive"
                  : emMissao
                    ? "neon-texto"
                    : "text-muted-foreground"
              }`}
            >
              {min}:{seg}
            </p>
          </div>
          <div className="text-right">
            <p className="etiqueta">Fragmentos</p>
            <p className="text-sm font-bold tabular-nums">
              <ContadorAnimado valor={palavras} className="text-foreground" />
              <span className="text-muted-foreground">/{fase.minPalavras}</span>
            </p>
          </div>
        </div>
        <div className="mt-3">
          <BarraXP
            percentual={progressoPalavras}
            tom={progressoPalavras >= 100 ? "sucesso" : "neon"}
            compacta
          />
        </div>
      </div>

      <div className="painel-holo chanfro p-4">
        <div className="flex items-center justify-between">
          <p className="etiqueta">Estabilidade do sistema</p>
          <span
            className={`text-[0.62rem] font-bold uppercase tracking-[0.16em] ${
              estabilidade.estado === "estavel"
                ? "text-[var(--sucesso)]"
                : estabilidade.estado === "instavel"
                  ? "text-[var(--alerta)]"
                  : "text-destructive pulsar"
            }`}
          >
            {estabilidade.rotulo}
          </span>
        </div>
        <div className="mt-2">
          <BarraXP
            percentual={estabilidade.valor}
            tom={
              estabilidade.estado === "estavel"
                ? "sucesso"
                : estabilidade.estado === "instavel"
                  ? "sistema"
                  : "perigo"
            }
            compacta
          />
        </div>
        <div className="mt-2 flex justify-between text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
          <span>Aprovações {progresso.aprovacoes}</span>
          <span className={progresso.reprovacoes > 0 ? "text-destructive" : ""}>
            Reprovações {progresso.reprovacoes}
          </span>
          <span className={progresso.banimentos > 0 ? "text-destructive" : ""}>
            Fugas {progresso.banimentos}
          </span>
        </div>
      </div>
    </aside>
  );
}

function Celula({
  icone,
  rotulo,
  valor,
  tom,
}: {
  icone: string;
  rotulo: string;
  valor: number | string;
  tom?: "neon" | "conquista" | undefined;
}) {
  const cor =
    tom === "neon"
      ? "var(--color-neon)"
      : tom === "conquista"
        ? "var(--conquista)"
        : "var(--foreground)";
  return (
    <div className="bg-black/35 p-2.5">
      <p className="etiqueta">
        <span className="mr-1">{icone}</span>
        {rotulo}
      </p>
      <p
        className="subir-contador mt-0.5 text-lg font-bold tabular-nums"
        style={{ color: cor }}
        key={String(valor)}
      >
        {typeof valor === "number" ? <ContadorAnimado valor={valor} /> : valor}
      </p>
    </div>
  );
}

function LinhaRecurso({
  icone,
  rotulo,
  valor,
  tom,
}: {
  icone: string;
  rotulo: string;
  valor: number;
  tom: "neon" | "conquista" | "patente";
}) {
  const cor =
    tom === "neon"
      ? "var(--color-neon)"
      : tom === "conquista"
        ? "var(--conquista)"
        : "var(--patente)";
  return (
    <div className="flex items-center justify-between gap-2 text-[0.68rem] uppercase tracking-[0.14em]">
      <span className="text-muted-foreground">
        <span className="mr-1.5">{icone}</span>
        {rotulo}
      </span>
      <ContadorAnimado valor={valor} formatar={formatarXP} className="font-bold tabular-nums" />
      <span className="hidden" style={{ color: cor }} />
    </div>
  );
}

/** Mapa de progressão em árvore de habilidades — cada etapa desbloqueia a próxima. */
export function MapaProgressao({
  fases,
  faseAtual,
  aoSelecionar,
}: {
  fases: Fase[];
  faseAtual: number;
  aoSelecionar?: (id: number) => void;
}) {
  return (
    <div className="painel-holo chanfro relative p-4">
      <p className="etiqueta">Mapa de progressão</p>
      <ol className="mt-3 space-y-0">
        {fases.map((f, i) => {
          const concluida = f.id < faseAtual;
          const atual = f.id === faseAtual;
          const bloqueada = f.id > faseAtual;
          const cor = concluida ? "var(--sucesso)" : atual ? "var(--color-neon)" : "var(--border)";
          return (
            <li key={f.id}>
              <button
                type="button"
                disabled={bloqueada}
                onClick={() => aoSelecionar?.(f.id)}
                className={`group flex w-full items-center gap-3 py-2 text-left transition-opacity ${
                  bloqueada ? "cursor-not-allowed opacity-45" : "hover:opacity-100"
                }`}
              >
                <span className="relative grid shrink-0 place-items-center">
                  <span
                    className={`grid h-9 w-9 place-items-center text-[0.65rem] font-bold tabular-nums ${atual ? "brilho-pulso" : ""}`}
                    style={{
                      clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                      background: `color-mix(in oklab, ${cor} 26%, transparent)`,
                      border: `1px solid ${cor}`,
                      color: cor,
                    }}
                  >
                    {concluida ? "✓" : bloqueada ? "🔒" : String(f.id).padStart(2, "0")}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate font-[family-name:var(--font-display)] text-[0.78rem] font-bold uppercase tracking-wide"
                    style={{ color: bloqueada ? "var(--muted-foreground)" : cor }}
                  >
                    {f.etapa}
                  </span>
                  <span className="etiqueta">{f.dificuldade}</span>
                </span>
                <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {concluida ? "OK" : atual ? "▶ ativo" : "—"}
                </span>
              </button>
              {i < fases.length - 1 && (
                <span
                  className="ml-[1.05rem] block h-3 w-px"
                  style={{ background: concluida ? "var(--sucesso)" : "var(--border)" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Estante de conquistas estilo PlayStation. */
export function Conquistas({ progresso }: { progresso: Progresso }) {
  const desbloqueadas = new Set(conquistasAtivas(estatisticasDe(progresso)));
  const total = CONQUISTAS.length;
  const obtidas = CONQUISTAS.filter((c) => desbloqueadas.has(c.id)).length;

  return (
    <div className="painel-holo chanfro p-4">
      <div className="flex items-baseline justify-between">
        <p className="etiqueta">🏆 Conquistas</p>
        <span className="text-[0.65rem] font-bold tabular-nums text-[var(--conquista)]">
          {obtidas}/{total}
        </span>
      </div>
      <ul className="mt-3 grid gap-2">
        {CONQUISTAS.map((c) => {
          const ok = desbloqueadas.has(c.id);
          return (
            <li
              key={c.id}
              className={`chanfro-suave flex items-center gap-3 border bg-black/30 px-3 py-2 transition-all ${
                ok ? classeRaridade(c.raridade) : "border-border/60 opacity-40 grayscale"
              }`}
            >
              <span className="text-lg">{c.icone}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.7rem] font-bold uppercase tracking-wider">
                  {c.nome}
                </span>
                <span className="block truncate text-[0.6rem] text-muted-foreground">
                  {c.descricao}
                </span>
              </span>
              <span className="shrink-0 text-[0.6rem] font-bold tabular-nums">+{c.recompensa}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
