# ADR-007 — Deduplicação por SHA-256 calculado no cliente

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Fato (c): *"o cliente reenvia por insegurança, o atendimento reenvia por
precaução"*. Fato (a): cada processamento é **cobrado por documento**.

Cruzando os dois: **cada duplicata é dinheiro queimado e um item a mais na fila
de conferência**, que é o gargalo humano do sistema. Deduplicar ataca os dois
fatos com um mecanismo só.

## Decisão

**SHA-256 do conteúdo, calculado no cliente** com `crypto.subtle.digest` —
nativo do navegador, sem dependência — e enviado como `contentHash` no envio.

Deduplicação em duas camadas:

1. **Dentro do lote selecionado**, antes de qualquer requisição. A pessoa
   arrastou o mesmo arquivo duas vezes.
2. **Contra o histórico**: a API responde `200` com `duplicado: true` e o
   documento existente, em vez de `201`. **Nenhuma chamada ao modelo é
   disparada.**

A interface mostra *"já enviado em 11/08 às 09:12 · ver documento"*. Não é erro.

## Alternativas descartadas

**Deduplicar só no servidor.** Funciona, e continua existindo como rede de
segurança. Mas o arquivo sobe inteiro antes de ser descartado — em dia de pico,
com fotos de 8 MB e o *uplink* do escritório, isso é banda desperdiçada num
momento em que ela é escassa. Calcular hash de 8 MB no cliente leva
milissegundos.

**Deduplicar por nome de arquivo.** Descartada com prejuízo garantido: o fato (b)
diz que os nomes são `WhatsApp Image 2026-08-11 at 09.12.33.jpeg` e
`scan0001.pdf`. **Dois documentos completamente diferentes podem chegar com o
mesmo `scan0001.pdf`.** Deduplicar por nome apagaria documento legítimo — falha
pior que a que resolve.

**Deduplicar por nome mais tamanho.** Melhora, mas continua sendo heurística
sobre metadado. O hash é exato e custa o mesmo.

**Hash perceptual (pHash).** Pegaria duas *fotos do mesmo papel*, que é o caso
literal do fato (c). Descartada para esta entrega: exige decodificar e analisar a
imagem, e a decisão certa é no servidor, **depois** da extração, comparando
campos. Registrado em `07-nao-feito.md`.

## Consequências

**Boas:** duplicata exata custa zero — nem banda, nem chamada ao modelo, nem item
na fila; o hash é a identidade estável do documento, imune ao nome de arquivo.

**Ruins:** não pega reenvio de foto tirada de novo (bytes diferentes, mesmo
papel) — que é justamente o caso do cliente inseguro. **Cobrimos o reenvio do
mesmo arquivo, não a refotografia.** Limitação conhecida e registrada.

## Como saberemos que erramos

Se, em uso real, a fila de conferência mostrar muitos pares visivelmente iguais
com hashes diferentes, a deduplicação exata é insuficiente e o pHash sobe de
prioridade.
