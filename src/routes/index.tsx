import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { FASES, getFase } from "@/lib/tribunal/fases";
import { analisar } from "@/lib/tribunal/motor";
import { detectarDesvio, sortearDesafio, type DesafioOrtografico } from "@/lib/tribunal/corretor";
import {
  carregarProgresso,
  listarVeredictos,
  modoDegradado,
  registrarVeredicto,
  salvarProgresso,
  type Progresso,
} from "@/lib/tribunal/db";
import {
  calcularNivel,
  conquistasAtivas,
  estatisticasDe,
  formatarXP,
} from "@/lib/tribunal/progressao";
import { somAlerta, somConquista, somFalha, somHud, somRecompensa } from "@/lib/tribunal/sons";
import { useVigilancia } from "@/hooks/useVigilancia";
import { CabecalhoJogador } from "@/components/tribunal/CabecalhoJogador";
import { HudGamer } from "@/components/tribunal/HudGamer";
import { MenuCampanha } from "@/components/tribunal/MenuCampanha";
import { TelaMissao } from "@/components/tribunal/TelaMissao";
import { TelaResultado, type ResultadoCampanha } from "@/components/tribunal/TelaResultado";
import { CorretorSabotado } from "@/components/tribunal/CorretorSabotado";
import { Particulas } from "@/components/tribunal/Particulas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tribunal Acadêmico — Campanha de Reconstrução do Conhecimento" },
      {
        name: "description",
        content:
          "Campanha militar-acadêmica: suba do ensino fundamental à Academia Suprema, recupere fragmentos de conhecimento e evolua sua patente sob vigilância total.",
      },
      {
        property: "og:title",
        content: "Tribunal Acadêmico — Campanha de Reconstrução do Conhecimento",
      },
      {
        property: "og:description",
        content:
          "Conclua missões de escrita, ganhe XP, conquistas e patentes. O colapso intelectual espera por você.",
      },
    ],
  }),
  component: Jogo,
});

type Tela = "carregando" | "deslogado" | "menu" | "missao" | "resultado" | "fuga";

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
  const [alerta, setAlerta] = useState<{ texto: string; tom: "ok" | "erro" } | null>(null);
  const [resultado, setResultado] = useState<ResultadoCampanha | null>(null);
  const [motivoFuga, setMotivoFuga] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [fx, setFx] = useState<"aprovado" | "reprovado" | null>(null);
  const [faseSelecionadaId, setFaseSelecionadaId] = useState(1);
  const desafiadas = useRef<Set<string>>(new Set());
  const textoRef = useRef("");
  const tempoRef = useRef(0);

  const fase = useMemo(() => getFase(faseSelecionadaId), [faseSelecionadaId]);
  const progressoAtual = useMemo(() => progresso ?? null, [progresso]);
  const nivel = useMemo(() => calcularNivel(progressoAtual?.pontuacao ?? 0), [progressoAtual]);
  const palavras = useMemo(() => texto.trim().split(/\s+/).filter(Boolean).length, [texto]);

  useEffect(() => {
    textoRef.current = texto;
  }, [texto]);

  useEffect(() => {
    tempoRef.current = tempo;
  }, [tempo]);

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
      setFaseSelecionadaId(p.fase);
      setHistorico(await listarVeredictos(data.session.user.id));
      setTela("menu");
    });
    return () => {
      vivo = false;
    };
  }, []);

  // ---- Carcereiro de abas ----
  const punirFuga = useCallback(
    async (motivo: "aba" | "foco" | "colagem") => {
      const atual = progressoAtual;
      if (!atual || !sessao) return;
      setMotivoFuga(MOTIVOS[motivo] ?? "IRREGULARIDADE DETECTADA");
      setTela("fuga");
      somAlerta();
      const penalidade = -40 - fase.id * 10;
      const humilhacao =
        HUMILHACOES[Math.floor(Math.random() * HUMILHACOES.length)] ?? HUMILHACOES[0]!;

      const atualizado = await salvarProgresso(sessao.user.id, {
        pontuacao: Math.max(0, atual.pontuacao + penalidade),
        reprovacoes: atual.reprovacoes + 1,
        banimentos: atual.banimentos + 1,
        combo: 0,
      });
      await registrarVeredicto(sessao.user.id, fase.id, fase.missao, "fuga", {
        titulo: "GAME OVER — FUGA DA MISSÃO",
        sentenca: humilhacao,
        nota: 0,
        deltaPontos: penalidade,
      });
      setProgresso(atualizado);
      setHistorico(await listarVeredictos(sessao.user.id));
    },
    [progressoAtual, sessao, fase],
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
  }, [tela, desafio]);

  function iniciarMissao() {
    setTexto("");
    setResultado(null);
    setFx(null);
    desafiadas.current = new Set();
    setTempo(fase.tempoSegundos);
    somHud();
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
      setAlerta({ texto: "GRAFIA ACEITA. PROSSIGA, RECRUTA.", tom: "ok" });
      somHud();
    } else {
      setTempo((s) => Math.max(0, s - 30));
      setAlerta({ texto: "ALTERNATIVA ERRADA. -30s · INSTABILIDADE +6%", tom: "erro" });
      somFalha();
    }
    setTimeout(() => setAlerta(null), 3000);
  }

  async function julgar() {
    const atual = progressoAtual;
    if (!sessao || !atual || processando) return;
    setProcessando(true);

    const v = analisar(textoRef.current, fase, atual.combo);
    const nivelAntes = calcularNivel(atual.pontuacao);
    const xpTotalDepois = atual.pontuacao + v.recompensas.xp;
    const nivelDepois = calcularNivel(xpTotalDepois);

    const combo = v.aprovado ? atual.combo + 1 : 0;
    const proximaFase = v.aprovado ? Math.min(fase.id + 1, FASES.length) : fase.id;
    const melhorNota = Math.max(atual.melhor_nota, v.nota);
    const melhorNotaAvancada =
      fase.id >= 3 ? Math.max(atual.melhor_nota_avancada, v.nota) : atual.melhor_nota_avancada;

    const patch: Partial<Progresso> = {
      fase: proximaFase,
      pontuacao: xpTotalDepois,
      xp: xpTotalDepois,
      aprovacoes: atual.aprovacoes + (v.aprovado ? 1 : 0),
      reprovacoes: atual.reprovacoes + (v.aprovado ? 0 : 1),
      combo,
      combo_maximo: Math.max(atual.combo_maximo, combo),
      moedas: atual.moedas + v.recompensas.moedas,
      conhecimento: atual.conhecimento + v.recompensas.conhecimento,
      medalhas: atual.medalhas + v.recompensas.medalhas,
      missoes_concluidas: atual.missoes_concluidas + (v.aprovado ? 1 : 0),
      melhor_nota: melhorNota,
      melhor_nota_avancada: melhorNotaAvancada,
      campanha_concluida: atual.campanha_concluida || (v.aprovado && fase.id === FASES.length),
    };

    const candidato: Progresso = { ...atual, ...patch };
    const anteriores = new Set(conquistasAtivas(estatisticasDe(atual)));
    const conquistasNovas = conquistasAtivas(estatisticasDe(candidato)).filter(
      (c) => !anteriores.has(c),
    );
    patch.conquistas = Array.from(new Set([...atual.conquistas, ...conquistasNovas]));

    // Atualização otimista — a interface reage imediatamente.
    setProgresso(candidato);
    setFx(v.aprovado ? "aprovado" : "reprovado");
    setResultado({
      veredicto: v,
      fase,
      nivelAntes,
      nivelDepois,
      conquistasNovas,
      xpTotalAntes: atual.pontuacao,
      xpTotalDepois,
    });
    setTela("resultado");

    if (v.aprovado) {
      somRecompensa();
      if (conquistasNovas.length > 0) setTimeout(somConquista, 900);
    } else {
      somFalha();
    }

    const atualizado = await salvarProgresso(sessao.user.id, patch);
    await registrarVeredicto(sessao.user.id, fase.id, fase.missao, "julgamento", {
      ...v,
      metricas: v.metricas,
      recompensas: v.recompensas,
    });
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
      <main className="relative flex min-h-screen items-center justify-center">
        <Particulas quantidade={18} />
        <p className="etiqueta pulsar">Estabelecendo conexão com o Alto Comando Acadêmico…</p>
      </main>
    );
  }

  if (tela === "deslogado" || !progresso) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-4">
        <Particulas quantidade={22} />
        <div className="painel-holo chanfro entrada-hud relative z-10 max-w-md p-8 text-center">
          <p className="etiqueta">Acesso restrito</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase neon-texto">
            Tribunal Acadêmico
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            O colapso intelectual apagou o conhecimento da humanidade. Sem matrícula não há
            julgamento. Aliste-se como Recruta Acadêmico e atravesse os graus da civilização.
          </p>
          <button
            onClick={() => navigate({ to: "/auth" })}
            className="chanfro-suave mt-6 w-full border border-[var(--color-neon)] bg-[color-mix(in_oklab,var(--color-neon)_14%,transparent)] px-4 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-neon)] transition-all hover:bg-[var(--color-neon)] hover:text-black"
          >
            ▶ Efetuar alistamento
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-[1500px] px-3 py-4 sm:px-5 sm:py-6">
      <Particulas />

      <CabecalhoJogador
        progresso={progresso}
        nivel={nivel}
        apelido={progresso.apelido}
        email={sessao?.user.email}
        aoSair={() => void sair()}
      />

      {modoDegradado() && (
        <p className="chanfro-suave relative z-10 mt-3 border border-[var(--alerta)]/60 bg-[color-mix(in_oklab,var(--alerta)_12%,transparent)] px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-[var(--alerta)]">
          ⚠ Modo de compatibilidade: a migração da campanha ainda não foi aplicada no banco. XP,
          patente e conquistas desta sessão não serão persistidos.
        </p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <HudGamer
          progresso={progresso}
          fase={fase}
          palavras={palavras}
          tempo={tela === "missao" ? tempo : fase.tempoSegundos}
          emMissao={tela === "missao"}
          comboFlash={progresso.combo}
        />

        <section className="min-h-[70vh]">
          {tela === "menu" && (
            <MenuCampanha
              progresso={progresso}
              nivel={nivel}
              faseSelecionada={fase}
              aoSelecionarFase={(id) => {
                somHud();
                setFaseSelecionadaId(id);
              }}
              aoIniciar={iniciarMissao}
              historico={historico}
            />
          )}

          {tela === "missao" && (
            <TelaMissao
              fase={fase}
              texto={texto}
              palavras={palavras}
              alerta={alerta}
              processando={processando}
              fx={fx}
              aoDigitar={aoDigitar}
              aoJulgar={() => void julgar()}
            />
          )}

          {tela === "resultado" && resultado && (
            <TelaResultado
              resultado={resultado}
              aoContinuar={() => {
                somHud();
                if (resultado.veredicto.aprovado) setFaseSelecionadaId(progresso.fase);
                setTela("menu");
                setFx(null);
              }}
            />
          )}

          {tela === "fuga" && (
            <div className="painel-holo chanfro alerta-vermelho glitch flex h-full flex-col items-center justify-center border-destructive p-8 text-center">
              <p className="etiqueta text-destructive pulsar">{motivoFuga}</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-extrabold uppercase text-destructive sm:text-6xl">
                Game Over
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                O carcereiro de abas registrou sua evasão. Missão anulada, XP drenado, estabilidade
                do sistema corrompida e banimento gravado no histórico permanente. O tribunal
                considera o candidato indigno do grau pretendido.
              </p>
              <p className="mt-3 text-[0.68rem] uppercase tracking-[0.2em] text-destructive">
                Recorde de sequência preservado: {formatarXP(progresso.combo_maximo)} acertos
              </p>
              <button
                onClick={() => {
                  somHud();
                  setFaseSelecionadaId(progresso.fase);
                  setTela("menu");
                }}
                className="chanfro-suave mt-8 border border-destructive px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                ▶ Voltar ao banco dos réus
              </button>
            </div>
          )}
        </section>
      </div>

      {desafio && <CorretorSabotado desafio={desafio} onResolver={resolverCorretor} />}
    </main>
  );
}
