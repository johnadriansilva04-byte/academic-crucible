import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Matrícula — Tribunal Acadêmico" },
      { name: "description", content: "Registre sua matrícula para ser julgado pelo Tribunal Acadêmico." },
      { property: "og:title", content: "Matrícula — Tribunal Acadêmico" },
      { property: "og:description", content: "Registre sua matrícula para ser julgado pelo Tribunal Acadêmico." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "registrar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setMsg(null);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) setMsg(error.message);
      else navigate({ to: "/" });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Matrícula enviada. Confirme o e-mail para abrir a sessão.");
      else navigate({ to: "/" });
    }
    setCarregando(false);
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setMsg("Falha no acesso institucional.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="painel w-full max-w-md p-8">
        <p className="etiqueta">Secretaria de Registros</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase tracking-tight">
          Tribunal Acadêmico
        </h1>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Nenhum candidato é julgado sem matrícula. Seu progresso, suas reprovações e cada fuga de aba ficam
          permanentemente registrados.
        </p>

        <form onSubmit={enviar} className="mt-8 space-y-4">
          <div>
            <label className="etiqueta" htmlFor="email">E-mail institucional</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="etiqueta" htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {msg && <p className="border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive-foreground">{msg}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {carregando ? "Processando…" : modo === "entrar" ? "Abrir sessão" : "Efetuar matrícula"}
          </button>
        </form>

        <button
          onClick={google}
          className="mt-3 w-full border border-border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-secondary"
        >
          Continuar com Google
        </button>

        <button
          onClick={() => { setModo(modo === "entrar" ? "registrar" : "entrar"); setMsg(null); }}
          className="mt-6 w-full text-center text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          {modo === "entrar" ? "Não possuo matrícula" : "Já possuo matrícula"}
        </button>
      </div>
    </main>
  );
}
