import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { FASES, getFase } from "@/lib/tribunal/fases";
import { analisar, type Veredicto } from "@/lib/tribunal/motor";
import { detectarDesvio, sortearDesafio, type DesafioOrtografico } from "@/lib/tribunal/corretor";
import { carregarProgresso, listarVeredictos, registrarVeredicto, salvarProgresso, type Progresso } from "@/lib/tribunal/db";
import { useVigilancia } from "@/hooks/useVigilancia";
import { PainelStatus } from "@/components/tribunal/PainelStatus";
import { CorretorSabotado } from "@/components/tribunal/CorretorSabotado";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tribunal Acadêmico — RPG de sobrevivência textual" },
      {
        name: "description",
        content:
          "Suba do fundamental ao artigo científico escrevendo sob vigilância total, corretor sabotado e julgamento implacável.",
      },
      { property: "og:title", content: "Tribunal Acadêmico — RPG de sobrevivência textual" },
      {
        property: "og:description",
        content: "Escreva sob cronômetro, sem fugir da aba, e enfrente o veredito do tribunal.",
      },
    ],
  }),
  component: Jogo,
});

type Tela = "carregando" | "deslogado" | "briefing" | "missao" | "veredicto" | "fuga";

const MOTIVOS: Record<string, string> = {
  aba: "TROCA DE ABA DETECTADA",
  foco: "PERDA DE FOCO DA JANELA",
  colagem: "TENTATIVA DE COLAGEM EXTERNA",
};

const HUMILHACOES = [
  "O candidato abandonou a prova como quem foge da sala pela janela. Reprovação sumária.",
  "Vigilância registrou evasão. Nenhum doutor jamais nasceu de quem não aguenta dez minutos de silêncio.",
  "Fuga documentada no histórico escolar. O tribunal classifica o feito como covardia intelectual.",
];

function Jogo() {
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<Session | null>(null);
  const [tela, setTela] = useState<Tela>("carregando");
  const [progresso, setProgresso] = useState<Progresso | null>(null);
  const [historico, setHistorico] = useState<Awaited<ReturnType<typeof listarVeredictos>>>([]);
  const [texto, setTexto] = useState("");
  const [tempo, setTempo] = useState(0);
  const [desafio, setDesafio] = useState<DesafioOrtografico | null>(null);
  const [alerta, setAlerta] = useState<string | null>(null);
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [motivoFuga, setMotivoFuga] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const desafiadas = useRef<Set<string>>(new Set());
  const textoRef = useRef("");

  const fase = useMemo(() => getFase(progresso?.fase ?? 1), [progresso]);
  const palavras = useMemo(() => texto.trim().split(/\s+/).filter(Boolean).length, [texto]);

  useEffect(() => {
    textoRef.current = texto;
  }, [texto]);

  useEffect(() => {
    let vivo = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!vivo) return;
      if (!data.session) {
        setSessao(null);
        setTela("deslogado");
        return;
      }
      setSessao(data.session);
      const p = await carregarProgresso(
        data.session.user.id,
        data.session.user.email?.split("@")[0] ?? null,
      );
      if (!vivo) return;
      setProgresso(p);
      setHistorico(await listarVeredictos(data.session.user.id));
      setTela("briefing");
    });
    return () => {
      vivo = false;
    };
  }, []);

  // ---- Carcereiro de abas ----
  const punirFuga = useCallback(
    async (motivo: "aba" | "foco" | "colagem") => {
      if (!progresso || !sessao) return;
      setMotivoFuga(MOTIVOS[motivo] ?? "IRREGULARIDADE DETECTADA");
      setTela("fuga");
      const penalidade = -40 - fase.id * 10;
      const humilhacao = HUMILHACOES[Math.floor(Math.random() * HUMILHACOES.length)] ?? HUMILHACOES[0]!;

      const atualizado = await salvarProgresso(sessao.user.id, {
        pontuacao: progresso.pontuacao + penalidade,
        reprovacoes: progresso.reprovacoes + 1,
        banimentos: progresso.banimentos + 1,
      });
      await registrarVeredicto(sessao.user.id, fase.id, fase.missao, "fuga", {
        titulo: "GAME OVER — FUGA DA PROVA",
        sentenca: humilhacao,
        nota: 0,
        deltaPontos: penalidade,
      });
      setProgresso(atualizado);
      setHistorico(await listarVeredictos(sessao.user.id));
    },
    [progresso, sessao, fase],
  );

  useVigilancia(tela === "missao", (motivo) => void punirFuga(motivo));

  // ---- Cronômetro ----
  useEffect(() => {
    if (tela !== "missao") return;
    if (tempo <= 0) {
      void julgar();
      return;
    }
    const t = setTimeout(() => setTempo((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tela, tempo]);

  // ---- Checagem aleatória de vocabulário ----
  useEffect(() => {
    if (tela !== "missao" || desafio) return;
    const t = setTimeout(() => setDesafio(sortearDesafio()), 75000);
    return () => clearTimeout(t);
  }, [tela, desafio, tempo === 0]);

  function iniciarMissao() {
    setTexto("");
    setVeredicto(null);
    desafiadas.current = new Set();
    setTempo(fase.tempoSegundos);
    setTela("missao");
  }

  function aoDigitar(valor: string) {
    setTexto(valor);
    if (desafio) return;
    const ultima = valor.toLowerCase().trim().split(/\s+/).pop() ?? "";
    if (ultima.length > 3 && !desafiadas.current.has(ultima) && detectarDesvio(ultima)) {
      desafiadas.current.add(ultima);
      setDesafio(sortearDesafio());
    }
  }

  function resolverCorretor(acertou: boolean) {
    setDesafio(null);
    if (acertou) {
      setAlerta("GRAFIA ACEITA. PROSSIGA.");
    } else {
      setTempo((s) => Math.max(0, s - 30));
      setAlerta("ALTERNATIVA ERRADA. -30s DE PENALIDADE.");
    }
    setTimeout(() => setAlerta(null), 3000);
  }

  async function julgar() {
    if (!sessao || !progresso || processando) return;
    setProcessando(true);
    const v = analisar(textoRef.current, fase);
    setVeredicto(v);
    setTela("veredicto");

    const novaFase = v.aprovado ? Math.min(fase.id + 1, FASES.length) : fase.id;
    const atualizado = await salvarProgresso(sessao.user.id, {
      fase: novaFase,
      pontuacao: progresso.pontuacao + v.deltaPontos,
      aprovacoes: progresso.aprovacoes + (v.aprovado ? 1 : 0),
      reprovacoes: progresso.reprovacoes + (v.aprovado ? 0 : 1),
    });
    await registrarVeredicto(sessao.user.id, fase.id, fase.missao, "julgamento", { ...v, metricas: v.metricas });
    setProgresso(atualizado);
    setHistorico(await listarVeredictos(sessao.user.id));
    setProcessando(false);
  }

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (tela === "carregando") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="etiqueta pulsar">Estabelecendo conexão com o tribunal…</p>
      </main>
    );
  }

  if (tela === "deslogado" || !progresso) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="painel max-w-md p-8 text-center">
          <p className="etiqueta">Acesso restrito</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase">
            Tribunal Acadêmico
          </h1>
          <p className="mt-3 text-xs text-muted-foreground">
            Sem matrícula não há julgamento. Registre-se para iniciar a escalada do ensino fundamental ao artigo
            científico de elite.
          </p>
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="mt-6 w-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
          >
            Efetuar matrícula
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6">
      <header className="painel mb-4 flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-[family-name:var(--font-display)] text-lg font-extrabold uppercase tracking-tight">
            Tribunal Acadêmico
          </span>
          <span className="etiqueta">Terminal de avaliação v1.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[0.7rem] text-muted-foreground">{progresso.apelido ?? sessao?.user.email}</span>
          <button onClick={sair} className="etiqueta hover:text-destructive">Encerrar sessão</button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <PainelStatus
          progresso={progresso}
          fase={fase}
          palavras={palavras}
          tempo={tela === "missao" ? tempo : fase.tempoSegundos}
          emMissao={tela === "missao"}
        />

        <section className="min-h-[70vh]">
          {tela === "briefing" && (
            <div className="painel h-full p-6">
              <p className="etiqueta">Missão {fase.missao}</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase">
                {fase.genero}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{fase.descricao}</p>

              <div className="mt-6 border-l-2 border-primary bg-secondary/40 p-4">
                <p className="etiqueta">Tema imposto</p>
                <p className="mt-1 text-sm leading-relaxed">{fase.tema}</p>
              </div>

              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {fase.exigencias.map((e) => (
                  <li key={e} className="border border-border p-3 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                    {e}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border border-destructive/40 bg-destructive/10 p-4 text-xs leading-relaxed">
                <p className="font-bold uppercase tracking-[0.18em] text-destructive">Regime de vigilância</p>
                <p className="mt-2 text-muted-foreground">
                  Ao iniciar, trocar de aba, minimizar, clicar fora da janela ou colar conteúdo externo resulta em
                  game over imediato, perda de pontos e registro permanente de banimento. O corretor ortográfico
                  nativo está desativado — desvios disparam uma escolha de três alternativas sob cronômetro.
                </p>
              </div>

              <button
                onClick={iniciarMissao}
                className="mt-6 w-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground hover:opacity-90"
              >
                Iniciar julgamento — {Math.floor(fase.tempoSegundos / 60)} min
              </button>

              {historico.length > 0 && (
                <div className="mt-8">
                  <p className="etiqueta">Histórico de veredictos</p>
                  <ul className="mt-2 divide-y divide-border border border-border">
                    {historico.map((h) => (
                      <li key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[0.7rem]">
                        <span className="truncate uppercase tracking-wider">{h.titulo}</span>
                        <span className={h.delta_pontos >= 0 ? "text-[var(--sucesso)]" : "text-destructive"}>
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

          {tela === "missao" && (
            <div className="painel flex h-full flex-col p-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <p className="etiqueta text-destructive pulsar">● Gravando — vigilância ativa</p>
                <p className="etiqueta">{fase.missao}</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{fase.tema}</p>

              {alerta && (
                <p className="mt-3 border border-primary bg-primary/10 px-3 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-primary">
                  {alerta}
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
                placeholder="Escreva. O tribunal não aceita rascunhos importados."
                className="mt-4 min-h-[50vh] flex-1 resize-none border border-input bg-background p-4 text-sm leading-relaxed outline-none focus:border-primary"
              />

              <button
                onClick={() => void julgar()}
                disabled={processando}
                className="mt-4 w-full border border-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
              >
                Submeter ao tribunal
              </button>
            </div>
          )}

          {tela === "veredicto" && veredicto && (
            <div className="painel h-full p-6">
              <p className="etiqueta">Sentença do tribunal</p>
              <h2
                className={`mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase ${
                  veredicto.aprovado ? "text-[var(--sucesso)]" : "text-destructive"
                }`}
              >
                {veredicto.titulo}
              </h2>
              <p className="mt-3 text-sm leading-relaxed">{veredicto.sentenca}</p>

              <div className="mt-6 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                <Metrica rotulo="Nota" valor={`${veredicto.nota}/100`} />
                <Metrica rotulo="Pontos" valor={`${veredicto.deltaPontos >= 0 ? "+" : ""}${veredicto.deltaPontos}`} />
                <Metrica rotulo="Coesão" valor={`${veredicto.metricas.coesao}%`} />
                <Metrica rotulo="Argumentação" valor={`${veredicto.metricas.densidadeArgumentativa}%`} />
                <Metrica rotulo="Vocabulário" valor={`${veredicto.metricas.vocabularioElevado}%`} />
                <Metrica rotulo="Diversidade" valor={`${veredicto.metricas.diversidade}%`} />
                <Metrica rotulo="Palavras" valor={String(veredicto.metricas.palavras)} />
                <Metrica rotulo="Média/frase" valor={String(veredicto.metricas.mediaFrase)} />
              </div>

              {veredicto.criticas.length > 0 && (
                <div className="mt-6">
                  <p className="etiqueta">Apontamentos da banca</p>
                  <ul className="mt-2 space-y-1">
                    {veredicto.criticas.map((c) => (
                      <li key={c} className="border-l-2 border-destructive/60 pl-3 text-xs text-muted-foreground">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setTela("briefing")}
                className="mt-8 w-full bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-primary-foreground"
              >
                {veredicto.aprovado ? "Avançar de grau" : "Repetir o ano"}
              </button>
            </div>
          )}

          {tela === "fuga" && (
            <div className="painel flex h-full flex-col items-center justify-center border-destructive p-8 text-center">
              <p className="etiqueta text-destructive pulsar">{motivoFuga}</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-extrabold uppercase text-destructive">
                Game Over
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                O carcereiro de abas registrou sua evasão. Prova anulada, pontuação descontada e banimento anotado no
                seu histórico permanente. O tribunal considera o candidato indigno do grau pretendido.
              </p>
              <button
                onClick={() => setTela("briefing")}
                className="mt-8 border border-destructive px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Voltar ao banco dos réus
              </button>
            </div>
          )}
        </section>
      </div>

      {desafio && <CorretorSabotado desafio={desafio} onResolver={resolverCorretor} />}
    </main>
  );
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="bg-card p-3">
      <p className="etiqueta">{rotulo}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums">{valor}</p>
    </div>
  );
}
