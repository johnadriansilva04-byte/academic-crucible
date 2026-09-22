/**
 * TRIBUNAL DE AVALIAÇÃO — motor de análise local (client-side, sem rede).
 * Avalia densidade argumentativa, coesão e vocabulário. Sem elogios fofos.
 */
import type { Fase } from "./fases";

export type Metricas = {
  palavras: number;
  frases: number;
  mediaFrase: number;
  diversidade: number;
  coesao: number;
  densidadeArgumentativa: number;
  vocabularioElevado: number;
  ruido: number;
};

export type Recompensas = {
  xp: number;
  conhecimento: number;
  moedas: number;
  medalhas: number;
  /** Multiplicador de combo aplicado sobre a recompensa base. */
  multiplicador: number;
};

export type Veredicto = {
  aprovado: boolean;
  titulo: string;
  sentenca: string;
  nota: number;
  deltaPontos: number;
  metricas: Metricas;
  criticas: string[];
  recompensas: Recompensas;
};

const CONECTIVOS = [
  "portanto",
  "entretanto",
  "contudo",
  "todavia",
  "porquanto",
  "ademais",
  "outrossim",
  "porém",
  "logo",
  "assim",
  "embora",
  "conquanto",
  "visto que",
  "uma vez que",
  "por conseguinte",
  "dessa forma",
  "além disso",
  "no entanto",
  "por outro lado",
  "em síntese",
  "por fim",
  "primeiramente",
  "consequentemente",
  "ou seja",
];

const MARCADORES_ARGUMENTO = [
  "porque",
  "dado que",
  "evidencia",
  "demonstra",
  "comprova",
  "segundo",
  "conforme",
  "hipótese",
  "tese",
  "argumenta",
  "refuta",
  "sustenta",
  "conclui",
  "implica",
  "decorre",
  "pressupõe",
  "critério",
  "análise",
  "portanto",
];

const RUIDO = [
  "tipo assim",
  "né",
  "meio que",
  "muito muito",
  "coisa",
  "legal",
  "bem legal",
  "aí",
  "daí",
  "pra caramba",
  "acho que sim",
  "sei lá",
  "enfim",
  "basicamente",
  "literalmente",
];

const normalizar = (t: string) => t.toLowerCase().replace(/\s+/g, " ").trim();

const contarOcorrencias = (texto: string, termos: string[]) =>
  termos.reduce((acc, termo) => acc + (texto.split(termo).length - 1), 0);

export function analisar(textoBruto: string, fase: Fase, combo = 0): Veredicto {
  const texto = normalizar(textoBruto);
  const palavrasLista = texto.split(/[^a-zà-ÿ0-9-]+/).filter((p) => p.length > 1);
  const palavras = palavrasLista.length;
  const frasesLista = textoBruto
    .split(/[.!?]+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 3);
  const frases = Math.max(frasesLista.length, 1);
  const unicas = new Set(palavrasLista).size;

  const diversidade = palavras ? unicas / palavras : 0;
  const mediaFrase = palavras / frases;
  const coesaoBruta = contarOcorrencias(texto, CONECTIVOS);
  const argBruto = contarOcorrencias(texto, MARCADORES_ARGUMENTO);
  const ruido = contarOcorrencias(texto, RUIDO);
  const longas = palavrasLista.filter((p) => p.length >= 10).length;

  const coesao = palavras ? (coesaoBruta / palavras) * 100 : 0;
  const densidadeArgumentativa = palavras ? (argBruto / palavras) * 100 : 0;
  const vocabularioElevado = palavras ? (longas / palavras) * 100 : 0;

  const metricas: Metricas = {
    palavras,
    frases,
    mediaFrase: Number(mediaFrase.toFixed(1)),
    diversidade: Number((diversidade * 100).toFixed(1)),
    coesao: Number(coesao.toFixed(2)),
    densidadeArgumentativa: Number(densidadeArgumentativa.toFixed(2)),
    vocabularioElevado: Number(vocabularioElevado.toFixed(2)),
    ruido,
  };

  const criticas: string[] = [];
  let nota = 0;

  // Extensão exigida
  const razaoTamanho = Math.min(palavras / fase.minPalavras, 1);
  nota += razaoTamanho * 25;
  if (razaoTamanho < 1)
    criticas.push(`Texto subdimensionado: ${palavras} de ${fase.minPalavras} palavras mínimas.`);

  // Coesão
  const notaCoesao = Math.min(coesao / 2.2, 1) * 20;
  nota += notaCoesao;
  if (coesao < 1.1)
    criticas.push("Coesão frouxa: períodos jogados lado a lado sem articulação lógica.");

  // Densidade argumentativa
  const notaArg = Math.min(densidadeArgumentativa / 2.5, 1) * 22;
  nota += notaArg;
  if (densidadeArgumentativa < 1.2)
    criticas.push("Densidade argumentativa insuficiente: opinião crua sem sustentação.");

  // Vocabulário
  const notaVocab = Math.min(vocabularioElevado / 9, 1) * 15;
  nota += notaVocab;
  if (vocabularioElevado < 4) criticas.push("Vocabulário raso para o grau exigido.");

  // Diversidade lexical
  const alvoDiv = palavras > 300 ? 0.45 : 0.55;
  const notaDiv = Math.min(diversidade / alvoDiv, 1) * 12;
  nota += notaDiv;
  if (diversidade < alvoDiv * 0.75)
    criticas.push("Repetição excessiva do mesmo léxico. Isso é preguiça, não estilo.");

  // Estrutura de período
  if (mediaFrase >= 12 && mediaFrase <= 32) nota += 6;
  else
    criticas.push(
      mediaFrase < 12
        ? "Períodos curtos demais: escrita telegráfica."
        : "Períodos arrastados e mal pontuados.",
    );

  // Parágrafos
  const paragrafos = textoBruto.split(/\n\s*\n/).filter((p) => p.trim().length > 40).length;
  if (paragrafos >= 2) nota += 4;
  else criticas.push("Bloco único de texto: nenhuma arquitetura de parágrafos.");

  // Penalidades
  nota -= ruido * 3;
  if (ruido > 0) criticas.push(`Registro contaminado por oralidade (${ruido} ocorrência(s)).`);

  nota = Math.max(0, Math.min(100, Math.round(nota)));
  const aprovado = nota >= fase.notaCorte && palavras >= fase.minPalavras * 0.9;

  const titulo = aprovado
    ? nota >= 90
      ? "GÊNIO / DOUTOR NOTÁVEL"
      : nota >= 80
        ? "APROVADO COM LOUVOR"
        : "APROVADO — SEM ENTUSIASMO"
    : nota >= fase.notaCorte - 10
      ? "REPROVADO — MEDIOCRIDADE DOCUMENTADA"
      : "COMPLETO JUMENTO";

  const deltaPontos = aprovado
    ? Math.round(nota * fase.id * 1.5)
    : -Math.round((fase.notaCorte - nota + 10) * 2);

  const multiplicador = aprovado ? 1 + Math.min(combo, 10) * 0.25 : 0;
  const bonusNota = aprovado ? 1 + Math.max(0, nota - fase.notaCorte) / 100 : 0;
  const recompensas: Recompensas = aprovado
    ? {
        xp: Math.round(fase.recompensaXP * multiplicador * bonusNota),
        conhecimento: Math.round(fase.recompensaConhecimento * multiplicador * bonusNota),
        moedas: Math.round(fase.recompensaMoedas * multiplicador * bonusNota),
        medalhas: fase.recompensaMedalhas,
        multiplicador: Number(multiplicador.toFixed(2)),
      }
    : { xp: 0, conhecimento: 0, moedas: 0, medalhas: 0, multiplicador: 0 };

  const sentenca = aprovado
    ? `O tribunal reconhece competência suficiente em ${fase.genero.toLowerCase()}. Nota ${nota}/100. Promoção autorizada.`
    : `O tribunal indefere o texto. Nota ${nota}/100 contra corte de ${fase.notaCorte}. Você repete o ano em ${fase.grau}.`;

  return { aprovado, titulo, sentenca, nota, deltaPontos, metricas, criticas, recompensas };
}
