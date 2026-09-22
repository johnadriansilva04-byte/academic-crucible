# Academic Crucible

Atue como um Engenheiro de Software Sênior, Arquiteto de Sistemas Full-Stack e Game Designer especializado em mecânicas de alta pressão e sistemas autônomos.

Quero construir uma aplicação web de alta performance e minimalista (estilo CAD industrial / terminal de elite) chamada "Tribunal Acadêmico". O jogo é um RPG de sobrevivência textual onde o usuário precisa evoluir sua capacidade de escrita e retórica subindo de grau acadêmico à força, enfrentando vigilância extrema, um corretor sabotado e julgamentos implacáveis por uma IA local.

Estruture a implementação técnica e as mecânicas detalhadas abaixo para que o código seja gerado de forma limpa, modular e funcional:

1. ARQUITETURA E BANCO DE DADOS (SUPABASE):

   - Utilize exclusivamente o Supabase como dependência externa para persistência de dados.

   - Crie a estrutura da tabela principal no Supabase para salvar o progresso do usuário (ex: ID do usuário, nível acadêmico atual, pontuação acumulada, histórico de veredictos e status de banimentos por fuga de aba).

   - Todo o restante da lógica do jogo, motor de regras, interface e processamento deve residir inteiramente no código local.

2. PROGRESSÃO DE CARREIRA ACADÊMICA (A HISTÓRIA E A LORE):

   - O jogo mapeia a jornada completa do conhecimento através de eras progressivas e implacáveis. Cada fase exige um gênero textual específico para desbloquear a próxima:

     * Fase 1: Ensino Fundamental (Redações descritivas e estruturação básica).

     * Fase 2: Ensino Médio (Dissertações argumentativas sob pressão).

     * Fase 3: Graduação (Petições, resumos críticos e artigos acadêmicos iniciais).

     * Fase 4: Mestrado (Ensaios complexos, teses parciais e coesão avançada).

     * Fase 5: Doutorado (Defesa de tese e escrita de alto nível intelectual).

     * Fase Final: Artigos Científicos de Elite (O teste máximo de retórica e precisão).

3. O CARCEREIRO DE ABAS (Anti-Fuga e Vigilância):

   - Implemente o monitoramento estrito do navegador (usando Page Visibility API e eventos de blur/focus).

   - Regra intransigente: Se o usuário minimizar a janela, trocar de aba, clicar fora ou tentar colar conteúdo externo, o sistema detecta imediatamente, aplica um "Game Over" sumário, penaliza a pontuação no Supabase e emite um veredito humilhante de reprovação escolar/acadêmica.

4. O CORRETOR SABOTADO (Mecânica de Punição Ortográfica):

   - Suprima ou bloqueie o corretor ortográfico nativo do navegador.

   - Quando o sistema identificar desvios ou disparar uma checagem de vocabulário, **nunca dê a resposta correta de bandeja**.

   - A interface deve gerar obrigatoriamente **três opções** de escolha (sendo duas armadilhas maliciosas e apenas uma correta). O jogador é forçado a parar, raciocinar e selecionar a alternativa exata sob pressão de tempo para conseguir prosseguir com a digitação.

5. O TRIBUNAL DE AVALIAÇÃO (IA LOCAL / MOTOR DE ANÁLISE):

   - Integre uma solução de IA local simplificada e leve (ou biblioteca/modelo leve executável via client-side/Node local) para analisar semanticamente o texto gerado pelo usuário ao concluir a missão.

   - O motor avalia a densidade de argumentos, coesão e vocabulário, descartando elogios fofos e gerando um veredito sumário direto: ou o jogador é aprovado com louvor ("Gênio / Doutor Notável") ou recebe o selo oficial de reprovação ("Completo Jumento"), descontando pontos severamente e ditando se ele avança de nível acadêmico ou repete o ano.

6. REQUISITOS DE UX/UI:

   - Interface limpa, tema escuro, tipografia monoespaciada ou industrial, focada na área de digitação, painel de status do nível acadêmico atual e alertas visuais de pressão implacáveis.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/51ce9a02-1657-41c6-b983-3ced43b7f4cb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
