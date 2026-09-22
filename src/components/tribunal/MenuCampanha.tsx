import { useState } from "react";
import { FASES, type Fase } from "@/lib/tribunal/fases";
import type { Progresso } from "@/lib/tribunal/db";
import { formatarXP } from "@/lib/tribunal/progressao";
import type { Nivel } from "@/lib/tribunal/progressao";
import { Conquistas, MapaProgressao } from "./HudGamer";

type Historico = {
  id: string;
  titulo: string;
  delta_pontos: number;
  fase: number;
  tipo: string;
  missao: string;
};

const COR_DIFICULDADE: Record<Fase["dificuldade"], string> = {
  Fácil: "var(--sucesso)",
  Moderada: "var(--color-neon)",
  Difícil: "var(--patente)",
  Brutal: "var(--alerta)",
  Lendária: "var(--color-sistema)",
};

/** Menu principal de campanha — seleção de missão, mapa e conquistas. */
export function MenuCampanha({
  progresso,
  nivel,
  faseSelecionada,
  aoSelecionarFase,
  aoIniciar,
  historico,
}: {
  progresso: Progresso;
  nivel: Nivel;
  faseSelecionada: Fase;
  aoSelecionarFase: (id: number) => void;
  aoIniciar: () => void;
  historico: Historico[];
}) {
  const [aba, setAba] = useState<"missao" | "mapa" | "conquistas">("missao");
  const desbloqueada = faseSelecionada.id <= progresso.fase;

  return (
    <div className="entrada-hud relative z-10 grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <nav className="painel-holo chanfro flex flex-wrap gap-px overflow-hidden p-1">
          {(
            [
              ["missao", "⚔️ Missão atual"],
              ["mapa", "🗺️ Mapa de progressão"],
              ["conquistas", "🏆 Conquistas"],
            ] as const
          ).map(([id, rotulo]) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`chanfro-suave flex-1 px-4 py-2.5 text-[0.66rem] font-bold uppercase tracking-[0.2em] transition-all ${
                aba === id
                  ? "neon-borda bg-black/50 neon-texto"
                  : "text-muted-foreground hover:bg-black/30 hover:text-foreground"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </nav>

        {aba === "missao" && (
          <div className="painel-holo chanfro entrada-hud p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="neon-texto font-[family-name:var(--font-display)] text-[0.72rem] font-bold uppercase tracking-[0.34em]">
                  {faseSelecionada.missao}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
                  {faseSelecionada.tipoMissao}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">{faseSelecionada.descricao}</p>
              </div>
              <span
                className="chanfro-suave shrink-0 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-black"
                style={{ background: COR_DIFICULDADE[faseSelecionada.dificuldade] }}
              >
                {faseSelecionada.dificuldade}
              </span>
            </div>

            <div className="mt-5 chanfro-suave border-l-2 border-[var(--color-neon)] bg-black/40 p-4">
              <p className="etiqueta">Tema imposto</p>
              <p className="mt-1 text-sm leading-relaxed">{faseSelecionada.tema}</p>
            </div>

            <ul className="mt-5 grid gap-2 sm:grid-cols-3">
              {faseSelecionada.exigencias.map((e) => (
                <li
                  key={e}
                  className="chanfro-suave border border-border bg-black/25 p-3 text-[0.68rem] uppercase tracking-wider text-muted-foreground"
                >
                  {e}
                </li>
              ))}
            </ul>

            <div className="mt-5 chanfro-suave border border-[var(--patente)]/50 bg-black/40 p-4">
              <p className="etiqueta text-[var(--patente)]">Recompensas da missão</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[0.72rem] font-bold uppercase tracking-[0.14em]">
                <span className="text-[var(--patente)]">
                  +{formatarXP(faseSelecionada.recompensaXP)} XP
                </span>
                <span className="text-[var(--color-neon)]">
                  +{faseSelecionada.recompensaConhecimento} Conhecimento
                </span>
                <span className="text-[var(--conquista)]">
                  +{faseSelecionada.recompensaMoedas} Moedas
                </span>
                <span className="text-foreground">
                  +{faseSelecionada.recompensaMedalhas} Medalha(s)
                </span>
              </div>
              <p className="etiqueta mt-2">
                Bônus de combo ativo: ×{(1 + Math.min(progresso.combo, 10) * 0.25).toFixed(2)} —
                sequência de {progresso.combo}
              </p>
            </div>

            <div className="mt-5 chanfro-suave border border-destructive/45 bg-destructive/10 p-4 text-xs leading-relaxed">
              <p className="font-bold uppercase tracking-[0.18em] text-destructive">
                Regime de vigilância
              </p>
              <p className="mt-2 text-muted-foreground">
                Trocar de aba, minimizar, clicar fora da janela ou colar conteúdo externo = game
                over imediato, perda de pontos, perda de estabilidade e banimento permanente. O
                corretor ortográfico nativo está desativado — desvios disparam escolha de três
                alternativas sob cronômetro.
              </p>
            </div>

            <button
              onClick={aoIniciar}
              disabled={!desbloqueada}
              className="chanfro-suave mt-6 w-full border border-[var(--color-neon)] bg-[color-mix(in_oklab,var(--color-neon)_14%,transparent)] px-4 py-4 font-[family-name:var(--font-display)] text-sm font-extrabold uppercase tracking-[0.26em] text-[var(--color-neon)] transition-all hover:bg-[var(--color-neon)] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--color-neon)]"
            >
              {desbloqueada
                ? `▶ Iniciar missão — ${Math.floor(faseSelecionada.tempoSegundos / 60)} min`
                : "🔒 Etapa bloqueada — conclua a anterior"}
            </button>

            {historico.length > 0 && (
              <div className="mt-7">
                <p className="etiqueta">Histórico de combate</p>
                <ul className="mt-2 divide-y divide-border/70 chanfro-suave border border-border/70 bg-black/25">
                  {historico.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-[0.68rem]"
                    >
                      <span className="truncate uppercase tracking-wider">
                        <span className="mr-2 text-muted-foreground">{h.missao}</span>
                        {h.titulo}
                      </span>
                      <span
                        className={`shrink-0 font-bold tabular-nums ${
                          h.delta_pontos >= 0 ? "text-[var(--sucesso)]" : "text-destructive"
                        }`}
                      >
                        {h.delta_pontos >= 0 ? "+" : ""}
                        {h.delta_pontos}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {aba === "mapa" && (
          <div className="painel-holo chanfro entrada-hud p-6">
            <p className="etiqueta">Trilha da civilização</p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase">
              Reconstrução do conhecimento
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Cada etapa concluída devolve um fragmento da civilização e libera a próxima. Sete
              graus separam você do colapso e da Academia Suprema.
            </p>
            <div className="mt-5">
              <MapaProgressao
                fases={FASES}
                faseAtual={progresso.fase}
                aoSelecionar={aoSelecionarFase}
              />
            </div>
          </div>
        )}

        {aba === "conquistas" && (
          <div className="entrada-hud">
            <Conquistas progresso={progresso} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="painel-holo chanfro p-4">
          <p className="etiqueta">Briefing do Alto Comando</p>
          <p className="mt-2 text-[0.72rem] leading-relaxed text-muted-foreground">
            O colapso intelectual apagou quase todo o conhecimento humano. Você é o Recruta
            Acadêmico
            <span className="neon-texto"> {nivel.patente.nome}</span>, nível {nivel.nivel}.
            Atravesse os graus da civilização, recupere fragmentos perdidos e prove que a humanidade
            ainda sabe pensar.
          </p>
        </div>

        <div className="painel-holo chanfro p-4">
          <p className="etiqueta">Setores da campanha</p>
          <ul className="mt-2 space-y-1.5">
            {FASES.map((f) => {
              const estado =
                f.id < progresso.fase ? "ok" : f.id === progresso.fase ? "ativo" : "bloq";
              return (
                <li
                  key={f.id}
                  className={`flex items-center justify-between gap-2 text-[0.66rem] uppercase tracking-[0.14em] ${
                    estado === "ok"
                      ? "text-[var(--sucesso)]"
                      : estado === "ativo"
                        ? "neon-texto"
                        : "text-muted-foreground/45"
                  }`}
                >
                  <span className="truncate">
                    {String(f.id).padStart(2, "0")} · {f.etapa}
                  </span>
                  <span>{estado === "ok" ? "✓" : estado === "ativo" ? "▶" : "🔒"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <Conquistas progresso={progresso} />
      </div>
    </div>
  );
}
