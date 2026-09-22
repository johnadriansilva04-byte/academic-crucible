/**
 * SISTEMA DE PROGRESSÃO — patentes acadêmicas, XP, níveis, moedas e conquistas.
 * Toda a matemática de recompensa do jogo vive aqui (client-side, sem rede).
 */

export type Patente = {
  nivel: number;
  nome: string;
  ins: string;
};

export const PATENTES: Patente[] = [
  { nivel: 1, nome: "RECRUTA DO CONHECIMENTO", ins: "RC" },
  { nivel: 2, nome: "CADETE DA RETÓRICA", ins: "CD" },
  { nivel: 3, nome: "SARGENTO DA ESCRITA", ins: "SG" },
  { nivel: 4, nome: "TENENTE DAS LETRAS", ins: "TN" },
  { nivel: 5, nome: "CAPITÃO DA ARGUMENTAÇÃO", ins: "CP" },
  { nivel: 6, nome: "MAJOR DA COESÃO", ins: "MJ" },
  { nivel: 7, nome: "CORONEL DO RIGOR", ins: "CL" },
  { nivel: 8, nome: "COMANDANTE DO VERBO", ins: "CM" },
  { nivel: 9, nome: "GENERAL DA DIALÉTICA", ins: "GN" },
  { nivel: 10, nome: "MARECHAL DA CIÊNCIA", ins: "MR" },
  { nivel: 11, nome: "GUARDIÃO DO CONHECIMENTO", ins: "GR" },
  { nivel: 12, nome: "LENDA ACADÊMICA", ins: "LD" },
];

/** XP acumulado total necessário para alcançar o nível informado. */
export const XP_POR_NIVEL = 1000;

export function xpParaNivel(nivel: number) {
  return Math.max(0, (nivel - 1) * XP_POR_NIVEL * (1 + (nivel - 1) * 0.15));
}

export function patenteDoNivel(nivel: number): Patente {
  if (nivel <= 1) return PATENTES[0]!;
  return PATENTES[Math.min(nivel, PATENTES.length) - 1]!;
}

export type Nivel = {
  nivel: number;
  patente: Patente;
  xpNoNivel: number;
  xpNecessario: number;
  faltam: number;
  percentual: number;
};

export function calcularNivel(xpTotal: number): Nivel {
  const xp = Math.max(0, Math.round(xpTotal));
  let nivel = 1;
  while (nivel < 999 && xp >= xpParaNivel(nivel + 1)) nivel += 1;
  const base = xpParaNivel(nivel);
  const alvo = xpParaNivel(nivel + 1);
  const xpNecessario = Math.max(1, Math.round(alvo - base));
  const xpNoNivel = Math.max(0, Math.round(xp - base));
  return {
    nivel,
    patente: patenteDoNivel(nivel),
    xpNoNivel,
    xpNecessario,
    faltam: Math.max(0, xpNecessario - xpNoNivel),
    percentual: Math.min(100, (xpNoNivel / xpNecessario) * 100),
  };
}

export function formatarXP(valor: number) {
  return Math.max(0, Math.round(valor)).toLocaleString("pt-BR");
}

export type Raridade = "bronze" | "prata" | "ouro" | "platina" | "lendaria";

export type Conquista = {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  raridade: Raridade;
  recompensa: number;
};

export type Estatisticas = {
  aprovacoes: number;
  reprovacoes: number;
  banimentos: number;
  combo: number;
  comboMaximo: number;
  conhecimento: number;
  xp: number;
  missoesConcluidas: number;
  /** Melhor nota já obtida em qualquer missão. */
  melhorNota: number;
  /** Melhor nota obtida em missão de grau 3 ou superior. */
  melhorNotaAvancada: number;
  /** Campanha concluída — todos os graus liberados. */
  campanhaConcluida: boolean;
};

export const CONQUISTAS: Conquista[] = [
  {
    id: "primeira-aprovacao",
    nome: "Primeira Aprovação",
    descricao: "Sobreviva ao primeiro julgamento favorável.",
    icone: "🥉",
    raridade: "bronze",
    recompensa: 120,
  },
  {
    id: "dez-missoes",
    nome: "10 Missões Concluídas",
    descricao: "Conclua dez missões da campanha.",
    icone: "🥈",
    raridade: "prata",
    recompensa: 300,
  },
  {
    id: "tripla-coroa",
    nome: "Sequência de Elite",
    descricao: "Acerte cinco missões consecutivas.",
    icone: "🎖️",
    raridade: "prata",
    recompensa: 260,
  },
  {
    id: "mestre-redacao",
    nome: "Mestre da Redação",
    descricao: "Aprove com nota máxima em qualquer missão.",
    icone: "🥇",
    raridade: "ouro",
    recompensa: 500,
  },
  {
    id: "doutor-notavel",
    nome: "Doutor Notável",
    descricao: "Alcance 90 pontos em um grau superior.",
    icone: "🎓",
    raridade: "ouro",
    recompensa: 480,
  },
  {
    id: "sobrevivente",
    nome: "Sobrevivente Acadêmico",
    descricao: "Conclua a campanha completa sem abandonar a prova.",
    icone: "🏆",
    raridade: "platina",
    recompensa: 900,
  },
  {
    id: "impecavel",
    nome: "Ficha Limpa",
    descricao: "Alcance 1500 de XP sem nenhum banimento.",
    icone: "🛡️",
    raridade: "ouro",
    recompensa: 450,
  },
  {
    id: "voz-da-humanidade",
    nome: "Guardião do Conhecimento",
    descricao: "Recupere 2.000 fragmentos de conhecimento.",
    icone: "👑",
    raridade: "lendaria",
    recompensa: 1200,
  },
];

export const ORDEM_CONQUISTAS = CONQUISTAS.map((c) => c.id);

const RARIDADE_CLASSES: Record<Raridade, string> = {
  bronze: "border-[var(--raridade-bronze)] text-[var(--raridade-bronze)]",
  prata: "border-[var(--raridade-prata)] text-[var(--raridade-prata)]",
  ouro: "border-[var(--raridade-ouro)] text-[var(--raridade-ouro)]",
  platina: "border-[var(--raridade-platina)] text-[var(--raridade-platina)]",
  lendaria: "border-[var(--raridade-lendaria)] text-[var(--raridade-lendaria)]",
};

export function classeRaridade(raridade: Raridade) {
  return RARIDADE_CLASSES[raridade];
}

/** Determina quais conquistas o jogador atende agora. */
export function conquistasAtivas(stat: Estatisticas): string[] {
  const lista: string[] = [];
  if (stat.aprovacoes >= 1) lista.push("primeira-aprovacao");
  if (stat.missoesConcluidas >= 10) lista.push("dez-missoes");
  if (stat.comboMaximo >= 5) lista.push("tripla-coroa");
  if (stat.melhorNota >= 100) lista.push("mestre-redacao");
  if (stat.melhorNotaAvancada >= 90) lista.push("doutor-notavel");
  if (stat.campanhaConcluida) lista.push("sobrevivente");
  if (stat.xp >= 1500 && stat.banimentos === 0) lista.push("impecavel");
  if (stat.conhecimento >= 2000) lista.push("voz-da-humanidade");
  return lista;
}

/** Nível de estabilidade do sistema — cai com erros e fugas. */
export type Estabilidade = {
  valor: number;
  estado: "estavel" | "instavel" | "critica";
  rotulo: string;
};

export function calcularEstabilidade(reprovacoes: number, banimentos: number): Estabilidade {
  const valor = Math.max(0, 100 - reprovacoes * 6 - banimentos * 12);
  const estado = valor >= 70 ? "estavel" : valor >= 40 ? "instavel" : "critica";
  const rotulo =
    estado === "estavel"
      ? "SISTEMA ESTÁVEL"
      : estado === "instavel"
        ? "INSTABILIDADE DETECTADA"
        : "COLAPSO IMINENTE";
  return { valor, estado, rotulo };
}

/** Traduz a linha persistida de progresso para o formato avaliado pelas conquistas. */
export function estatisticasDe(progresso: {
  aprovacoes: number;
  reprovacoes: number;
  banimentos: number;
  combo: number;
  combo_maximo: number;
  conhecimento: number;
  pontuacao: number;
  missoes_concluidas: number;
  melhor_nota: number;
  melhor_nota_avancada: number;
  campanha_concluida: boolean;
}): Estatisticas {
  return {
    aprovacoes: progresso.aprovacoes,
    reprovacoes: progresso.reprovacoes,
    banimentos: progresso.banimentos,
    combo: progresso.combo,
    comboMaximo: progresso.combo_maximo,
    conhecimento: progresso.conhecimento,
    xp: progresso.pontuacao,
    missoesConcluidas: progresso.missoes_concluidas,
    melhorNota: progresso.melhor_nota,
    melhorNotaAvancada: progresso.melhor_nota_avancada,
    campanhaConcluida: progresso.campanha_concluida,
  };
}
