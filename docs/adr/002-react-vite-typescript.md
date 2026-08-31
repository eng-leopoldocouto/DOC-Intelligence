# ADR-002 — React 19 + Vite + TypeScript

**Status:** aceita · **Data:** 31/08/2026

## Contexto

A escolha de ferramenta é conteúdo da avaliação e precisa ser justificada. Duas
restrições dominam: **menos de um dia** e uma interface com exigências reais —
lista de 800 itens virtualizada, formulário dinâmico gerado por schema,
visualizador de imagem com zoom e rotação.

## Decisão

**React 19 + Vite 6 + TypeScript em modo estrito.**

Vite porque o servidor de desenvolvimento sobe instantaneamente e o mesmo motor
roda os testes (Vitest) — uma configuração, não duas. React porque o
ecossistema de virtualização, formulário e upload é o mais maduro, e porque é o
que um avaliador lê sem atrito.

TypeScript estrito não é preferência de estilo: os tipos do contrato são
**gerados** do OpenAPI, e é o compilador que transforma mudança de contrato em
erro de build (ADR-003). Sem tipos, essa costura não existe.

## Alternativas descartadas

**Next.js 15.** Descartada por **peso conceitual sem retorno**. Traz SSR, rotas
de arquivo e a fronteira server/client — três decisões a explicar e defender
numa aplicação interna, atrás de autenticação, que não indexa nada e não tem
requisito de primeira pintura. Consumiria orçamento de tempo e de explicação nos
30% de arquitetura sem melhorar nada que o enunciado avalie.

**Vue 3 + Vite.** Descartada por margem estreita. Reatividade excelente e menos
cerimônia. Perdeu no ecossistema de dados: virtualização e formulário dinâmico
têm bibliotecas mais maduras em React, e sob prazo apertado a maturidade da
biblioteca vale mais que a elegância do framework.

**HTML e TypeScript sem framework.** Descartada. Formulário dirigido por schema
com estado assíncrono e atualização otimista é exatamente o problema que um
framework resolve. Reimplementar reconciliação à mão gastaria o dia inteiro.

## Consequências

**Boas:** setup em minutos; Vitest sem configuração adicional; a maior parte do
tempo vai para spec e decisões, que é onde está a pontuação.

**Ruins:** React 19 é recente, e algumas bibliotecas ainda estão se ajustando —
mitigado escolhendo dependências conservadoras. Sem SSR, a primeira pintura
depende do bundle; irrelevante para uso interno diário, com cache quente.

## Como saberemos que erramos

Se aparecer requisito de acesso externo indexável ou de primeira pintura crítica,
a ausência de SSR passa a pesar. Nenhum dos dois está no enunciado, e ambos são
migração conhecida.
