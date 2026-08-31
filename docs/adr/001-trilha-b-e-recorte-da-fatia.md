# ADR-001 — Trilha B e o recorte da fatia vertical

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Duas trilhas, uma escolha. E, dentro da trilha, a decisão mais consequente da
entrega: **onde cortar**. O enunciado dispensa o produto completo e pede uma
fatia vertical, avisando que *"uma fatia estreita e honesta vale mais do que
cinco funcionalidades pela metade"*.

O prazo real foi comprimido para menos de um dia (o enunciado dá três), o que
torna o corte ainda mais decisivo.

## Decisão

**Trilha B.** Fatia vertical:

```
envio em lote → acompanhamento → fila de conferência → correção de campo → gravação
```

É literalmente o caminho que o enunciado nomeia para a Trilha B: *"do envio até
a correção de um campo"*. **Busca e listagem ficam projetadas e não feitas.**

## Alternativas descartadas

**Trilha A (back-end).** Descartada por escolha de ofício, não por dificuldade.
O enunciado diz que a trilha deve representar *"o trabalho que você quer fazer
aqui"*. Um efeito colateral favorável: a Trilha B obriga a **projetar o
contrato**, o que exige pensar o back-end de qualquer forma — sem poder se
esconder atrás dele.

**Cobrir os cinco comportamentos superficialmente.** Descartada com convicção. O
enunciado antecipa e penaliza exatamente isso. Cinco telas pela metade não
demonstram que o contrato fecha; uma fatia inteira demonstra.

**Só conferência e correção** (sem envio). Mais barata e mais segura no prazo,
mas deixa de ser vertical: sem o envio, os fatos (b), (c) e (e) ficam sem
tratamento, e são três dos sete.

## Consequências

**Boas:** o caminho implementado exercita **todos os sete fatos do ambiente**;
o contrato é provado de ponta a ponta; o corte é defensável porque veio do
próprio enunciado.

**Ruins:** o comportamento 5 do produto não tem tela; quem quiser ver busca vai
encontrar só YAML e mock.

## Como saberemos que erramos

Se, ao demonstrar, a fatia parecer incompleta *dentro de si mesma* — se faltar
um passo entre o envio e a correção — o corte foi mal escolhido. Falta de busca
não é sinal de erro; falta de continuidade seria.
