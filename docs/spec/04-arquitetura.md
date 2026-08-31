# 04 — Arquitetura

> O critério de maior peso (30%) pergunta: *"o que acontece quando uma peça
> precisa ser trocada"*. Este documento responde nomeando **seis costuras** e,
> para cada uma, o custo real da troca.

---

## Camadas e regra de dependência

```
┌──────────────────────────────────────────────────────────┐
│  app/         composição: router, providers, boundary    │
├──────────────────────────────────────────────────────────┤
│  pages/       telas de rota — orquestram, não decidem    │
├──────────────────────────────────────────────────────────┤
│  features/    upload · processing · review               │
│               hooks + componentes de uma capacidade      │
├──────────────────────────────────────────────────────────┤
│  entities/    domínio puro: tipos, mapeadores, regras    │
│               SEM React · SEM fetch · SEM window         │
├──────────────────────────────────────────────────────────┤
│  shared/      api/ (única costura de rede) · ui/ · lib/  │
└──────────────────────────────────────────────────────────┘

           app → pages → features → entities → shared
                     NUNCA ao contrário
```

`mocks/` fica fora dessa pilha: implementa o contrato, não depende do app.

**Por que essa regra importa:** se `entities/` importasse de `features/`, o
domínio passaria a depender de React e deixaria de ser testável sem DOM. A regra
é verificável por lint, não por disciplina.

---

## As seis costuras

### 1. Transporte HTTP — `shared/api/http.ts`

**Único lugar do código que conhece `fetch`.** Concentra: URL base, cabeçalhos de
identidade, `If-Match`, política de retry, normalização de erro
(`application/problem+json`) e **sanitização de PII antes de qualquer log**.

- *Trocar por axios, ky ou tRPC:* **1 arquivo.**
- *Verificação:* buscar `fetch(` fora de `shared/api/` deve retornar vazio.

> A sanitização mora aqui por um motivo: é o último ponto por onde todo erro
> passa. Espalhada pelos componentes, ela seria esquecida no primeiro
> `catch` novo.

### 2. Contrato — `docs/spec/openapi.yaml` → tipos gerados

`openapi.yaml` é a **fonte de verdade**. `npm run gen:api` gera
`shared/api/types.gen.ts` com `openapi-typescript`. Nenhum tipo de resposta é
escrito à mão.

- *Contrato muda:* regenera e **o compilador aponta cada ponto afetado**.
- *Ganho real:* mudança de contrato vira erro de build, não bug em produção.

### 3. Mock — `mocks/handlers.ts`

Um único conjunto de handlers MSW servindo **três consumidores**:

| Consumidor | Como |
|---|---|
| Navegador em desenvolvimento | Service worker do MSW |
| Testes (Vitest + jsdom) | `setupServer` |
| Servidor HTTP real (`npm run mock`) | `@mswjs/http-middleware` |

- *Trocar mock por API real:* `VITE_API_MODE=live`. **Zero mudança no app.**
- *Por que importa:* o teste exercita exatamente o mesmo mock que a demo. Não
  existe "passa no teste mas quebra na tela" por divergência de dublê.

### 4. Renderização de campos — `features/review/fields/registry.ts`

`Record<TipoDeDado, ComponenteDeCampo>`. A tela de conferência percorre o schema
vindo da API e resolve cada campo pelo registry.

- *Tipo de documento novo:* **zero linhas.** *(fato f)*
- *Tipo de dado novo:* 1 componente + 1 linha no registry.

### 5. Domínio — `entities/`

Tipos e funções puras: transições válidas, comparação com o limiar de confiança,
composição do nome padronizado, mascaramento.

- *Testável sem DOM, sem rede, sem mock.* Os testes mais rápidos e mais estáveis
  da base ficam aqui.

### 6. Estado de servidor — TanStack Query

Cache, invalidação, polling com backoff, atualização otimista e conflito ficam
numa camada só. **Não há store global** — ver
[ADR-006](../adr/006-tanstack-query-sem-store-global.md).

- *Regra:* estado que veio do servidor pertence ao Query. Estado que só existe na
  tela (aba aberta, campo em foco) é `useState`. Não há terceira categoria, e é
  isso que evita a duplicação de verdade que aflige aplicações com store global.

---

## Fluxo da fatia vertical

```
ENVIO
  arquivos → validação local → dedup no lote → SHA-256 → redução da imagem
           → fila de concorrência (máx. 3) → POST /documentos
           → 201 (novo)  ou  200 duplicado: true

ACOMPANHAMENTO
  ids em processamento → 1× GET /documentos/status?ids=…
                       → backoff 2s / 5s / 15s, pausa com aba oculta
                       → estado final: PRONTO · AGUARDANDO_CONFERENCIA
                                     · FALHOU · EXPIRADO

CONFERÊNCIA
  GET /documentos?status=AGUARDANDO_CONFERENCIA  (cursor, virtualizada)
    → POST /{id}/conferencia/claim   (lease 5 min, renovado)
    → GET /tipos-documento           (schema → registry)
    → visualizador do original  ||  campos renderizados por schema
    → PATCH /{id}/campos  com If-Match: <versao>
         200 → PRONTO
         409 → diálogo de conflito, decisão humana
    → ou POST /{id}/rejeitar  com motivo → REJEITADO
    → DELETE claim no beforeunload
```

---

## Decisões de fronteira que valem explicitar

**O front-end não valida regra de negócio do documento.** Ele valida *formato*
(o CPF tem 11 dígitos) porque isso é do componente. Ele não valida *plausibilidade*
(este CPF pertence a esta pessoa) porque isso exige dado que ele não tem.

**O front-end não conhece o limiar de confiança.** Recebe e compara.

**O front-end não decide o nome padronizado.** Recebe a proposta, permite editar,
devolve o que a pessoa escolheu.

O padrão é o mesmo nos três casos: **onde há regra que vai mudar, o front-end
recebe em vez de saber.** É a aplicação direta do fato (f) como princípio de
projeto, e não como remendo pontual.
