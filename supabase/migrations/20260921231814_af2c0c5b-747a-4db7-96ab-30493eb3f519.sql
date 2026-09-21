CREATE TABLE public.tribunal_progresso (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  apelido TEXT,
  fase INTEGER NOT NULL DEFAULT 1,
  pontuacao INTEGER NOT NULL DEFAULT 0,
  aprovacoes INTEGER NOT NULL DEFAULT 0,
  reprovacoes INTEGER NOT NULL DEFAULT 0,
  banimentos INTEGER NOT NULL DEFAULT 0,
  banido_ate TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tribunal_progresso TO authenticated;
GRANT ALL ON public.tribunal_progresso TO service_role;
ALTER TABLE public.tribunal_progresso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jogador gerencia o proprio progresso" ON public.tribunal_progresso
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tribunal_veredictos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  fase INTEGER NOT NULL,
  missao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  sentenca TEXT NOT NULL,
  nota INTEGER NOT NULL DEFAULT 0,
  delta_pontos INTEGER NOT NULL DEFAULT 0,
  metricas JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tribunal_veredictos TO authenticated;
GRANT ALL ON public.tribunal_veredictos TO service_role;
ALTER TABLE public.tribunal_veredictos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jogador gerencia os proprios veredictos" ON public.tribunal_veredictos
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_veredictos_user ON public.tribunal_veredictos (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_tribunal_progresso_updated_at
BEFORE UPDATE ON public.tribunal_progresso
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();