# Registro de decisões de arquitetura (ADR)

> *"o que decidiu, que alternativas considerou e por que descartou cada uma.
> Queremos ler sobretudo o que você não fez."*

Cada ADR segue o mesmo formato:

**Contexto** · **Decisão** · **Alternativas descartadas** (com o motivo real, não
com o motivo diplomático) · **Consequências**, boas e ruins · **Como saberemos
que erramos** — o sinal concreto que indicaria revisitar a decisão.

A última seção existe porque decisão sem critério de refutação é preferência
pessoal com aparência de engenharia.

## Índice

| # | Decisão | Fato que a motivou |
|---|---|---|
| [001](001-trilha-b-e-recorte-da-fatia.md) | Trilha B e recorte da fatia vertical | — |
| [002](002-react-vite-typescript.md) | React + Vite + TypeScript | — |
| [003](003-contrato-primeiro-openapi.md) | Contrato-primeiro em OpenAPI, tipos gerados | (f) |
| [004](004-msw-como-mock-unico.md) | MSW como mock único: browser, testes e HTTP | — |
| [005](005-processamento-assincrono-por-polling.md) | Assíncrono por polling com backoff | (a), (e) |
| [006](006-tanstack-query-sem-store-global.md) | TanStack Query, sem store global | — |
| [007](007-deduplicacao-por-hash-no-cliente.md) | Deduplicação por SHA-256 no cliente | (a), (c) |
| [008](008-campos-dirigidos-por-schema.md) | Campos renderizados por schema vindo da API | (f) |
| [009](009-concorrencia-na-fila.md) | Claim com TTL **e** trava otimista | (g) |
| [010](010-lgpd-no-cliente.md) | LGPD: a lista do que não guardamos | (d) |
| [011](011-identidade-delegada-ao-host.md) | Identidade delegada ao host interno | (g), P1 |
| [012](012-rejeicao-pelo-conferente.md) | Rejeição do documento pelo conferente | (b), P3 |
| [013](013-nome-padronizado-como-campo.md) | Nome padronizado é campo conferível | P4 |
| [014](014-enviar-e-movel-conferir-e-desktop.md) | Enviar é móvel; conferir é desktop | (b) |
| [015](015-segundo-sinal-de-confianca.md) | Segundo portão de confiança, independente do modelo | (a), (f) |
