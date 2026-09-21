/**
 * Corretor sabotado: nunca entrega a resposta pronta.
 * Sempre três alternativas — duas armadilhas e uma correta.
 */

export type DesafioOrtografico = {
  correta: string;
  opcoes: string[];
  pista: string;
};

type Entrada = { correta: string; armadilhas: string[]; pista: string };

const BANCO: Entrada[] = [
  { correta: "concerteza|com certeza", armadilhas: ["concerteza", "com sertesa"], pista: "Locução adverbial de convicção." },
  { correta: "exceção", armadilhas: ["excessão", "eceção"], pista: "Aquilo que foge à regra." },
  { correta: "privilégio", armadilhas: ["previlégio", "privilejio"], pista: "Vantagem concedida a poucos." },
  { correta: "beneficente", armadilhas: ["beneficiente", "benificente"], pista: "Que faz o bem." },
  { correta: "empecilho", armadilhas: ["impecilho", "empessilho"], pista: "Obstáculo, estorvo." },
  { correta: "meteorologia", armadilhas: ["metereologia", "meteriologia"], pista: "Estudo do clima." },
  { correta: "iminente", armadilhas: ["eminente", "imenente"], pista: "Prestes a acontecer." },
  { correta: "discrição", armadilhas: ["descrição", "discricção"], pista: "Qualidade de ser reservado." },
  { correta: "ratificar", armadilhas: ["retificar", "ractificar"], pista: "Confirmar, validar." },
  { correta: "ascensão", armadilhas: ["assenção", "ascenção"], pista: "Ato de subir." },
  { correta: "pretensioso", armadilhas: ["pretencioso", "pretenssioso"], pista: "Que se julga superior." },
  { correta: "análise", armadilhas: ["analize", "análize"], pista: "Exame detalhado." },
  { correta: "hipótese", armadilhas: ["ipótese", "hipotese"], pista: "Suposição a ser testada." },
  { correta: "consequência", armadilhas: ["conseqüência", "consequencia"], pista: "Aquilo que decorre de um fato." },
  { correta: "viagem", armadilhas: ["viajem", "vyagem"], pista: "Substantivo: a ___ foi longa." },
  { correta: "mal-entendido", armadilhas: ["mau-entendido", "malentendido"], pista: "Equívoco de interpretação." },
  { correta: "paralisia", armadilhas: ["paralizia", "parálisia"], pista: "Perda de movimento." },
  { correta: "obsessão", armadilhas: ["obceção", "obsseção"], pista: "Ideia fixa." },
  { correta: "herança", armadilhas: ["erança", "heransa"], pista: "Aquilo que se recebe dos antepassados." },
  { correta: "asterisco", armadilhas: ["asterístico", "astericos"], pista: "Símbolo gráfico em forma de estrela." },
];

const embaralhar = <T,>(arr: T[]): T[] => {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export function sortearDesafio(): DesafioOrtografico {
  const item = BANCO[Math.floor(Math.random() * BANCO.length)];
  const correta = item.correta.includes("|") ? item.correta.split("|")[1] : item.correta;
  return {
    correta,
    opcoes: embaralhar([correta, ...item.armadilhas]),
    pista: item.pista,
  };
}

/** Palavras que, se digitadas, disparam a checagem imediata do corretor. */
const GATILHOS = new Set(
  BANCO.flatMap((e) => e.armadilhas.map((a) => a.toLowerCase())),
);

export function detectarDesvio(texto: string): boolean {
  const palavras = texto.toLowerCase().split(/[^a-zà-ú-]+/);
  return palavras.some((p) => p.length > 3 && GATILHOS.has(p));
}
