import { supabase } from "@/integrations/supabase/client";
import type { Veredicto } from "./motor";

export type Progresso = {
  user_id: string;
  apelido: string | null;
  fase: number;
  pontuacao: number;
  aprovacoes: number;
  reprovacoes: number;
  banimentos: number;
  banido_ate: string | null;
};

export async function carregarProgresso(userId: string, apelido: string | null): Promise<Progresso> {
  const { data } = await supabase
    .from("tribunal_progresso")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data as Progresso;

  const novo = { user_id: userId, apelido, fase: 1, pontuacao: 0, aprovacoes: 0, reprovacoes: 0, banimentos: 0 };
  const { data: criado, error } = await supabase
    .from("tribunal_progresso")
    .insert(novo)
    .select()
    .single();
  if (error) throw error;
  return criado as Progresso;
}

export async function salvarProgresso(userId: string, patch: Partial<Progresso>): Promise<Progresso> {
  const { data, error } = await supabase
    .from("tribunal_progresso")
    .update(patch)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Progresso;
}

export async function registrarVeredicto(
  userId: string,
  fase: number,
  missao: string,
  tipo: "julgamento" | "fuga",
  v: Pick<Veredicto, "titulo" | "sentenca" | "nota" | "deltaPontos"> & { metricas?: unknown },
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
    metricas: JSON.parse(JSON.stringify(v.metricas ?? {})),
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
