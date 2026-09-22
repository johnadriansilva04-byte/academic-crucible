<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Projeto: Tribunal Acadêmico (academic-crucible)

RPG textual de sobrevivência acadêmica. TanStack Start (React 19) + Supabase +
Tailwind v4, empacotado com Nitro/Cloudflare. Gerenciador de pacotes: `npm`
(o lockfile do Lovable é `bun.lock`, não regenere).

### Comandos

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (Nitro)
npx tsc --noEmit   # checagem de tipos
npx eslint .       # lint
npx prettier --write <arquivos>  # formatação
```

`src/lib/tribunal/corretor.ts` tem erros de Prettier pré-existentes — não é
regressão de mudanças novas.

### Arquitetura do jogo

- `src/lib/tribunal/fases.ts` — as 7 etapas da campanha (Fundamental → Academia
  Suprema) com dificuldade, tema, recompensas e nota de corte.
- `src/lib/tribunal/progressao.ts` — patentes (12 níveis militares-acadêmicos),
  curva de XP, conquistas, estabilidade do sistema e o adaptador
  `estatisticasDe(progresso)`.
- `src/lib/tribunal/motor.ts` — motor de análise local; `analisar(texto, fase,
combo)` devolve métricas, críticas e `recompensas` (XP/conhecimento/moedas/
  medalhas já com multiplicador de combo).
- `src/lib/tribunal/sons.ts` — efeitos sonoros sintetizados via WebAudio
  (nenhum asset externo).
- `src/hooks/useVigilancia.ts` — o carcereiro de abas (visibilitychange, blur,
  paste). Qualquer fuga = game over.

### Persistência (importante)

Colunas gamer (`xp`, `conhecimento`, `moedas`, `combo`, `combo_maximo`,
`medalhas`, `missoes_concluidas`, `melhor_nota`, `melhor_nota_avancada`,
`campanha_concluida`, `conquistas`) foram adicionadas em
`supabase/migrations/20260922000000_campanha_gamer.sql`. O Lovable é quem
aplica migrações; não testamos isso contra o banco real a partir do sandbox.

Até a migração ser aplicada, `src/lib/tribunal/db.ts` detecta o erro de coluna
inexistente, ativa modo degradado (`modoDegradado()`) e mostra um aviso no HUD —
a UI continua completa em memória, mas os stats gamer não sobrevivem ao reload.

Se você mexer no schema, atualize também `src/integrations/supabase/types.ts`
(é gerado automaticamente, mas precisa refletir as colunas novas para o
typecheck passar).

### Design system

Tokens extra em `src/styles.css`: `--color-neon`, `--color-sistema`,
`--color-persona`, `--patente`, `--conquista`, `--holo` e as cores de raridade.
Utilitários Tailwind v4 customizados: `painel-holo`, `chanfro`,
`chanfro-suave`, `neon-texto`, `neon-borda`, `entrada-hud`, `glitch`,
`alerta-vermelho`, `flash-aprovado`, `xp-voador`, `subir-contador`,
`brilho-pulso`, `barra-xp`. Todas as animações respeitam
`prefers-reduced-motion`.

Componentes de HUD em `src/components/tribunal/`: `CabecalhoJogador` (avatar,
patente, barra de XP, `ContadorAnimado`, `BarraXP`), `HudGamer` (combo,
estabilidade, mapa de progressão, conquistas), `MenuCampanha`, `TelaMissao`,
`TelaResultado` (tela cinematográfica em etapas) e `Particulas`.

### Convenções

- Manter o tom: militar-acadêmico, implacável, sem elogios fofos.
- Nunca trocar reações visuais por texto puro — toda aprovação/reprovação
  precisa de animação e som.
- Ao alterar a lógica de recompensa, mantenha `motor.ts` como fonte única da
  verdade (evite fórmulas duplicadas em componentes).
