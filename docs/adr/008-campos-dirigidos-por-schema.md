# ADR-008 — Campos renderizados por schema vindo da API

**Status:** aceita · **Data:** 31/08/2026 · **A decisão mais importante deste projeto**

## Contexto

Fato (f): *"O modelo do fornecedor será trocado de versão em algum momento, e os
prompts vão mudar mais de uma vez ao longo do primeiro ano."*

Traduzindo para o front-end: **os campos que voltam da extração vão mudar, e vão
mudar com frequência.** Novos tipos de documento, campos que aparecem, campos que
somem, rótulos que se ajustam.

Este é o fato que responde diretamente ao critério de 30%: *"o que acontece
quando uma peça precisa ser trocada"*.

## Decisão

**O front-end não conhece nenhum tipo de documento.** Nenhum — nem em constante,
nem em `enum`, nem em `switch`, nem em arquivo de tradução.

- `GET /tipos-documento` devolve o schema de cada tipo: chave, rótulo, tipo de
  dado, máscara, obrigatoriedade, ordem e sensibilidade.
- A tela de conferência percorre o schema e resolve cada campo por um **registry**
  `TipoDeDado → Componente`.
- Existem **seis tipos de dado** (`TEXTO`, `DATA`, `CPF`, `CNPJ`, `NUMERO`,
  `SELECAO`) contra **N tipos de documento**. Os tipos de dado mudam devagar; os
  de documento, sempre.

**Adicionar "Certidão de Nascimento" ao produto custa zero linhas de front-end.**

Isso é reforçado por duas travas: a regra 2 do `CLAUDE.md`, e o teste T-08, que
varre `src/` procurando nome de tipo de documento e falha o build se encontrar.

## Alternativas descartadas

**Um formulário por tipo de documento.** O caminho óbvio, e o mais confortável de
escrever: componentes explícitos, campos nomeados, tipagem direta, autocompletar
do editor funcionando.

Descartada porque transforma **toda mudança de prompt em ciclo de
desenvolvimento**: alterar código, revisar, buildar, publicar — para um sistema
cuja premissa declarada é mudar de prompt várias vezes por ano. O custo não é um
bug; é o produto ficar refém do calendário de deploy do front-end.

*É a decisão que, tomada errada, mais barato pareceria no dia 1 e mais cara
custaria no mês 3.*

**Formulário genérico sem schema** (renderizar tudo como texto). Tolera campo
novo, mas perde máscara, validação de formato, ordem e sensibilidade. Uma data
vira texto livre e um CPF perde a máscara — a conferência fica mais lenta, que é
exatamente o custo que o produto quer eliminar.

**Schema no front-end, atualizado junto com o prompt.** Mantém a tipagem forte e
parece disciplinado. Descartada porque **acopla dois calendários de release** que
não têm motivo para ser o mesmo: quem ajusta prompt não deveria precisar de
deploy de front-end.

## Consequências

**Boas:** tipo de documento novo é zero mudança; rótulo corrigido é zero
mudança; o front-end fica menor, porque há um caminho de renderização em vez de N.

**Ruins:** perdemos tipagem estática dos campos — `campos` é uma lista genérica,
e o editor não autocompleta `documento.nome`. **É uma troca consciente de
conveniência de desenvolvimento por adaptabilidade de produto.** Além disso, um
schema malformado vindo da API quebra a tela; mitigado com validação defensiva e
estado de erro por campo.

## Como saberemos que erramos

Se aparecerem muitos tipos de dado genuinamente novos em pouco tempo (assinatura
em imagem, tabela de verbas, foto com região destacada), o registry cresce e a
economia diminui. Sinal concreto: mais de três tipos de dado novos no primeiro
semestre.
