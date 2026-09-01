# Registro do uso de IA

Este diretório atende ao item **II.4** do enunciado.

## O que tem aqui

| Arquivo | Conteúdo |
|---|---|
| `prompts/` | Todos os prompts do candidato, íntegros, numerados e em ordem cronológica. Sem correção de digitação, sem reescrita posterior. |
| `registro-de-verificacao.md` | O que o agente produziu, o que foi conferido, onde errou, o que foi feito. Escrito no momento. |
| `registro-de-tempo.md` | Relógio real por fase. |
| `onde-o-agente-errou.md` | O parágrafo pedido pelo enunciado, em primeira pessoa, escrito a partir do registro de verificação. |
| `transcricao/` | A sessão inteira e as **quatro rodadas de auditoria**, geradas por script a partir do log local do Claude Code. **Não editadas à mão.** |

## Duas ressalvas sobre este diretório

**Sobre as datas.** O campo `data` no cabeçalho de cada prompt é aproximado —
foi digitado por mim, e em alguns casos ficou minutos à frente do commit que
gravou o arquivo. **O carimbo confiável é o do git**, não o do cabeçalho:

```bash
git log --diff-filter=A --format='%ad %h  %f' --date=format:'%d/%m %H:%M:%S' -- docs/ia/prompts/
```

Declaro isto porque a mesma falha — horário escrito para a frente — apareceu no
registro de tempo e foi apontada por auditoria. Seria incoerente corrigi-la lá e
deixá-la aqui sem menção.

**Sobre duas lacunas — o mesmo modo de falha, duas vezes.** Os prompts **0010** e
**0012** faltaram na primeira gravação: em ambos os casos o comando que os criaria
foi barrado por um hook de confirmação e a operação não foi repetida. O 0010 foi
encontrado pela segunda auditoria; o 0012, pela terceira, que observou que "o
registro de prompts continua parando um prompt antes do commit auditado".

Os dois foram recriados com a falha declarada no próprio cabeçalho. **Recriar não
é o mesmo que ter gravado no ato**, e por isso a lacuna fica escrita em vez de
sumir: o enunciado pede os prompts "como foram escritos", e a honestidade sobre o
processo de gravação faz parte disso.

Que a mesma falha tenha ocorrido duas vezes é o dado interessante — na primeira
vez tratei como acidente; foi padrão.

## Ferramentas de IA usadas

- **Claude Code (Opus 5)** — agente principal, em sessão interativa no terminal.

## Fronteira honesta: o que veio do ambiente e o que foi autorado para esta prova

O enunciado pede "as skills, subagentes, comandos, hooks ou servidores MCP **que
você configurou**". Declarar essa fronteira é parte da honestidade da entrega.

### Pré-instalado no ambiente do candidato (NÃO autorado para esta prova)

Plugins de terceiros já presentes na instalação do Claude Code, usados como
ferramenta e não como contribuição própria:

- **Superpowers** — usado neste trabalho: `brainstorming` (exploração do
  problema e desenho antes de qualquer código) e `writing-plans` (plano de
  implementação). A metodologia SDD do plano vem dele.
- **ECC (Every Claude Code)** — presente no ambiente; agentes e skills de
  revisão disponíveis.

Reivindicar esses plugins como trabalho próprio seria desonesto. Eles são
ferramenta, como o editor.

### Autorado especificamente para esta prova

- **`CLAUDE.md`** (raiz do repositório) — instrução de trabalho do agente:
  contexto, oito regras invioláveis derivadas dos fatos do ambiente, convenções,
  fronteiras de dependência, definição de pronto e o que o agente não decide
  sozinho.
- **`.claude/agents/auditor-de-entrega.md`** — subagente especialista criado
  para conferir a entrega final contra o enunciado e emitir veredito.
  *(O relatório produzido por ele fica fora do escopo da entrega, em `auditoria/`,
  que está no `.gitignore`; as transcrições das auditorias estão em
  `transcricao/auditorias/`.)*
- **`.claude/hooks/guarda-regras.mjs`** e **`.claude/settings.json`** — um hook
  `PreToolUse` que **bloqueia a escrita** antes que ela aconteça. Detalhado
  abaixo.

## O hook: as duas regras que deixaram de depender de boa vontade

As duas regras mais estruturais do `CLAUDE.md` são negativas, e regra negativa
é a mais fácil de quebrar sem perceber:

| Regra | O que o hook barra | Onde vale |
|---|---|---|
| **2** — nenhum tipo de documento no front-end | `"RG"`, `"contracheque"`, `"procuração"`, `"laudo"`… entrando em código | `src/`, exceto `src/mocks/` |
| **3** — uma única costura de rede | `fetch(` entrando em código | `src/`, exceto `src/shared/api/` |

**Por que um hook, se já havia um teste.** O teste de arquitetura verifica as
mesmas duas regras e continua existindo — mas ele chega **depois**: o código já
foi escrito, já parece certo, e desfazê-lo custa mais do que não tê-lo escrito.
O hook chega **antes**, e devolve ao agente o motivo junto com a recusa, em vez
de uma falha de teste sem contexto minutos depois.

**Três detalhes que decidem se ele presta:**

1. **Ele lê o conteúdo sem comentários.** É a lição que o teste de arquitetura
   já tinha aprendido do jeito difícil — a primeira versão dele acusou
   `estado.ts` de tocar em `window` porque a docstring dizia *"sem React, sem
   fetch, sem window"*. Um hook que pune comentário ensina a apagar explicação.
2. **A lista de termos não mora no hook.** Mora em
   `.claude/hooks/regras-do-projeto.json`, lida também pelo teste de
   arquitetura — e **há um teste que falha se o hook passar a guardar uma cópia
   própria**. Duas listas divergiriam em silêncio, e a divergência apareceria do
   pior jeito possível: o hook liberando o que o teste reprova.
3. **Ele só olha o que está ENTRANDO.** No `Write` isso é o arquivo inteiro; no
   `Edit`, apenas o trecho novo. Julgar o arquivo inteiro num `Edit` faria toda
   alteração em `mocks/` ou em código legado ser recusada por algo que já
   estava lá.

**Como exercitá-lo sem depender do agente** (o contrato é JSON na entrada
padrão; saída 2 bloqueia):

```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"src/features/x.tsx","content":"await fetch(\"/api\")"}}'   | node .claude/hooks/guarda-regras.mjs; echo "saida=$?"
```

Se ele disparou durante o desenvolvimento, e o que aconteceu, está no
[`registro-de-verificacao.md`](registro-de-verificacao.md).

## O verificador de contagens: a auditoria virando ferramenta

Quatro rodadas do subagente auditor acharam a **mesma classe de defeito quatro
vezes** — um número escrito num documento e desmentido pelo repositório. Na
quarta, ele parou de apontar ocorrências e apontou a causa: o número mora em dois
lugares, e a resposta até ali era disciplina.

`npm run contagens` é a implementação da recomendação dele. Compara o README com
a realidade — testes (rodando a suíte), ADRs, prompts, divergências, testes de
arquitetura, comandos de auditoria exportados — e falha com a lista do que não
bate. Está na CI, ao lado do passo que regenera os tipos do contrato.

Vale registrar como isso fecha o ciclo do item II.4: **um agente encontrou um
padrão nos próprios erros de outro agente e do autor, e o padrão virou um passo
de verificação que nenhum dos dois pode esquecer de rodar.**
