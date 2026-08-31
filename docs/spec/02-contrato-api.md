# 02 — O contrato da API

> Na Trilha B *"a API ainda não existe — o contrato é seu para definir e servir
> por mock, e faz parte da entrega."*

A definição formal está em [`openapi.yaml`](openapi.yaml). Este documento
explica **por que o contrato é assim** — que é a parte que um arquivo YAML não
consegue contar.

---

## O contrato foi projetado a partir dos fatos, não das telas

Cada decisão abaixo existe porque um fato do ambiente a exigiu. Um contrato
desenhado a partir das telas teria ficado diferente — e teria quebrado na
primeira semana.

| Decisão do contrato | Fato que a exigiu |
|---|---|
| `POST /documentos` responde **202**, não 200 com resultado | (a) 5–40 s por chamada |
| `contentHash` é **obrigatório** no envio | (c) duplicatas + (a) custo |
| Duplicata responde **200**, não 409 | (c) reenviar é comportamento razoável, não erro |
| `GET /documentos/status?ids=` existe | (e) 800 documentos = 1 requisição |
| Paginação por **cursor**, não offset | (e) a fila muda enquanto é paginada |
| `GET /tipos-documento` devolve schema de campos | (f) prompts e modelo vão mudar |
| `limiarConfianca` vem da API | (f) calibração não pode exigir deploy do front |
| `procedencia` em todo documento | (f) rastrear qual versão produziu qual erro |
| `POST /{id}/conferencia/claim` com TTL | (g) evita trabalho duplicado |
| `PATCH` exige `If-Match` | (g) evita perda silenciosa |
| 409 devolve o **documento atual** no corpo | (g) a UI precisa mostrar o que mudou |
| `GET /{id}/arquivo` devolve URL assinada e curta | (d) LGPD — sem link permanente |
| Identidade por cabeçalho, não por login | premissa P1 |

---

## Quatro escolhas que mereceriam discussão

Registro aqui as que eu defenderia com menos convicção, porque escondê-las seria
pior do que expô-las.

**1. Duplicata como 200, não 409.**
409 é semanticamente mais preciso: "conflito com o estado atual". Escolhi 200
porque o cliente **não está errado** ao reenviar — o fato (c) diz que reenviar é
comportamento esperado do atendimento. Um 409 empurraria a interface para o ramo
de erro num caso que não é erro, e mensagem de erro em fluxo normal treina a
pessoa a ignorar mensagens.
*Contra-argumento válido:* um cliente automatizado teria vida mais fácil com 409.

**2. `PATCH` de campos conclui a conferência.**
Gravar e concluir na mesma operação impede salvar rascunho. Foi deliberado:
rascunho de conferência num documento reservado por TTL cria um estado que
ninguém sabe interpretar quando o TTL expira. *Custo:* a pessoa que precisa
interromper no meio perde o trabalho.

**3. Polling em vez de SSE ou WebSocket.**
Tecnicamente inferior para notificação. Escolhido porque o volume não justifica
conexão persistente e porque polling degrada bem: cai a conexão, a próxima
requisição resolve. Ver
[ADR-005](../adr/005-processamento-assincrono-por-polling.md).

**4. `nomeOrigem` viaja no contrato.**
É dado inútil para a máquina e potencialmente identificador de pessoa (o cliente
pode ter batizado o arquivo com o próprio nome). Mantive porque o conferente
precisa reconhecer o que enviou. *É uma concessão consciente contra o fato (d).*

---

## Como o contrato é servido

Um único conjunto de handlers MSW em `mocks/handlers.ts`, servindo:

```
navegador (dev)  ──┐
testes (Vitest)  ──┼──►  mocks/handlers.ts  ──►  openapi.yaml
npm run mock     ──┘        (implementa)          (define)
```

O mock **simula o ambiente hostil**, não o caminho feliz:

- latência sorteada entre 5 e 40 s (configurável para 0,2–1,5 s em teste)
- taxa de falha injetável, com `FALHOU` e `EXPIRADO` distintos
- confiança variável, gerando documentos que passam e documentos que caem na fila
- `contentHash` repetido devolve duplicata de verdade
- segunda sessão pode roubar o claim e provocar 409 real

> Um mock que só devolve o caminho feliz produz uma interface que só funciona no
> caminho feliz. Os estados de erro precisam ser alcançáveis na demonstração,
> senão ninguém os vê — nem o desenvolvedor, nem o avaliador.

---

## Versionamento

Prefixo `/api/v1`. Mudança incompatível vira `/v2`; campo novo opcional não
quebra e não versiona.

Como os tipos do cliente são **gerados** do YAML, uma mudança incompatível
aparece como **erro de compilação** em cada ponto afetado — não como bug de
produção descoberto pelo atendimento.
