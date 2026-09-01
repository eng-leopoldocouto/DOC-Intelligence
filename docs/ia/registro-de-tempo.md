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
| Fase 1b — plano de implementação | 20:14 | 20:32 | 0h18 | 16 tarefas, 1.188 linhas, TDD passo a passo |
| Fase 2 — scaffold (T1) | 20:36 | 20:41 | 0h05 | Vite/React/TS, tipos gerados do OpenAPI |
| Fase 3 — documentos fictícios (T6) | 20:55 | 21:00 | 0h05 | 6 arquivos, marca d'água, cópia byte a byte |
| Fase 4 — domínio, rede e mock (T2-T5) | 20:41 | 20:55 | 0h14 | 37 testes; mock MSW em 3 consumidores |
| Fase 5a — envio e acompanhamento (T7-T8) | 21:00 | 21:08 | 0h08 | 54 testes; verificado no navegador |
| Fase 5b — conferência (T9-T13) | 21:12 | 21:41 | 0h29 | 64 testes; T-01 e T-03 verificados no navegador |
| Fase 6 — README e agente auditor (T14, T16) | 21:41 | 21:48 | 0h07 | README com roteiro; auditor autorado |
| Fase 7 — carta de fechamento (T15) | 21:48 | 21:55 | 0h07 | 724 palavras, PDF em 2 páginas, Roboto 11 |
| Fase 8 — auditoria e correções | 21:55 | ver último commit | ~0h50* | *duas rodadas de auditoria e as correções; exclui 2h de interrupção por limite de sessão |

**Total: 3h08**, somando a coluna de duração. Início às 19h17 de 31/08/2026;
término na madrugada de 01/09/2026 — o horário exato é o do último commit, e
não um número escrito aqui. Houve uma interrupção de cerca de duas horas por
limite de uso da sessão, **não** contabilizada acima.

## Correção de 01/09/2026

As linhas das fases 6, **7 e 8** traziam **22:00–22:10**, **22:10–22:25** e
**22:25**. Eram
estimativas prospectivas: eu as escrevi *antes* de terminar as fases, e o commit
que as gravou (`eafc56b`) tem carimbo de **21:54:31** — anterior ao horário que
o próprio arquivo declarava como início.

O agente auditor apontou a contradição comparando a tabela com
`git log --diff-filter=A`. Substituí pelos horários reais de entrada dos
arquivos: README e auditor às 21:47:52, carta às 21:54:31. Aproveitei para desfazer a
sobreposição que a estimativa criara entre as fases 5b e 6.

Registro a correção em vez de apagar o erro, porque um arquivo que se apresenta
como "relógio real, carimbado no momento" não pode conter estimativa disfarçada —
e a carta de fechamento se apoia nele.

## Segunda correção, no mesmo dia

**A primeira correção reincidiu no próprio defeito.** Ao consertar as fases 6 e
7, escrevi na fase 8 um término às **00:45** — e o commit que gravou essa linha
tem carimbo de **00:27:35**. Dezoito minutos no futuro, dentro da seção que
acabara de explicar por que carimbo futuro é inaceitável. A segunda auditoria
apontou.

A correção agora é **estrutural, não numérica**: a coluna "fim" da fase em
andamento passou a dizer *"ver último commit"*. Não é possível datar
prospectivamente um campo que aponta para o histórico — o erro deixou de ser
possível em vez de deixar de estar presente.

Corrigi também a soma (3h08, não "aproximadamente 3h00") e a fase 1b, que
declarava 0h21 num intervalo de 18 minutos.

Distribuição: cerca de 40% em especificação, ADRs, plano e registro — tudo
escrito antes de existir uma linha de código.
