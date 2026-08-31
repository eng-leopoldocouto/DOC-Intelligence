# ADR-012 — Rejeição do documento pelo conferente

**Status:** aceita · **Data:** 31/08/2026 · **Resolve a premissa P3**

## Contexto

O enunciado **não pede** rejeição. Os cinco comportamentos do produto vão do
recebimento à conferência, e a conferência é descrita como *"a pessoa conferente
corrige o que a máquina errou"*.

Mas o fato (b) descreve um mundo com *"fotografias tortas desses mesmos papéis"*,
enviadas *"do próprio celular, quase sempre com a foto original da câmera"*, sem
validação alguma de quem envia.

Cruzando os dois: **e quando a máquina não errou — quando a foto simplesmente
está ilegível?** Não há o que corrigir. Sem uma saída, esse documento fica preso
na fila para sempre, e a pessoa "resolve" preenchendo o campo com qualquer coisa
para tirá-lo da frente. **A ausência da funcionalidade produz o pior resultado
possível: dado inventado com aparência de conferido.**

## Decisão

**Estado `REJEITADO`, terminal, com motivo obrigatório.**

`POST /{id}/rejeitar` com motivo em `ILEGIVEL`, `TIPO_INCORRETO`, `INCOMPLETO`,
`NAO_E_DOCUMENTO`, `OUTRO`, mais observação livre.

Rejeitar **não** dispara reprocessamento — reprocessar uma foto ilegível gasta
dinheiro para chegar ao mesmo lugar (fato a). O caminho correto é novo envio, que
gera novo `contentHash` e portanto não colide com a deduplicação.

**Modelado e implementado**, não apenas registrado. O custo é uma transição de
estado, um endpoint no mock e um diálogo — cerca de 15 minutos — contra um buraco
lógico que produziria dado falso.

## Alternativas descartadas

**Não ter rejeição.** Fiel ao enunciado lido ao pé da letra. Descartada porque
produz o comportamento descrito acima: a pessoa inventa dado para desbloquear a
fila. Uma interface que não oferece a saída correta ensina a saída errada.

**Modelar na spec e não implementar.** Legítimo pelo enunciado — registrar como
risco conhecido também conta. Descartada por relação custo-benefício: quinze
minutos de implementação contra a demonstração concreta de que um requisito foi
**derivado de um fato**, que é exatamente o que o critério de 15% mede.

**Reprocessar automaticamente antes de permitir rejeição.** Descartada pelo fato
(a): gastaria uma chamada paga para reconfirmar que a foto continua ilegível.

**Deixar o conferente apagar o documento.** Descartada por perder rastro. Um
documento chegou, alguém o descartou, e é preciso saber por quê — inclusive para
avisar quem enviou. `REJEITADO` com motivo preserva a história; apagar a destrói.

## Consequências

**Boas:** a fila tem saída para todo documento; a interface não empurra ninguém a
inventar dado; o motivo alimenta o retorno ao atendimento e revela padrões (muita
`ILEGIVEL` do mesmo remetente é um problema de treinamento, não de software).

**Ruins:** um estado a mais no domínio e um requisito que o enunciado não pediu.
**Assumo o risco de ter ampliado o escopo** — mas ampliado por derivação de um
fato declarado, com justificativa escrita, e não por gosto.

## Como saberemos que erramos

Se a rejeição virar atalho para esvaziar fila em dia de pico — muita rejeição sem
observação — o problema deixa de ser de software e passa a ser de processo. A
distribuição dos motivos é o indicador.
