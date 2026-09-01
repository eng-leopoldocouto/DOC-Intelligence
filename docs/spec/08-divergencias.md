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

**O que foi feito:** exatamente isso. `GET /documentos` com filtro e cursor está
no contrato e é servido pelo mock; **não há rota nem tela**.

**Registrado aqui** apenas para que a ausência seja uma decisão visível no
histórico, e não um esquecimento que ninguém notou.

---

## D-06 — Lista virtualizada: afirmada na spec, **não implementada**

**A spec dizia**, em **cinco lugares** — e dois deles são piores que os outros,
porque não prometem: **afirmam verificação**.

| Onde | O que diz |
|---|---|
| `05-fatos-do-ambiente.md:204` | *"Lista virtualizada e paginação por cursor. O DOM não cresce com a fila"*, apontando `features/review/ListaVirtualizada.tsx` |
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

**Correção aplicada:** removi a exigência do `CLAUDE.md` e do README, em vez de
instalar o ESLint às pressas no fim. **Uma regra que ninguém pode executar é pior
que a ausência da regra** — ensina que a lista de verificação é decorativa. O
`typecheck` estrito, esse sim, roda e é exigido.

---

## D-09 — A guarda G1 não "falha o build"

**A spec dizia** (ADR-008, e o plano na tarefa T13): que a varredura por tipo de
documento hardcoded *"falha o build"*.

**O que foi feito:** a guarda existe e funciona — `tests/arquitetura/fronteiras.test.ts`,
seis asserções, todas passando. Mas ela roda em `npm test`, e `npm run build` é
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
