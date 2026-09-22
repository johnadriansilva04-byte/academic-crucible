import { useEffect, useMemo, useState } from "react";
import type { Fase } from "@/lib/tribunal/fases";
import type { Veredicto } from "@/lib/tribunal/motor";
import type { Nivel } from "@/lib/tribunal/progressao";
import { CONQUISTAS, formatarXP } from "@/lib/tribunal/progressao";
import { BarraXP, ContadorAnimado } from "./CabecalhoJogador";

export type ResultadoCampanha = {
  veredicto: Veredicto;
  fase: Fase;
  nivelAntes: Nivel;
  nivelDepois: Nivel;
  conquistasNovas: string[];
  xpTotalAntes: number;
  xpTotalDepois: number;
};

/** Tela cinematográfica de conclusão/reprovação — nunca apenas texto. */
export function TelaResultado({
  resultado,
  aoContinuar,
}: {
  resultado: ResultadoCampanha;
  aoContinuar: () => void;
}) {
  const { veredicto, fase, nivelAntes, nivelDepois, conquistasNovas, xpTotalAntes, xpTotalDepois } =
    resultado;
  const aprovado = veredicto.aprovado;
  const [etapa, setEtapa] = useState(0);

  // Revelação em etapas: recompensa → conquista → patente → botão.
  useEffect(() => {
    const marcos = [420, 1200, 1900, 2500];
    const timers = marcos.map((ms, i) => setTimeout(() => setEtapa(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [resultado]);

  const subiuPatente = nivelDepois.nivel > nivelAntes.nivel;
  const novasConquistas = useMemo(
    () => CONQUISTAS.filter((c) => conquistasNovas.includes(c.id)),
    [conquistasNovas],
  );

  return (
    <div
      className={`painel-holo chanfro relative flex h-full flex-col overflow-hidden p-6 sm:p-8 ${
        aprovado ? "" : "alerta-vermelho"
      }`}
    >
      {aprovado && (
        <span
          aria-hidden
          className="flash-aprovado pointer-events-none absolute inset-0 z-20 bg-white"
        />
      )}
      <span
        aria-hidden
        className="varredura pointer-events-none absolute inset-x-0 top-0 h-24 opacity-30"
        style={{
          background: "linear-gradient(180deg, transparent, var(--color-neon), transparent)",
        }}
      />

      <p className={`etiqueta ${aprovado ? "neon-texto" : "text-destructive pulsar"}`}>
        {aprovado ? "Transmissão do Alto Comando Acadêmico" : "Falha registrada no sistema"}
      </p>

      <div className={`mt-3 ${aprovado ? "" : "glitch"}`}>
        <p className="font-[family-name:var(--font-display)] text-[0.7rem] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          ═══════════════════
        </p>
        <h2
          className={`font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase tracking-tight sm:text-5xl ${
            aprovado ? "neon-texto" : "text-destructive"
          }`}
        >
          {aprovado ? "Missão Concluída" : "Missão Fracassada"}
        </h2>
        <p className="font-[family-name:var(--font-display)] text-[0.7rem] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          ═══════════════════
        </p>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{veredicto.sentenca}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Recompensa
          visivel={etapa >= 1}
          icone="⭐"
          rotulo="XP"
          valor={veredicto.recompensas.xp}
          tom="patente"
          sufixo={
            veredicto.recompensas.multiplicador > 1
              ? `×${veredicto.recompensas.multiplicador}`
              : undefined
          }
        />
        <Recompensa
          visivel={etapa >= 1}
          icone="📚"
          rotulo="Conhecimento"
          valor={veredicto.recompensas.conhecimento}
          tom="neon"
        />
        <Recompensa
          visivel={etapa >= 1}
          icone="🪙"
          rotulo="Moedas"
          valor={veredicto.recompensas.moedas}
          tom="conquista"
        />
      </div>

      {veredicto.recompensas.medalhas > 0 && (
        <p
          className={`mt-2 text-[0.68rem] uppercase tracking-[0.18em] ${etapa >= 1 ? "subir-contador" : "opacity-0"}`}
        >
          <span className="text-[var(--conquista)]">
            {"✦".repeat(veredicto.recompensas.medalhas)} +{veredicto.recompensas.medalhas}{" "}
            medalha(s) de campanha
          </span>
        </p>
      )}

      <div
        className={`mt-6 transition-opacity duration-500 ${etapa >= 1 ? "opacity-100" : "opacity-0"}`}
      >
        <BarraXP
          percentual={nivelDepois.percentual}
          rotulo="Barra de patente"
          detalhe={`${formatarXP(nivelDepois.xpNoNivel)} / ${formatarXP(nivelDepois.xpNecessario)}`}
          tom={aprovado ? "neon" : "perigo"}
        />
        <div className="relative mt-1 h-5">
          {aprovado && veredicto.recompensas.xp > 0 && (
            <span className="xp-voador absolute right-2 top-1 text-[0.68rem] font-bold text-[var(--patente)]">
              +{formatarXP(veredicto.recompensas.xp)} XP
            </span>
          )}
        </div>
      </div>

      {novasConquistas.length > 0 && (
        <div
          className={`mt-4 transition-all duration-500 ${etapa >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          <p className="etiqueta">Conquista desbloqueada</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {novasConquistas.map((c) => (
              <li
                key={c.id}
                className="chanfro-suave flex items-center gap-3 border border-[var(--conquista)] bg-black/40 px-3 py-2"
                style={{ boxShadow: "0 0 26px -10px var(--conquista)" }}
              >
                <span className="text-xl">{c.icone}</span>
                <span>
                  <span className="block text-[0.72rem] font-bold uppercase tracking-wider text-[var(--conquista)]">
                    {c.nome}
                  </span>
                  <span className="block text-[0.6rem] text-muted-foreground">{c.descricao}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`mt-5 transition-all duration-500 ${etapa >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
      >
        {subiuPatente ? (
          <div className="chanfro-suave border border-[var(--patente)]/60 bg-black/40 p-4">
            <p className="etiqueta text-[var(--patente)]">Patente atualizada</p>
            <p className="mt-1 flex flex-wrap items-center gap-3 font-[family-name:var(--font-display)] text-lg font-extrabold uppercase">
              <span className="text-muted-foreground">{nivelAntes.patente.nome}</span>
              <span className="neon-texto">➜</span>
              <span className="neon-texto">{nivelDepois.patente.nome}</span>
            </p>
            <p className="etiqueta mt-1">
              Nível {nivelAntes.nivel} ➜ {nivelDepois.nivel}
            </p>
          </div>
        ) : (
          <div className="chanfro-suave border border-border bg-black/40 p-4">
            <p className="etiqueta">Patente mantida</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-base font-extrabold uppercase">
              {nivelDepois.patente.nome}
            </p>
            <p className="etiqueta mt-1">
              {aprovado
                ? `Faltam ${formatarXP(nivelDepois.faltam)} XP para a próxima patente`
                : `Instabilidade registrada · ${fase.grau} repetido`}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        <Metrica rotulo="Nota" valor={`${veredicto.nota}/100`} />
        <Metrica
          rotulo="XP acumulado"
          valor={<ContadorAnimado valor={xpTotalDepois} formatar={formatarXP} />}
        />
        <Metrica rotulo="Coesão" valor={`${veredicto.metricas.coesao}%`} />
        <Metrica rotulo="Argumentação" valor={`${veredicto.metricas.densidadeArgumentativa}%`} />
        <Metrica rotulo="Vocabulário" valor={`${veredicto.metricas.vocabularioElevado}%`} />
        <Metrica rotulo="Diversidade" valor={`${veredicto.metricas.diversidade}%`} />
        <Metrica rotulo="Fragmentos" valor={String(veredicto.metricas.palavras)} />
        <Metrica rotulo="Média/frase" valor={String(veredicto.metricas.mediaFrase)} />
      </div>

      {veredicto.criticas.length > 0 && (
        <div className="mt-5">
          <p className="etiqueta">Apontamentos da banca</p>
          <ul className="mt-2 space-y-1">
            {veredicto.criticas.map((c) => (
              <li
                key={c}
                className="border-l-2 border-destructive/60 pl-3 text-[0.72rem] text-muted-foreground"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="etiqueta mt-4">
        XP final: {formatarXP(xpTotalAntes)} ➜ {formatarXP(xpTotalDepois)}
      </p>

      <button
        onClick={aoContinuar}
        className={`chanfro-suave mt-auto w-full border px-4 py-4 text-xs font-bold uppercase tracking-[0.24em] transition-transform hover:scale-[1.01] ${
          etapa >= 4 ? "subir-contador" : "opacity-0"
        } ${aprovado ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground" : "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"}`}
      >
        {aprovado ? "▶ Continuar Campanha" : "↻ Repetir Missão"}
      </button>
    </div>
  );
}

function Recompensa({
  visivel,
  icone,
  rotulo,
  valor,
  tom,
  sufixo,
}: {
  visivel: boolean;
  icone: string;
  rotulo: string;
  valor: number;
  tom: "patente" | "neon" | "conquista";
  sufixo?: string | undefined;
}) {
  const cor =
    tom === "patente"
      ? "var(--patente)"
      : tom === "neon"
        ? "var(--color-neon)"
        : "var(--conquista)";
  return (
    <div
      className={`chanfro-suave border bg-black/40 p-3 transition-all duration-500 ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
      style={{ borderColor: `color-mix(in oklab, ${cor} 45%, transparent)` }}
    >
      <p className="etiqueta">
        <span className="mr-1">{icone}</span>
        {rotulo}
      </p>
      <p
        className="mt-1 font-[family-name:var(--font-display)] text-2xl font-extrabold tabular-nums"
        style={{ color: cor }}
      >
        +<ContadorAnimado valor={valor} formatar={formatarXP} />
      </p>
      {sufixo && <p className="etiqueta mt-0.5">Combo {sufixo}</p>}
    </div>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="bg-black/40 p-3">
      <p className="etiqueta">{rotulo}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums">{valor}</p>
    </div>
  );
}
