# 00 — Visão e escopo

> **Status:** congelado na tag `spec-v1`, antes da primeira linha de código.
> Divergências posteriores estão em [`08-divergencias.md`](08-divergencias.md).

## O problema

Hoje uma pessoa do escritório abre cada arquivo que chega, descobre o que é,
renomeia num padrão interno e digita os dados numa planilha. **Quatro minutos por
documento**, e o volume cresce: 150 por dia em média, mais de 800 no pico,
concentrados entre 9h e 11h.

A 4 min/documento, um dia de pico consome **mais de 53 horas-pessoa** — o
equivalente a seis funcionários dedicados exclusivamente a digitar. É esse número
que justifica o projeto, e é ele que define onde o sistema pode falhar: **um erro
silencioso custa mais caro que uma parada visível**, porque a planilha errada
segue adiante e o retrabalho aparece semanas depois, num processo.

## O que estamos construindo (Trilha B)

A interface do atendimento e **o contrato da API**, que ainda não existe.

O serviço completo — recebimento, classificação por modelo multimodal, extração,
persistência — é a Trilha A e não é nosso. Mas o contrato entre as duas metades
**é nosso para definir**, e ele é entregável tanto quanto a tela.

Isso inverte a relação usual: não estamos consumindo uma API dada, estamos
**projetando a API que gostaríamos de consumir** e provando, com uma tela real,
que ela é suficiente. Se o contrato estiver errado, a tela não fecha.

## Fatia vertical implementada

```
envio em lote  →  acompanhamento  →  fila de conferência  →  correção  →  gravação
```

Um caminho estreito e completo. O enunciado é explícito: *"uma fatia estreita e
honesta vale mais do que cinco funcionalidades pela metade"*.

## Escopo — o que está dentro

| # | Capacidade | Estado |
|---|---|---|
| 1 | Enviar vários documentos de uma vez | **implementado** |
| 2 | Acompanhar o processamento | **implementado** |
| 3 | Fila de conferência com original ao lado dos campos | **implementado** |
| 4 | Corrigir campo e gravar | **implementado** |
| 5 | Buscar o que já foi processado | **projetado, não feito** |

## O que está fora, e por quê

Ver [`07-nao-feito.md`](07-nao-feito.md) para a lista completa com justificativa.
Em resumo: busca e filtros, autenticação real, deploy, upload retomável,
internacionalização, auditoria completa de acessibilidade, e a Trilha A inteira.

## Premissas assumidas

O enunciado convida a perguntar ("perguntas boas contam a favor"). Seis dúvidas
foram levantadas; por restrição de prazo, **não foram enviadas ao avaliador** e
viraram decisões documentadas. Cada uma está registrada com a alternativa
descartada:

| # | Dúvida | Decisão assumida | ADR |
|---|---|---|---|
| P1 | Quem é o consumidor: sistema ou pessoa? | Identidade **delegada ao host interno** e recebida por cabeçalho. Não construímos login. | [ADR-011](../adr/011-identidade-delegada-ao-host.md) |
| P2 | Há SLA de mesmo dia no pico? | **Não assumido.** Fila por ordem de chegada, sem priorização. Contrapressão fica como risco registrado. | [ADR-005](../adr/005-processamento-assincrono-por-polling.md) |
| P3 | O conferente pode rejeitar um documento? | **Sim.** Estado `REJEITADO` com motivo, modelado e implementado. Deriva do fato (b). | [ADR-012](../adr/012-rejeicao-pelo-conferente.md) |
| P4 | O nome padronizado é regra ou proposta? | **Proposta editável.** É mais um campo sujeito a conferência. | [ADR-013](../adr/013-nome-padronizado-como-campo.md) |
| P5 | A imagem original é retida? | **Efêmera para o front.** URL assinada e curta, sem cache local. | [ADR-010](../adr/010-lgpd-no-cliente.md) |
| P6 | A fila agrupa por cliente/processo? | **Não.** Documento solto, ordem de chegada. Agrupar seria inventar entidade que o enunciado não dá. | [ADR-009](../adr/009-concorrencia-na-fila.md) |

## Critério de sucesso da entrega

Não é "a tela funciona". É: **um engenheiro que nunca viu este repositório
consegue, lendo a spec e as ADRs, prever o que o código faz — e discordar de
decisões específicas, apontando qual.** Decisão que não pode ser contestada não
foi registrada direito.
