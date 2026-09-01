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
