export type Dificuldade = "Fácil" | "Moderada" | "Difícil" | "Brutal" | "Lendária";

export type Fase = {
  id: number;
  grau: string;
  /** Nome curto usado no mapa de progressão. */
  etapa: string;
  genero: string;
  descricao: string;
  missao: string;
  tipoMissao: string;
  dificuldade: Dificuldade;
  tema: string;
  minPalavras: number;
  tempoSegundos: number;
  notaCorte: number;
  exigencias: string[];
  recompensaXP: number;
  recompensaConhecimento: number;
  recompensaMoedas: number;
  recompensaMedalhas: number;
};

export const FASES: Fase[] = [
  {
    id: 1,
    grau: "ENSINO FUNDAMENTAL",
    etapa: "Fundamental",
    genero: "Redação descritiva",
    tipoMissao: "REDAÇÃO DESCRITIVA",
    descricao: "Estruturação básica. Frases inteiras. Sem desculpas.",
    missao: "MISSÃO 01",
    dificuldade: "Fácil",
    tema: "Descreva o lugar onde você estuda como se o leitor jamais tivesse visto uma sala de aula.",
    minPalavras: 120,
    tempoSegundos: 480,
    notaCorte: 45,
    exigencias: ["Parágrafos separados", "Vocabulário concreto", "Zero repetição preguiçosa"],
    recompensaXP: 150,
    recompensaConhecimento: 50,
    recompensaMoedas: 40,
    recompensaMedalhas: 1,
  },
  {
    id: 2,
    grau: "ENSINO MÉDIO",
    etapa: "Médio",
    genero: "Dissertação argumentativa",
    tipoMissao: "DISSERTAÇÃO ARGUMENTATIVA",
    descricao: "Tese, argumentos, proposta de intervenção. Sob cronômetro.",
    missao: "MISSÃO 02",
    dificuldade: "Moderada",
    tema: "O excesso de vigilância digital protege ou domestica o cidadão brasileiro?",
    minPalavras: 180,
    tempoSegundos: 600,
    notaCorte: 52,
    exigencias: ["Tese explícita", "Dois argumentos", "Proposta final"],
    recompensaXP: 230,
    recompensaConhecimento: 80,
    recompensaMoedas: 60,
    recompensaMedalhas: 1,
  },
  {
    id: 3,
    grau: "GRADUAÇÃO",
    etapa: "Graduação",
    genero: "Resumo crítico / petição",
    tipoMissao: "PARECER CRÍTICO",
    descricao: "Precisão técnica. Nada de achismo emocional.",
    missao: "MISSÃO 03",
    dificuldade: "Difícil",
    tema: "Redija um parecer crítico sobre a substituição de avaliações humanas por sistemas automatizados.",
    minPalavras: 230,
    tempoSegundos: 720,
    notaCorte: 58,
    exigencias: ["Linguagem formal", "Conectivos lógicos", "Conclusão sustentada"],
    recompensaXP: 340,
    recompensaConhecimento: 120,
    recompensaMoedas: 90,
    recompensaMedalhas: 2,
  },
  {
    id: 4,
    grau: "ESPECIALIZAÇÃO",
    etapa: "Especialização",
    genero: "Artigo técnico especializado",
    tipoMissao: "ARTIGO DE ESPECIALISTA",
    descricao: "Domínio de nicho. Tolerância zero para generalidades.",
    missao: "MISSÃO 04",
    dificuldade: "Difícil",
    tema: "Especialize-se: proponha um método de avaliação humana assistida por máquina para redações de larga escala.",
    minPalavras: 280,
    tempoSegundos: 840,
    notaCorte: 61,
    exigencias: ["Recorte de nicho", "Metodologia clara", "Terminologia própria"],
    recompensaXP: 430,
    recompensaConhecimento: 160,
    recompensaMoedas: 120,
    recompensaMedalhas: 2,
  },
  {
    id: 5,
    grau: "MESTRADO",
    etapa: "Mestrado",
    genero: "Ensaio complexo / tese parcial",
    tipoMissao: "ENSAIO COMPLEXO",
    descricao: "Coesão avançada e densidade conceitual obrigatórias.",
    missao: "MISSÃO 05",
    dificuldade: "Brutal",
    tema: "Discorra sobre a relação entre escassez de atenção e degradação da escrita acadêmica contemporânea.",
    minPalavras: 300,
    tempoSegundos: 900,
    notaCorte: 64,
    exigencias: ["Hipótese declarada", "Contra-argumento", "Encadeamento conceitual"],
    recompensaXP: 560,
    recompensaConhecimento: 210,
    recompensaMoedas: 160,
    recompensaMedalhas: 3,
  },
  {
    id: 6,
    grau: "DOUTORADO",
    etapa: "Doutorado",
    genero: "Defesa de tese",
    tipoMissao: "DEFESA DE TESE",
    descricao: "Você defende ou você repete o ano.",
    missao: "MISSÃO 06",
    dificuldade: "Brutal",
    tema: "Defenda uma tese original sobre o futuro do pensamento crítico em ambientes automatizados.",
    minPalavras: 380,
    tempoSegundos: 1080,
    notaCorte: 70,
    exigencias: ["Tese original", "Refutação de objeções", "Rigor terminológico"],
    recompensaXP: 720,
    recompensaConhecimento: 280,
    recompensaMoedas: 220,
    recompensaMedalhas: 3,
  },
  {
    id: 7,
    grau: "ACADEMIA SUPREMA",
    etapa: "Academia Suprema",
    genero: "Publicação de alto impacto",
    tipoMissao: "ARTIGO SUPREMO",
    descricao: "O teste máximo de retórica e precisão. Nenhuma tolerância.",
    missao: "MISSÃO 07",
    dificuldade: "Lendária",
    tema: "Produza a seção de discussão de um artigo sobre o impacto cognitivo de sistemas de avaliação automatizada.",
    minPalavras: 450,
    tempoSegundos: 1200,
    notaCorte: 76,
    exigencias: ["Método implícito", "Discussão de limitações", "Precisão absoluta"],
    recompensaXP: 1000,
    recompensaConhecimento: 400,
    recompensaMoedas: 320,
    recompensaMedalhas: 5,
  },
];

export const getFase = (id: number): Fase =>
  FASES.find((f) => f.id === id) ?? FASES[FASES.length - 1]!;

/** Uma fase está liberada quando o jogador já concluiu todas as anteriores. */
export const faseLiberada = (fase: Fase, faseAtual: number) => fase.id <= faseAtual;
