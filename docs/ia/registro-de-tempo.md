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
| Fase 8 — auditoria e correções | 21:55 | ver último commit | ~0h50* | *três rodadas de auditoria e as correções; exclui 2h de interrupção por limite de sessão. **É a linha menos confiável deste arquivo** — ver a ressalva abaixo* |

**Subtotal da primeira sessão: 3h20**, somando a coluna. Início às 19h17 de
31/08/2026. Houve uma interrupção de cerca de duas horas por limite de uso da
sessão, **não** contabilizada.

**Ressalva sobre a fase 8, apontada pela quarta auditoria.** Ela declara ~0h50 e
abrange commits que vão de 21:55 até **06:03** do dia seguinte. Entre eles há
intervalos ociosos que eu não registrei no momento e **não consigo reconstruir
sem inventar** — então a linha fica como está, com esta ressalva, em vez de
ganhar um número mais bonito. O que ela mede com certeza é trabalho; o que ela
não mede é quanto tempo passou entre um commit e o seguinte.

---

## Segunda sessão — 01/09/2026, manhã · auditoria externa

Uma auditoria **externa a este repositório** devolveu uma lista em quatro blocos.
O prompt está íntegro em `prompts/0014-2026-09-01-auditoria-externa-defeitos.md`.
Desta vez cada fase tem o commit que a fecha, e a coluna "carimbo" é conferível
com `git log`.

| Fase | Início | Fim | Duração | Carimbo | Observação |
|---|---|---|---|---|---|
| 4a — leitura e registro do prompt | 09:13 | 09:16 | 0h03 | `c37136c` | o prompt vai íntegro **antes** de qualquer alteração (regra 6) |
| 4b — Blocos 1 e 2: defeitos e fatos do ambiente | 09:16 | 09:39 | 0h23 | `4f88de3` | fronteira de erro, diálogo acessível, `aria-live`, 360 px, segundo portão, pressão da fila; ADR-014 e ADR-015; +17 testes |
| 4c — Bloco 3: artefatos | 09:39 | 10:48 | 1h09 | `78058bf` | CI, hook `PreToolUse`, oxlint, duas capturas, `exemplos.http` |
| 4d — Bloco 4: auditoria, achados e fechamento | 10:48 | 11:37 | 0h49 | `0a4d214` | quarta auditoria em contexto frio, dez achados, correções, gerador do PDF, verificador de contagens e o parágrafo do item II.4 |
| 4e — integração | 11:37 | **ver último commit** | **≥0h05** | `01833aa` | merge do PR #1 e a **primeira execução real da CI** |

**Total: 3h20 na primeira sessão + 2h24 fechadas nesta + a fase 4e = ≥5h49.**

### A CI deixou de ser um arquivo YAML

Na fase 4e ela **rodou de verdade**, três vezes: no push da branch, no *pull
request* e no `main` depois do merge. Os sete passos passaram no runner Linux,
inclusive os dois que existem para provar afirmação de texto — os tipos gerados
não derivam do contrato, e nenhum número do README é desmentido pelo repositório.

Registro isto porque a D-09 foi declarada fechada **antes** de a CI ter rodado
uma única vez. Era, naquele momento, exatamente o tipo de afirmação que este
repositório passou quatro auditorias aprendendo a não fazer. Agora tem lastro, e
o selo no topo do README aponta para a execução.

### Por que "≥", e não um número redondo

Porque este arquivo já errou três vezes o mesmo defeito, e as três foram o mesmo
gesto: **escrever um número que ainda não aconteceu.** A fase em andamento não
tem fim conhecido no instante em que a linha é escrita — tem apenas um piso, que
é o intervalo até o commit anterior.

`≥` é verdade em qualquer momento posterior; um número exato só seria verdade se
eu acertasse o futuro. É a mesma correção estrutural da segunda rodada: tirar do
arquivo a **possibilidade** de errar, em vez de acertar o número desta vez.

### O que faltava aqui, e como foi descoberto

Até a quarta auditoria este arquivo **parava na madrugada de 01/09** e declarava
"Total: 3h20" — enquanto o `git log` já mostrava sete commits da manhã seguinte,
`+1590` linhas só num deles, duas ADRs novas, CI, hook, linter, e a suíte indo de
64 para 96 testes. A soma da coluna estava certa. **O que faltava era coluna.**

É a quarta ocorrência do mesmo defeito no mesmo arquivo, e a primeira em que o
erro não é o número escrito e sim **o número que faltou escrever**. O padrão que
eu mesmo nomeei se aplicou com precisão: a carta foi reescrita e o arquivo que
ela manda conferir não foi tocado — o vizinho, mais uma vez.

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

Corrigi também a fase 1b, que declarava 0h21 num intervalo de 18 minutos.

## Terceira correção — a soma da própria correção saiu errada

A segunda correção mudou dois valores da coluna (fase 1b de 0h21 para 0h18, fase
8 de 0h35 para ~0h50) e, **no mesmo diff**, escreveu "Total: 3h08". 3h08 era a
soma de *antes* das mudanças. A soma de agora é **3h20**.

A terceira auditoria pegou. E nomeou o padrão que as três rodadas repetiram:

> *o defeito não está no item apontado — está no vizinho aritmético do item
> apontado, ou no outro documento que cita o item apontado.*

Daí a regra de processo que passei a seguir e que devia ter seguido desde o
começo: **procurar pelo número, não pelo assunto.** `grep -rn "3h08" docs/`
teria pego isto em quinze segundos; reler o parágrafo, não pegou nenhuma das
três vezes.

Distribuição: cerca de 40% em especificação, ADRs, plano e registro — tudo
escrito antes de existir uma linha de código.
