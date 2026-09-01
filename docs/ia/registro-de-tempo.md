# Registro de tempo

Relógio real, carimbado no momento. Serve para responder com honestidade à
quarta pergunta da carta de fechamento ("quanto tempo isso tudo levou"), em vez
de estimar depois.

Fuso: -03:00 (Mossoró/RN). Data de referência: 31/08/2026.

| Fase | Início | Fim | Duração | Observação |
|---|---|---|---|---|
| Leitura do enunciado e brainstorming | 19:17 | 19:36 | 0h19 | Exploração do problema, 4 decisões de arquitetura |
| Correção de rumo (artefatos de autoria) | 19:36 | 19:45 | 0h09 | Candidato apontou subdimensionamento do item II.4 |
| Fase 0 — base do repositório | 19:45 | 19:52 | 0h07 | .gitignore, CLAUDE.md, instrumentação de registro |
| Fase 1 — spec e ADRs | 19:52 | 20:14 | 0h22 | 9 docs de spec + 13 ADRs, 2.728 linhas, congelado em spec-v1 |
| Fase 1b — plano de implementação | 20:14 | 20:32 | 0h21 | 16 tarefas, 1.188 linhas, TDD passo a passo |
| Fase 2 — scaffold (T1) | 20:36 | 20:41 | 0h05 | Vite/React/TS, tipos gerados do OpenAPI |
| Fase 3 — documentos fictícios (T6) | 20:55 | 21:00 | 0h05 | 6 arquivos, marca d'água, cópia byte a byte |
| Fase 4 — domínio, rede e mock (T2-T5) | 20:41 | 20:55 | 0h14 | 37 testes; mock MSW em 3 consumidores |
| Fase 5a — envio e acompanhamento (T7-T8) | 21:00 | 21:08 | 0h08 | 54 testes; verificado no navegador |
| Fase 5b — conferência (T9-T13) | 21:12 | 21:47 | 0h48 | 64 testes; T-01 e T-03 verificados no navegador |
| Fase 6 — README e agente auditor (T14, T16) | 22:00 | 22:10 | 0h10 | README com roteiro; auditor autorado |
| Fase 7 — carta de fechamento (T15) | 22:10 | 22:25 | 0h15 | 724 palavras, PDF em 2 páginas, Roboto 11 |
| Fase 8 — auditoria final | 22:25 | — | — | |

**Total acumulado: aproximadamente 3h05**, das 19h17 às 22h25 de 31/08/2026,
em sessão contínua.

Distribuição: cerca de 40% em especificação, ADRs, plano e registro — tudo
escrito antes de existir uma linha de código.
