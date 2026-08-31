# ADR-005 — Processamento assíncrono acompanhado por polling com backoff

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Fato (a): cada chamada ao modelo leva **de 5 a 40 segundos** — um intervalo de
oito vezes. Fato (e): mais de 800 documentos em duas horas nos dias de pico.

Não existe interface honesta que bloqueie por 40 segundos, e não existe barra de
progresso verdadeira para um processo cuja duração não se conhece.

## Decisão

**Processamento assíncrono.** `POST /documentos` responde **202** e o documento
nasce em `RECEBIDO`. O acompanhamento é por **polling em lote com backoff
progressivo**:

- **Em lote:** um único `GET /documentos/status?ids=…` para todos os documentos
  em acompanhamento. 800 documentos = 1 requisição.
- **Backoff:** 2 s nos primeiros 30 s · 5 s até 2 min · 15 s depois.
- **Pausa com a aba oculta** (`visibilitychange`).

A interface mostra **tempo decorrido**, nunca porcentagem.

## Alternativas descartadas

**Chamada síncrona.** Quarenta segundos de requisição bloqueada estoura timeout
de proxy, prende conexão e produz uma interface travada. Descartada de imediato.

**Server-Sent Events.** Tecnicamente a melhor opção para notificação: sem
requisição desperdiçada, latência mínima, reconexão automática. **É a alternativa
que eu defenderia num sistema maior.** Descartada aqui por três razões: exige
suporte no servidor que ainda não existe, o volume não justifica conexão
persistente por operador (150/dia em média), e o polling **degrada melhor** —
caiu a rede, a próxima requisição resolve; com SSE é preciso gerir reconexão e
lacuna de eventos.

**WebSocket.** Tudo que o SSE tem, mais bidirecionalidade que não usaríamos, mais
custo de infraestrutura. Descartada por excesso.

**Polling por documento.** Simples de escrever, catastrófico no pico: 800
documentos a 3 s são 267 requisições por segundo saindo de **um navegador**.

## Consequências

**Boas:** funciona com qualquer back-end HTTP, sem exigência de infraestrutura;
degrada bem; o backoff casa com a distribuição real de 5–40 s.

**Ruins:** até 15 s de latência para ver um estado final tardio; requisições
gastas em documentos que ainda vão demorar. Aceitável — ninguém fica olhando a
tela esperando um documento específico.

## Como saberemos que erramos

Se o atendimento passar a **esperar olhando a tela** um documento específico, a
latência do polling vira incômodo e o SSE passa a valer o custo. Sinal concreto:
reclamação de "demora para atualizar" em uso real.
