import { supabase } from "@/integrations/supabase/client";
import type { Veredicto } from "./motor";

/**
 * Colunas gamer adicionadas em 20260922000000_campanha_gamer.sql. Se o banco
 * ainda não recebeu a migração, o app opera em modo degradado (stats locais)
 * em vez de quebrar a sessão.
 */
const COLUNAS_GAMER = [
  "xp",
  "conhecimento",
  "moedas",
  "combo",
  "combo_maximo",
  "medalhas",
  "missoes_concluidas",
  "melhor_nota",
  "melhor_nota_avancada",
  "campanha_concluida",
  "conquistas",
] as const;

export type Progresso = {
  user_id: string;
  apelido: string | null;
  fase: number;
  pontuacao: number;
  aprovacoes: number;
  reprovacoes: number;
  banimentos: number;
  banido_ate: string | null;
  xp: number;
  conhecimento: number;
  moedas: number;
  combo: number;
  combo_maximo: number;
  medalhas: number;
  missoes_concluidas: number;
  melhor_nota: number;
  melhor_nota_avancada: number;
  campanha_concluida: boolean;
  conquistas: string[];
};

const PADRAO_GAMER = {
  xp: 0,
  conhecimento: 0,
  moedas: 0,
  combo: 0,
  combo_maximo: 0,
  medalhas: 0,
  missoes_concluidas: 0,
  melhor_nota: 0,
  melhor_nota_avancada: 0,
  campanha_concluida: false,
  conquistas: [] as string[],
};

/** O Supabase devolve `conquistas` como JSON; normalizamos para string[]. */
function normalizar(linha: Record<string, unknown>): Progresso {
  const base = { ...PADRAO_GAMER, ...linha } as Progresso;
  const bruto = linha["conquistas"];
  base.conquistas = Array.isArray(bruto)
    ? bruto.filter((c): c is string => typeof c === "string")
    : [];
  return base;
}

function erroDeGeracaoIncompativel(message: string | undefined) {
  const texto = (message ?? "").toLowerCase();
  const incompativel =
    COLUNAS_GAMER.some((c) => texto.includes(c)) &&
    (texto.includes("column") || texto.includes("schema cache"));
  if (incompativel) modoDegradadoAtivo = true;
  return incompativel;
}

let modoDegradadoAtivo = false;

/**
 * Verdadeiro quando o banco ainda não recebeu a migração gamer. O app mantém a
 * experiência completa em memória, mas os stats gamer não sobrevivem ao reload.
 */
export function modoDegradado() {
  return modoDegradadoAtivo;
}

export async function carregarProgresso(
  userId: string,
  apelido: string | null,
): Promise<Progresso> {
  const { data, error } = await supabase
    .from("tribunal_progresso")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && erroDeGeracaoIncompativel(error.message)) {
    const { data: legado } = await supabase
      .from("tribunal_progresso")
      .select("user_id, apelido, fase, pontuacao, aprovacoes, reprovacoes, banimentos, banido_ate")
      .eq("user_id", userId)
      .maybeSingle();
    if (legado) return normalizar(legado as Record<string, unknown>);
  } else if (data) {
    return normalizar(data as Record<string, unknown>);
  }

  const novo = { user_id: userId, apelido, ...PADRAO_GAMER };
  const { data: criado, error: erroCriacao } = await supabase
    .from("tribunal_progresso")
    .insert(novo)
    .select("*")
    .single();
  if (erroCriacao) throw erroCriacao;
  return normalizar(criado as Record<string, unknown>);
}

export async function salvarProgresso(
  userId: string,
  patch: Partial<Progresso>,
): Promise<Progresso> {
  const { data, error } = await supabase
    .from("tribunal_progresso")
    .update(patch)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error && erroDeGeracaoIncompativel(error.message)) {
    // Banco sem a migração gamer: persiste apenas colunas do esquema original.
    const suportados: Partial<Progresso> = {};
    for (const [chave, valor] of Object.entries(patch)) {
      if ((COLUNAS_GAMER as readonly string[]).includes(chave)) continue;
      Object.assign(suportados, { [chave]: valor });
    }
    if (Object.keys(suportados).length === 0) return carregarProgresso(userId, null);
    const { error: erroLegado } = await supabase
      .from("tribunal_progresso")
      .update(suportados)
      .eq("user_id", userId);
    if (erroLegado) throw erroLegado;
    return carregarProgresso(userId, null);
  }
  if (error) throw error;
  return normalizar(data as Record<string, unknown>);
}

export async function registrarVeredicto(
  userId: string,
  fase: number,
  missao: string,
  tipo: "julgamento" | "fuga",
  v: Pick<Veredicto, "titulo" | "sentenca" | "nota" | "deltaPontos"> & {
    metricas?: unknown;
    recompensas?: unknown;
  },
) {
  await supabase.from("tribunal_veredictos").insert({
    user_id: userId,
    fase,
    missao,
    tipo,
    titulo: v.titulo,
    sentenca: v.sentenca,
    nota: v.nota,
    delta_pontos: v.deltaPontos,
    metricas: JSON.parse(
      JSON.stringify({ ...(v.metricas ?? {}), recompensas: v.recompensas ?? null }),
    ),
  });
}

export async function listarVeredictos(userId: string) {
  const { data } = await supabase
    .from("tribunal_veredictos")
    .select("id, fase, missao, tipo, titulo, nota, delta_pontos, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);
  return data ?? [];
}
