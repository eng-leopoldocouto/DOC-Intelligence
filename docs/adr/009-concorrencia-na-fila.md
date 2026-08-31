# ADR-009 — Claim com TTL **e** trava otimista

**Status:** aceita · **Data:** 31/08/2026

## Contexto

Fato (g): *"Duas pessoas do atendimento podem abrir a fila de conferência ao
mesmo tempo."*

O cenário concreto: Ana e Bruno abrem o mesmo documento às 9h03. Ana corrige a
filiação, Bruno corrige o número do RG. Bruno salva por último. **A correção da
Ana desaparece sem aviso** — e ninguém percebe, porque o documento fica com
aparência de conferido e segue para a planilha como pronto. O fato (d) piora:
é dado pessoal indo errado para um processo.

São **dois problemas distintos**, e um só mecanismo não resolve os dois:

- **desperdício** — duas pessoas conferindo o mesmo documento
- **perda** — a gravação de uma apaga a da outra

## Decisão

**Os dois mecanismos, um para cada problema.**

**1. Claim com lease — contra o desperdício.**
`POST /{id}/conferencia/claim` reserva por TTL de 5 minutos, renovado enquanto a
tela estiver ativa. A fila mostra "em conferência por Ana Souza" e não oferece o
item a Bruno. Liberação no `beforeunload` e por expiração.

O TTL é o que evita o pior modo de falha do locking: *a pessoa que abriu o
documento, foi almoçar, e travou o item para sempre.*

**2. Trava otimista — contra a perda.**
`PATCH /{id}/campos` exige `If-Match: <versao>`. Versão mudou, responde **409**,
com o documento atual no corpo. A interface mostra o que mudou, **quem** mudou, e
deixa a pessoa decidir. **Nunca sobrescrevemos em silêncio.**

## Alternativas descartadas

**Último a escrever vence.** O padrão implícito de quem não trata concorrência.
Descartada porque produz **perda silenciosa de dado pessoal já conferido** — o
pior tipo de defeito deste sistema, porque não deixa rastro e só aparece semanas
depois, dentro de um processo.

**Só a trava otimista, sem claim.** Correta e suficiente contra a perda, e mais
simples. Descartada porque não evita o **desperdício**: as duas pessoas fazem o
trabalho inteiro e uma delas descobre no fim que foi em vão. Num dia de 800
documentos com duas conferentes, desperdício de trabalho humano é o recurso mais
caro que existe aqui.

**Só o claim, sem trava otimista.** Tentadora, porque parece resolver tudo.
Descartada porque **o claim é uma aposta**: leases expiram, o TTL é um chute, a
aba fica aberta, a rede cai na hora da renovação. Sem a trava otimista, toda
falha do claim vira perda silenciosa. A trava é a rede de segurança que não
depende de aposta nenhuma.

**Locking pessimista sem TTL.** Garante exclusão, e trava o documento para sempre
quando alguém esquece a aba aberta. Exigiria administrador para destravar.

## Consequências

**Boas:** desperdício e perda tratados por mecanismos independentes; nenhuma
sobrescrita silenciosa; o TTL faz o sistema se curar sozinho.

**Ruins:** duas coisas a implementar e explicar em vez de uma; o TTL de 5 minutos
é arbitrário — curto demais e a pessoa perde a reserva no meio da conferência,
longo demais e o item fica preso. Precisa de calibração com uso real.

## Como saberemos que erramos

Reclamação de "perdi minha reserva enquanto conferia" indica TTL curto. Itens
frequentemente presos aguardando expiração indicam TTL longo. Os dois sinais são
observáveis em uso, e a correção é um número.
