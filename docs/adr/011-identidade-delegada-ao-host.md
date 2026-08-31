# ADR-011 — Identidade delegada ao sistema interno hospedeiro

**Status:** aceita · **Data:** 31/08/2026 · **Resolve a premissa P1**

## Contexto

Há uma **tensão real dentro do enunciado**, e ela merece ser nomeada:

- Comportamento 5 do produto: *"Ser consumido por outros sistemas internos do
  escritório, e não por um navegador anônimo na internet aberta."*
- Fato (g): duas **pessoas** conferindo ao mesmo tempo — o que exige saber
  **quem** está conferindo, e portanto identidade de pessoa, não de sistema.

Somado a: *"Você não precisa entregar […] autenticação real."*

Esta era a dúvida que eu mais gostaria de ter enviado ao avaliador. Sem tempo
hábil, virou decisão documentada.

## Decisão

**A autenticação fica fora da nossa fronteira. A identidade entra por ela.**

- O sistema interno que hospeda a interface autentica a pessoa (SSO do
  escritório) e injeta a identidade: `X-Usuario-Id` e `X-Usuario-Nome`, mais o
  token de serviço no `Authorization`.
- Nosso front-end **não tem tela de login** e não gerencia credencial. Ele lê a
  identidade e a repassa.
- **Degradação explícita:** se o host não enviar identidade, o claim continua
  funcionando de forma anônima e a fila mostra "em conferência por outra sessão".
  Ainda evita o desperdício; perde a informação de a quem recorrer.

Isso reconcilia os dois pontos: o serviço é consumido por um sistema interno (que
se autentica), e esse sistema carrega a identidade da pessoa (que o fato (g)
exige).

## Alternativas descartadas

**Login próprio dentro do front-end.** Mais visível numa demonstração. Descartada
por duas razões: inventa uma responsabilidade que o enunciado dispensa
explicitamente, e contradiz "consumido por sistemas internos" — construiríamos
justamente o navegador anônimo que o enunciado afasta.

**Sem identidade de pessoa, só token de serviço.** A leitura mais literal do
comportamento 5. Descartada porque **esvazia o tratamento do fato (g)**: sem
saber quem reservou, a fila só consegue dizer "ocupado", e a pessoa não sabe a
quem recorrer. Perder-se-ia pontuação no fato que mais depende de identidade.

**OAuth ou OIDC completo no front-end.** Descartada por custo desproporcional
num prazo de menos de um dia, para uma aplicação que roda dentro de outro
sistema já autenticado. Seria autenticar duas vezes.

## Consequências

**Boas:** nenhuma credencial passa pelo nosso código, o que é a forma mais
confiável de não vazá-la; o fato (g) fica tratado com identidade real; a
fronteira é honesta e explicitamente documentada.

**Ruins:** dependemos de um host que ainda não existe e de um contrato de
cabeçalhos que combinamos sozinhos. Se o escritório não tiver SSO, alguém precisa
construir essa camada. **É uma dependência externa assumida, não escondida** — e
o mock permite alternar entre identidade presente e ausente para exercitar os
dois caminhos.

## Como saberemos que erramos

Se, na integração, o host não conseguir injetar identidade, a degradação anônima
entra em vigor e o fato (g) fica tratado pela metade. Sinal: a fila mostrando
"outra sessão" em produção.
