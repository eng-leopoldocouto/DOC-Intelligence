# 06 — Plano de testes

> O enunciado pede *"um parágrafo dizendo o que você escolheu testar, e por
> quê"*, e diz explicitamente que **não** espera alta cobertura. Isso desloca a
> pergunta de "quanto testar" para **"o que vale testar"**.

---

## O critério de escolha

Testamos o que **quebraria em silêncio**.

Um botão que some é descoberto em cinco minutos de uso. Uma correção de campo
sobrescrita por outra pessoa não é descoberta nunca — vira um dado errado numa
planilha, e reaparece semanas depois dentro de um processo. Esses são os testes
que valem.

Disso saem três critérios concretos. Testamos o que:

1. **Falha em silêncio** — perda de dado, sobrescrita, duplicata processada
2. **Custa dinheiro se quebrar** — qualquer coisa que dispare o modelo (fato a)
3. **É promessa de arquitetura** — se quebrar, o desenho todo perde sentido

E **não** testamos: aparência, wiring trivial de componente, bibliotecas de
terceiros, nem detalhe de implementação. Teste que conhece o interior do
componente quebra em refatoração e não pega defeito — custa manutenção e não
paga nada.

---

## O que testamos

### T-01 — Ninguém sobrescreve o trabalho de ninguém *(fato g)*

Ana carrega o documento na versão 3. Bruno salva, e a versão vira 4. Ana salva
com `If-Match: 3`. **Deve** receber 409, e a edição da Ana **não** pode ser
descartada nem aplicada por cima.

> O defeito mais caro do sistema inteiro, e o mais silencioso.

### T-02 — Duplicata não vira chamada paga *(fatos a e c)*

O mesmo arquivo enviado duas vezes produz uma única requisição de processamento.
O teste conta as chamadas ao handler.

> Testar o efeito colateral que **não** aconteceu é a única forma de garantir
> que ele não acontece.

### T-03 — O front-end sobrevive a um tipo de documento que nunca viu *(fato f)*

O mock passa a devolver um tipo inventado, com campos inéditos. A tela de
conferência renderiza tudo corretamente **sem nenhuma mudança de código**.

> Este é o teste da promessa central de arquitetura. Se ele passa, o fato (f)
> está tratado de verdade. Se falha, a spec inteira é conversa fiada.

### T-04 — Nada chega a PRONTO sem passar pelo portão de confiança

Documento com confiança abaixo do limiar vai para `AGUARDANDO_CONFERENCIA`, e
não para `PRONTO`. Invariante 1 do domínio, comportamento 4 do produto.

### T-05 — Falha nunca reprocessa sozinha *(fato a)*

Documento em `FALHOU` não dispara reprocessamento por conta própria; só após
confirmação explícita. Verificado por contagem de chamadas.

### T-06 — Um arquivo inválido não derruba o lote *(fatos b e e)*

Cinco arquivos, um inválido: quatro sobem, um é recusado localmente, nenhuma
requisição desperdiçada.

### T-07 — Domínio puro *(unitários)*

Transições válidas e inválidas da máquina de estados, comparação com o limiar,
composição do nome padronizado, mascaramento de campo sensível. Rápidos,
estáveis, sem DOM.

### T-08 — Nenhum tipo de documento hardcoded *(teste de arquitetura)*

Varre `src/` procurando nomes de tipo de documento em constante, enum ou
condicional. Falha o build se encontrar.

> Regra de arquitetura que não é verificada automaticamente é sugestão. Esta é
> a única forma de a regra 2 do `CLAUDE.md` sobreviver ao terceiro
> desenvolvedor que entrar no projeto.

---

## O que deliberadamente NÃO testamos

| Não testado | Por quê |
|---|---|
| Aparência e layout | Quebra visível na hora; teste de snapshot vira ruído |
| Virtualização com 800 itens | Verificado à mão com fixture; automatizar em jsdom mede pouco |
| Redução de imagem e EXIF | Depende de `canvas` real; jsdom não decodifica imagem de verdade |
| Cobertura percentual | O enunciado dispensa. Perseguir número gera teste sem valor |
| Acessibilidade completa | Só o básico via consultas por papel e rótulo (ver `07-nao-feito.md`) |

---

## Ferramental

**Vitest** (mesmo motor do Vite, zero configuração dupla) + **Testing Library**
(consultas por papel e texto, que é como a pessoa usa) + **MSW** — o mesmo mock
da aplicação, o que elimina a divergência entre dublê de teste e dublê de demo.

```bash
npm test              # uma passada
npm run test:watch
```
