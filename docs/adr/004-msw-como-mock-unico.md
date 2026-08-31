# ADR-004 — MSW como mock único: navegador, testes e servidor HTTP

**Status:** aceita · **Data:** 31/08/2026

## Contexto

O enunciado pede que o contrato seja *"servido por mock"*. Há três consumidores
distintos: a aplicação no navegador durante o desenvolvimento, os testes
automatizados, e quem quiser bater na API por fora (`curl`, ou a futura Trilha A
comparando comportamento).

O modo tradicional de resolver isso é ter **dois** dublês — um servidor de mock e
um dublê de teste. É também o modo tradicional de eles divergirem.

## Decisão

**Um único conjunto de handlers MSW**, em `mocks/handlers.ts`, servindo os três:

| Consumidor | Mecanismo |
|---|---|
| Navegador (dev) | Service worker do MSW |
| Testes (Vitest + jsdom) | `setupServer` |
| HTTP real (`npm run mock`) | `@mswjs/http-middleware` |

O mock **simula o ambiente hostil**: latência sorteada de 5 a 40 s, falha
injetável com `FALHOU` e `EXPIRADO` distintos, confiança variável, duplicata real
por `contentHash`, e uma segunda sessão capaz de roubar o claim e provocar 409 de
verdade.

## Alternativas descartadas

**Express ou json-server standalone.** Mock "de verdade" num processo separado, e
a leitura mais literal de "servir por mock". Descartada porque os testes
precisariam de **outro** dublê — dois lugares para manter em sincronia, e a
divergência entre eles é justamente o defeito que produz "passa no teste, quebra
na tela".

**Apenas MSW no navegador.** Mais barato, mas o contrato não fica servido em
porta HTTP. `@mswjs/http-middleware` custa uma dependência pequena e elimina a
objeção.

**Prism (mock gerado do OpenAPI).** Tentadora: o mock sai de graça do YAML.
Descartada porque Prism devolve **exemplos estáticos**. Não sabe simular latência
variável, não sabe manter estado entre requisições, não sabe fazer o claim de uma
sessão conflitar com o da outra. O comportamento dinâmico não é enfeite — é onde
os fatos (a), (c) e (g) se manifestam.

## Consequências

**Boas:** um contrato, uma implementação, três consumidores; os estados de erro
são alcançáveis na demonstração, em vez de existirem só no papel; trocar para a
API real é uma variável de ambiente.

**Ruins:** os handlers acumulam lógica de estado e viram, de fato, uma
implementação de referência em miniatura — precisam de disciplina para não virar
um back-end mal feito. Fronteira adotada: **o mock simula, não implementa regra
de negócio.**

## Como saberemos que erramos

Se `mocks/handlers.ts` passar de umas 400 linhas ou começar a conter regra que
deveria ser da Trilha A, o mock extrapolou o papel.
