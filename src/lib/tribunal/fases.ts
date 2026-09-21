export type Fase = {
  id: number;
  grau: string;
  genero: string;
  descricao: string;
  missao: string;
  tema: string;
  minPalavras: number;
  tempoSegundos: number;
  notaCorte: number;
  exigencias: string[];
};

export const FASES: Fase[] = [
  {
    id: 1,
    grau: "ENSINO FUNDAMENTAL",
    genero: "Redação descritiva",
    descricao: "Estruturação básica. Frases inteiras. Sem desculpas.",
    missao: "DESCRIÇÃO-01",
    tema: "Descreva o lugar onde você estuda como se o leitor jamais tivesse visto uma sala de aula.",
    minPalavras: 120,
    tempoSegundos: 480,
    notaCorte: 45,
    exigencias: ["Parágrafos separados", "Vocabulário concreto", "Zero repetição preguiçosa"],
  },
  {
    id: 2,
    grau: "ENSINO MÉDIO",
    genero: "Dissertação argumentativa",
    descricao: "Tese, argumentos, proposta de intervenção. Sob cronômetro.",
    missao: "DISSERTAÇÃO-02",
    tema: "O excesso de vigilância digital protege ou domestica o cidadão brasileiro?",
    minPalavras: 180,
    tempoSegundos: 600,
    notaCorte: 52,
    exigencias: ["Tese explícita", "Dois argumentos", "Proposta final"],
  },
  {
    id: 3,
    grau: "GRADUAÇÃO",
    genero: "Resumo crítico / petição",
    descricao: "Precisão técnica. Nada de achismo emocional.",
    missao: "PARECER-03",
    tema: "Redija um parecer crítico sobre a substituição de avaliações humanas por sistemas automatizados.",
    minPalavras: 230,
    tempoSegundos: 720,
    notaCorte: 58,
    exigencias: ["Linguagem formal", "Conectivos lógicos", "Conclusão sustentada"],
  },
  {
    id: 4,
    grau: "MESTRADO",
    genero: "Ensaio complexo / tese parcial",
    descricao: "Coesão avançada e densidade conceitual obrigatórias.",
    missao: "ENSAIO-04",
    tema: "Discorra sobre a relação entre escassez de atenção e degradação da escrita acadêmica contemporânea.",
    minPalavras: 300,
    tempoSegundos: 900,
    notaCorte: 64,
    exigencias: ["Hipótese declarada", "Contra-argumento", "Encadeamento conceitual"],
  },
  {
    id: 5,
    grau: "DOUTORADO",
    genero: "Defesa de tese",
    descricao: "Você defende ou você repete o ano.",
    missao: "DEFESA-05",
    tema: "Defenda uma tese original sobre o futuro do pensamento crítico em ambientes automatizados.",
    minPalavras: 380,
    tempoSegundos: 1080,
    notaCorte: 70,
    exigencias: ["Tese original", "Refutação de objeções", "Rigor terminológico"],
  },
  {
    id: 6,
    grau: "ARTIGO CIENTÍFICO DE ELITE",
    genero: "Publicação de alto impacto",
    descricao: "O teste máximo de retórica e precisão. Nenhuma tolerância.",
    missao: "ARTIGO-06",
    tema: "Produza a seção de discussão de um artigo sobre o impacto cognitivo de sistemas de avaliação automatizada.",
    minPalavras: 450,
    tempoSegundos: 1200,
    notaCorte: 76,
    exigencias: ["Método implícito", "Discussão de limitações", "Precisão absoluta"],
  },
];

export const getFase = (id: number): Fase => FASES.find((f) => f.id === id) ?? FASES[FASES.length - 1];
