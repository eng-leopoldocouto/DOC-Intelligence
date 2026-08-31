# ADR-003 — Contrato-primeiro em OpenAPI, com tipos gerados

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Na Trilha B *"a API ainda não existe — o contrato é seu para definir"*. Então o
contrato não é uma restrição herdada: é **artefato de projeto**, entregável
tanto quanto a tela.

Some-se o fato (f): o modelo e os prompts vão mudar mais de uma vez no primeiro
ano, e mudança de prompt tende a virar mudança de resposta.

## Decisão

**`docs/spec/openapi.yaml` é a fonte de verdade.** Os tipos TypeScript do cliente
são **gerados** dele com `openapi-typescript` (`npm run gen:api`). Nenhum tipo de
resposta é escrito à mão.

Regra correspondente no `CLAUDE.md`: se o código precisa de um campo que não está
no contrato, **o contrato muda primeiro**.

## Alternativas descartadas

**Tipos escritos à mão.** Mais rápido no primeiro dia, e o pior negócio possível
a partir do segundo: os tipos passam a ser uma *segunda* fonte de verdade, e
divergem em silêncio. Num sistema cuja premissa declarada é mudar de contrato
várias vezes por ano, isso é dívida garantida.

**GraphQL.** Resolveria bem a variabilidade de campos do fato (f). Descartada:
exige servidor com resolvers, e o enunciado da Trilha B pede mock. Custo alto
para um consumidor único.

**tRPC.** Ótima ergonomia de tipos ponta a ponta — mas **exige que os dois lados
sejam TypeScript**, e a Trilha A pode ser escrita em qualquer linguagem.
Escolher tRPC seria impor a linguagem da outra metade a partir do front-end.
Inaceitável numa fronteira de equipe.

**Nada — combinar por conversa.** É o padrão real de muitos projetos, e é a razão
de muitas integrações quebrarem. Descartada sem hesitação.

## Consequências

**Boas:** mudança de contrato vira **erro de compilação**, não bug em produção;
o mock implementa o contrato, então o teste exercita o mesmo acordo que a demo;
o YAML é documentação executável para quem construir a Trilha A.

**Ruins:** uma etapa a mais no fluxo (regenerar após mudar o YAML), e disciplina
de manter o YAML atualizado — se alguém escrever um tipo à mão "só desta vez", a
costura vaza.

## Como saberemos que erramos

Se aparecerem tipos escritos à mão em `shared/api/`, a decisão não pegou. É
verificável por revisão e poderia virar regra de lint.
