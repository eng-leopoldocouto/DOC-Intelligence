# 08 — Divergências entre a especificação e a implementação

> *"Se a implementação divergiu da especificação, entregue a especificação como
> estava e diga onde divergiu."*

A spec foi congelada na tag **`spec-v1`** antes da primeira linha de código:

```bash
git show spec-v1 --stat
```

Divergir não é demérito — contato com o código ensina coisas que o papel não
ensina. Esconder a divergência é que seria.

**Formato de cada entrada:** o que a spec dizia · o que foi feito · por quê ·
se a spec deveria ser corrigida ou se o código é que está errado.

---

## D-01 — Componentes de campo num arquivo só, não em seis

**A spec dizia** (`04-arquitetura.md`, plano T10): `CampoTexto`, `CampoData`,
`CampoCpf`, `CampoCnpj`, `CampoNumero` e `CampoSelecao` em arquivos separados.

**O que foi feito:** os seis em `fields/componentes.tsx`, com o registry à parte.

**Por quê:** são variações de uma mesma coisa, de dez a quinze linhas cada, que
compartilham o mesmo envoltório de rótulo, aviso de confiança e marca de
"corrigido por pessoa". Seis arquivos com uma função trivial cada espalhariam
essa vizinhança sem ganhar isolamento algum.

**Veredito:** a **spec é que estava errada**. O registry continua sendo a
costura — trocar um componente segue custando um arquivo e uma linha.

---

## D-02 — `fetch` com `keepalive` em vez de `sendBeacon`

**A spec dizia** (plano T9.4): liberar a reserva no `beforeunload` com
`navigator.sendBeacon`.

**O que foi feito:** `fetch(..., { keepalive: true })`, via uma opção nova em
`shared/api/http.ts`.

**Por quê:** descobri na implementação que `sendBeacon` só faz `POST` e **não
carrega cabeçalho** — nem o `X-Usuario-Id` da identidade, nem o método `DELETE`
que o contrato define para liberar a reserva. Usá-lo exigiria distorcer o
contrato para acomodar uma limitação da API do navegador.

**Veredito:** **melhoria descoberta no contato com o código.** O contrato
permaneceu intacto, que era o ponto.

---

## D-03 — Semeadura do mock (acréscimo não previsto)

**A spec não previa.** O mock nasceria vazio.

**O que foi feito:** `semear()` cria dez documentos pré-existentes ao iniciar no
navegador — seis aguardando conferência, dois prontos, um `FALHOU` e um
`EXPIRADO`.

**Por quê:** o estado do mock vive em memória e se perde a cada recarga da
página. Sem semeadura, quem abrisse o projeto encontraria a fila de conferência
vazia e não teria o que conferir — a tela principal da entrega ficaria
indemonstrável. Os dois modos de falha do fato (a) também dependiam de sorte
para aparecer; agora estão garantidos.

**Cuidado tomado:** semeia **apenas no navegador**. Os testes precisam de estado
limpo e determinístico e chamam `limpar()` a cada caso.

---

## D-04 — Adaptações do ambiente de teste

**A spec dizia** (`06-plano-de-testes.md`): Vitest com jsdom para tudo.

**O que foi feito:** três ajustes, todos por limitação do jsdom, nenhum por
limitação do produto:

1. `Blob` e `File` do jsdom trocados pelos **nativos do Node** em
   `tests/setup.ts` — o `fetch` do Node não reconhece os do jsdom ao serializar
   `multipart/form-data`. Em navegador real os três vêm do mesmo motor.
2. Testes de contrato e de lógica rodam em **ambiente Node**, por não precisarem
   de DOM. Rodá-los em Node é mais fiel ao navegador do que rodá-los em jsdom.
3. Os testes de conferência **criam o documento direto no mock**, sem passar
   pelo envio. A conferência não depende do envio, e atravessar uma tela que
   não se está testando só acrescentaria um motivo de falha alheio.

**Veredito:** **a spec era otimista** sobre o jsdom. O princípio dela — testar o
que quebra em silêncio — não mudou.

---

## D-05 — Rota de busca não criada

**A spec dizia** (`07-nao-feito.md`): busca e listagem projetadas, sem tela.

**O que foi feito:** não há rota nem tela. A **listagem por estado** existe no
contrato e é servida pelo mock; a **busca por termo, não** — ver [D-10](#d-10--o-texto-afirmava-busca-especificada-o-contrato-nao-tem-parametro-de-termo),
que corrige o exagero desta própria entrada.

**Registrado aqui** apenas para que a ausência seja uma decisão visível no
histórico, e não um esquecimento que ninguém notou.

---

## D-06 — Lista virtualizada: afirmada na spec, **não implementada**

**A spec dizia**, em **cinco lugares** — e dois deles são piores que os outros,
porque não prometem: **afirmam verificação**.

| Onde | O que diz |
|---|---|
| `05-fatos-do-ambiente.md:252` | *"Lista virtualizada e paginação por cursor. O DOM não cresce com a fila"*, apontando `features/review/ListaVirtualizada.tsx` — **a afirmação foi riscada no lugar em 01/09**, depois que a quarta auditoria mostrou que ela seguia de pé |
| `04-arquitetura.md:119` | a mesma promessa no fluxo da conferência |
| `07-nao-feito.md:36` | trata a lista virtualizada como **já existente e reaproveitável** para a futura tela de busca |
| `06-plano-de-testes.md:94` | **"Verificado à mão com fixture"** — afirma uma verificação que não ocorreu |
| `01-requisitos.md` | **RF-06 marcado ✅**, com critério de aceite "o número de nós no DOM não cresce"; e **RNF-04** com verificação "Teste com fixture de 800" — `grep -rn "800" tests/` não devolve nada |

As duas últimas são o achado dentro do achado. Prometer e não entregar é uma
falha; **afirmar ter verificado o que não foi verificado é outra**, e mais grave,
porque quem lê para de conferir. Foram encontradas pela terceira auditoria, depois
que a segunda já havia corrigido esta mesma divergência "por completo".

**O que foi feito:** só a metade. A **paginação por cursor existe**
(`useFilaDeConferencia`, `useInfiniteQuery`, 50 por página) e é ela que evita
trazer 800 documentos de uma vez. A **virtualização não existe**: a lista é um
`itens.map(...)` e o DOM cresce à medida que se pede mais páginas.

**Por quê:** não foi decisão — foi omissão. A paginação resolveu o problema
visível na demonstração e eu segui adiante sem voltar.

**Gravidade real:** com 50 itens por página o DOM fica pequeno; o problema só
aparece se alguém pedir "carregar mais" muitas vezes seguidas. Não é o desastre
que a ausência sugere, mas **é menos do que a spec prometeu**.

**Veredito: o texto estava errado, não a spec.** A decisão de virtualizar
continua certa; o que faltou foi executá-la. Custo estimado: 1 h com
`@tanstack/react-virtual`.

**Como isto foi descoberto:** pelo agente auditor, que buscou `virtualiz` em
`src/` e encontrou zero ocorrências contra três afirmações no texto. É
exatamente o tipo de divergência que este documento existe para expor — e ela
tinha passado por mim.

---

## D-07 — Bloqueio de sessão por inatividade: afirmado, não implementado

**A spec dizia** (`05-fatos-do-ambiente.md`, fato (d)): *"bloqueio de sessão por
inatividade na tela de conferência, que é onde o documento fica aberto na tela
enquanto a pessoa atende alguém no balcão"*.

**O que foi feito:** nada. Não há temporizador de inatividade.

**Atenuante honesto:** a reserva de conferência **expira em 5 minutos** e o
documento volta à fila, o que limita a janela do problema — mas a imagem
continua visível na tela de quem abriu.

**Veredito:** omissão, não decisão. Custo: cerca de 40 min. Deveria ter sido
declarado em `07-nao-feito.md` desde o início.

---

## D-08 — `npm run lint` não existe

**A spec dizia** (`CLAUDE.md`, "definição de pronto", e o README): que
`npm run lint` deve passar antes de considerar uma tarefa pronta.

**O que foi feito:** ESLint nunca foi instalado. O script não existe, embora haja
um `eslint-disable-line` em `PaginaConferencia.tsx`.

**Por quê:** cortei a configuração do linter no scaffold para ganhar tempo e não
voltei para ajustar a definição de pronto, que passou a exigir um comando
inexistente.

**Correção aplicada na hora:** removi a exigência do `CLAUDE.md` e do README, em
vez de instalar o ESLint às pressas no fim. **Uma regra que ninguém pode executar
é pior que a ausência da regra** — ensina que a lista de verificação é
decorativa. O `typecheck` estrito, esse sim, roda e é exigido.

### FECHADA em 01/09/2026

`npm run lint` existe e passa: **oxlint**, com `--deny-warnings`, também na CI.

Escolhi oxlint e não ESLint por uma razão que não é velocidade: **zero
configuração de plugin**. O ESLint desta pilha exigiria quatro pacotes e um
arquivo de configuração que ninguém revisa, e a chance de eu introduzir um
conjunto de regras que só faz barulho era alta a essa altura do prazo.

Houve **um** aviso em todo o `src/` e `tests/` —
`unicorn/no-new-array` em `features/upload/filaDeEnvio.ts`, sobre
`new Array<T>(n)`. Corrigi o código (`Array.from({ length: n })`, comportamento
idêntico ali) em vez de desligar a regra: silenciar regra para alcançar "zero
avisos" seria reincidir exatamente na lista de verificação decorativa que esta
divergência denunciou.

**Verificado que o comando não é vácuo:** introduzi uma violação deliberada num
arquivo e o linter a apontou com saída 1; removida, saída 0. Um linter que não
varre nada passa igual.

---

## D-09 — A guarda G1 não "falha o build"

**A spec dizia** (ADR-008, e o plano na tarefa T13): que a varredura por tipo de
documento hardcoded *"falha o build"*.

**O que foi feito:** a guarda existe e funciona — `tests/arquitetura/fronteiras.test.ts`,
sete asserções, todas passando. Mas ela roda em `npm test`, e `npm run build` é
apenas `tsc -b && vite build`. **Não há CI.** Quem rodar só o build não vê a
guarda.

**Por quê:** escrevi "falha o build" pensando no pipeline que um projeto real
teria, e entreguei um projeto sem pipeline.

**Veredito: o texto prometeu mais do que a montagem entrega.** A correção certa
é um workflow de CI rodando `typecheck` e `test` a cada push — cerca de 20 min,
fora do prazo desta entrega.

**Registro esta divergência** porque ela é da mesma classe das D-06 e D-07:
afirmação de texto sem lastro no que está montado. Tendo corrigido aquelas
depois da auditoria, deixar esta de pé seria incoerente.

### FECHADA em 01/09/2026

`.github/workflows/ci.yml` roda em todo push e em toda *pull request*:
`npm ci` · `npm run lint` · `npm run typecheck` · `npm test` ·
**regerar os tipos e falhar se o diff não vier vazio** · `npm run build`.

O penúltimo passo é o que vale mais do que os outros. O README afirma, desde o
começo, que os tipos são **gerados** do contrato e nunca escritos à mão (regra 1
do `CLAUDE.md`). Até aqui isso era palavra: agora, se alguém editar
`types.gen.ts` sem tocar no `openapi.yaml`, ou mudar o contrato sem regerar, o
diff não vem vazio e a CI cai. **A regra 1 deixou de depender de disciplina.**

E a guarda G1 finalmente "falha o build" no sentido em que a ADR-008 prometia —
`npm test` inclui `tests/arquitetura/fronteiras.test.ts`, e `npm test` agora é
um passo obrigatório de CI.

**Um quinto passo, que não estava previsto e é o mais útil.** A quarta auditoria
observou que quatro rodadas encontraram a **mesma classe de defeito quatro
vezes**: um número escrito num documento e desmentido pelo repositório. A
resposta das três primeiras foi disciplina — *procurar pelo número, não pelo
assunto* —, e disciplina falhou quatro vezes seguidas.

`npm run contagens` (`scripts/conferir-contagens.mjs`) compara o que o README
afirma com o que o repositório tem: total de testes (rodando a suíte), ADRs,
prompts, divergências, testes de arquitetura, comandos de auditoria exportados, e
o índice das ADRs contra os arquivos. **Ele encontrou um erro meu no minuto em
que passou a existir** — eu tinha escrito "190 comandos" e são 187.

O conserto durável não era acertar o número desta vez.

---

## D-10 — O texto afirmava busca "especificada"; o contrato não tem parâmetro de termo

**O texto dizia**, em três lugares:

| Onde | O que dizia |
|---|---|
| `README.md` (limitações) | *"Sem busca. **Projetada e servida pelo mock**, sem tela"* |
| `07-nao-feito.md` | *"**Especificado e servido pelo mock** (`GET /documentos` com filtro e cursor), sem tela"* |
| `07-nao-feito.md` (custo) | *"O **contrato já existe**; falta a tela…"* |

**O que existe de fato:** `GET /documentos` aceita **`estado`, `cursor` e
`limite`** — só isso. Não há parâmetro de termo no `openapi.yaml`, e
`mocks/handlers.ts` lê exatamente esses três. O que está servido é **listagem
filtrada por estado**, que é o que a fila de conferência consome; **busca por
nome, CPF ou número nunca foi especificada.**

**Por que a frase enganava:** "projetada e servida pelo mock" faz o leitor
concluir que só falta a tela — quando falta o contrato, os tipos gerados, o
mock e a tela. A diferença entre 3 h e "3 h mais o contrato" é pequena em
esforço e grande em honestidade, porque a primeira versão faz o trabalho parecer
mais adiantado do que está.

**Correção aplicada — e a alternativa descartada.** Havia duas saídas:

- **(a) corrigir o texto**, dizendo "listagem filtrada por estado, servida pelo
  mock; busca por termo não especificada";
- **(b) acrescentar `q` ao `openapi.yaml` e ao mock**, regerar os tipos e testar
  o filtro, tornando a frase verdadeira.

**Escolhi (a).** (b) faria a frase virar verdade acrescentando **superfície de
contrato sem consumidor** — um parâmetro que nenhuma tela exerce, criado no fim
do prazo para justificar um texto escrito antes. Isso é a mesma classe de
problema que as D-06 e D-07: afirmação primeiro, lastro depois. O argumento
desta entrega é a fatia estreita e honesta; a correção que a sustenta é a que
faz o texto descrever o que existe, não a que amplia o que existe para caber no
texto.

**Veredito: o texto estava errado, e a ausência continua declarada.**

---

## D-11 — `aria-modal="true"` declarado e não cumprido nos dois diálogos

**O texto dizia** (`07-nao-feito.md`, seção "Reduzido de propósito"):
*"Feito: navegação por teclado na conferência, rótulos associados, foco
visível."*

**O que existia:** `ConflitoDialog` e `RejeitarDialog` traziam `role="dialog"` e
`aria-modal="true"` **sem foco inicial, sem Escape, sem retorno de foco e sem
contenção de Tab**. A afirmação era verdadeira para o painel de campos e falsa
para os dois pontos em que a pessoa é interrompida por um modal.

**Por que isso é pior que não declarar:** o leitor de tela **confia** no
atributo e informa que se está num contexto modal. Quem depende dele tabula
para fora achando que está protegido; quem aperta Escape não sai; quem fecha
perde o lugar, porque o foco volta ao `<body>` e a próxima tabulação recomeça do
topo da página. O atributo transformava uma ausência de recurso em informação
errada.

**O que foi feito:** um único `src/shared/ui/Dialogo.tsx` resolve os quatro
pontos, e os dois diálogos passaram a usá-lo. Verificado em
`tests/features/dialogo.test.tsx` pelo caminho real (abrir a rejeição a partir
da conferência), não por harness sintético — o defeito estava na montagem.

**Alternativa descartada: `<dialog>` nativo com `showModal()`**, que traria
contenção de foco e Escape de graça no navegador. **O jsdom não implementa
`showModal()`**, e a conferência é a tela mais coberta por testes desta entrega.
Trocar cobertura de teste real por ~40 linhas de gerência de foco não compensa
aqui. Em um projeto sem essa restrição, `<dialog>` seria a escolha certa —
fica registrado como a primeira troca a fazer quando o ambiente de teste
permitir.

**Veredito:** omissão do código, não da spec. Mas o texto **afirmava mais do que
existia**, e é por isso que a entrada está aqui e não só no histórico.
