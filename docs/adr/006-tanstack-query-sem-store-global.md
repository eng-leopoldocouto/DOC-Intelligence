# ADR-006 — TanStack Query para estado de servidor, sem store global

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Quase todo o estado desta aplicação **pertence ao servidor**: documentos, seus
estados, o catálogo de tipos, a reserva de conferência. O que é genuinamente do
cliente cabe numa mão: qual aba está aberta, qual campo tem foco, o que a pessoa
digitou e ainda não salvou.

A necessidade real é cache, invalidação, polling com backoff, atualização
otimista e tratamento de conflito — não "gerência de estado" no sentido clássico.

## Decisão

**TanStack Query** para tudo que vem do servidor. **`useState` local** para o que
só existe na tela. **Nenhum store global.**

A regra é uma linha: *estado que veio do servidor pertence ao Query; estado que
só existe na tela é local.* Não há terceira categoria — e é isso que impede a
duplicação de verdade.

## Alternativas descartadas

**Redux Toolkit.** Descartada por **duplicação de verdade**. Copiar dado de
servidor para dentro de um store cria uma segunda cópia que precisa ser
sincronizada à mão: invalidação, refetch, conflito, todos manuais. É trabalho
para resolver um problema que o Query já resolve, e cada linha desse trabalho é
um lugar onde a cópia pode ficar velha.

**Zustand.** Muito mais leve que Redux e sem cerimônia. Descartada pelo mesmo
motivo estrutural: continua sendo um cache de dado de servidor mantido à mão.
Zustand é ótimo para estado de cliente — e aqui quase não há estado de cliente.

**`useState` + `useEffect` puros.** Descartada por reescrita. Cache,
deduplicação de requisição, backoff, cancelamento e atualização otimista
existiriam de qualquer forma; a diferença é se eles são uma biblioteca testada ou
código nosso, escrito com pressa, num dia.

**Context API para dados de servidor.** Descartada por desempenho: mudança no
contexto rerrenderiza todos os consumidores. Numa lista de 800 itens, isso é
inaceitável.

## Consequências

**Boas:** polling, backoff, atualização otimista e reversão em caso de 409 vêm
prontos; nenhuma cópia manual de dado de servidor; cada tela declara o que
precisa.

**Ruins:** dependência de uma biblioteca com opinião forte, e as chaves de cache
(`queryKey`) viram acoplamento implícito entre telas — mitigado centralizando as
chaves num único módulo.

## Como saberemos que erramos

Se aparecer estado de cliente genuinamente compartilhado e complexo (um
assistente de várias etapas, edição em massa), aí sim cabe um store pequeno —
**para esse estado**, nunca para dado de servidor.
