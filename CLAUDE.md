# CLAUDE.md — instruções do agente para o DOC Intelligence

Este arquivo é a instrução de trabalho do agente de IA neste repositório. Ele é
parte da entrega (item II.4 do enunciado) e foi escrito **antes** do código.

---

## 1. O que é este projeto

Serviço de inteligência documental para o escritório LAMARCK. Documentos chegam
por WhatsApp, e-mail e balcão; um modelo multimodal de terceiro classifica,
extrai campos e propõe um nome padronizado; quando a máquina não tem confiança,
o documento vai para conferência humana.

**Estamos na Trilha B — front-end.** Construímos a interface do atendimento e
**definimos o contrato da API**, que ainda não existe e é servido por mock.

### Fatia vertical implementada

`envio em lote → acompanhamento do processamento → fila de conferência → correção de um campo → gravação`

Tudo fora dessa linha é **projetado na spec e declarado como não feito**. Ver
`docs/spec/07-nao-feito.md`.

---

## 2. Regras invioláveis

Estas regras existem porque cada uma responde a um fato do ambiente descrito no
enunciado. Quebrá-las quebra o projeto, não só o estilo.

1. **O contrato vem primeiro.** `docs/spec/openapi.yaml` é a fonte de verdade.
   Tipos TypeScript são **gerados** a partir dele, nunca escritos à mão. Se o
   código precisa de um campo que não está no contrato, **o contrato muda
   primeiro**.

2. **Nenhum tipo de documento é hardcoded no front-end.** Rótulos, campos,
   máscaras, ordem e obrigatoriedade vêm de `GET /tipos-documento`. Se você
   escreveu a palavra `"RG"` ou `"contracheque"` num `if`, você errou.
   *(fato f: o modelo e os prompts vão mudar)*

3. **Nenhuma chamada de rede fora de `src/shared/api/`.** Nada de `fetch` solto
   em componente. Um único ponto conhece transporte, cabeçalhos, retry e
   normalização de erro.

4. **Nenhum dado pessoal em URL, log, `localStorage`, cache de service worker ou
   telemetria.** Só ID opaco em rota. Imagem de documento é efêmera: URL
   assinada e curta. *(fato d: dado pessoal sensível — LGPD)*

5. **Nenhum retry automático de processamento.** Cada chamada ao modelo custa
   dinheiro. Reprocessar é ação explícita, confirmada pela pessoa.
   *(fato a: cobrado por documento)*

6. **Nunca identificar documento por nome de arquivo.** O nome que chega é lixo
   (`WhatsApp Image 2026-08-11 at 09.12.33.jpeg`). Identidade é o hash do
   conteúdo. *(fatos b e c)*

7. **Nenhum dado real.** Todo documento de teste é fictício, gerado por script,
   com marca d'água. Nomes, CPFs e endereços são inequivocamente falsos.

8. **Não inventar requisito.** O enunciado é a fronteira. Requisito derivado de
   um fato do ambiente é legítimo, mas precisa estar **escrito e justificado**
   na spec. Requisito inventado por gosto é escopo fora do objetivo.

---

## 3. Convenções de código

- **Domínio em português, infraestrutura em inglês.** `Documento`,
  `CampoExtraido`, `filaDeConferencia` — mas `HttpClient`, `useQuery`,
  `queryKey`. O domínio é jurídico brasileiro; traduzi-lo perde precisão.
- TypeScript em modo estrito. Sem `any`. Sem `@ts-ignore` sem comentário
  explicando o porquê.
- Um arquivo faz uma coisa. Arquivo grande é sinal de fronteira errada.
- `entities/` é puro: sem React, sem `fetch`, sem `window`. Testável sem DOM.
- Componente não sabe de onde vem o dado. Quem sabe é o hook.

## 4. Estrutura e fronteiras

```
src/
  app/        composição: router, providers, error boundary
  pages/      telas de rota
  features/   fatias de funcionalidade (upload, processing, review)
  entities/   modelo de domínio puro + mapeadores
  shared/
    api/      cliente HTTP + tipos gerados do OpenAPI  ← única costura de rede
    ui/       primitivas visuais
    lib/      hash, exif, compressão, máscara, formatação
  mocks/      handlers MSW (browser + node + testes)   ← única costura de mock
```

Regra de dependência: `app → pages → features → entities → shared`.
**Nunca ao contrário.** `entities` não importa de `features`.

## 5. Definição de pronto

Uma tarefa está pronta quando:

- [ ] O comportamento tem critério de aceite na spec (Given/When/Then)
- [ ] Existe teste que falharia se o comportamento sumisse
- [ ] `npm run typecheck` passa (não há linter neste projeto — ver D-08)
- [ ] Nenhuma regra da seção 2 foi quebrada
- [ ] Se divergiu da spec, a divergência está em `docs/spec/08-divergencias.md`

**Não afirme que algo funciona sem ter rodado.** Cole a saída do comando.

## 6. Obrigações de registro (item II.4 do enunciado)

Estas não são opcionais e não podem ser reconstruídas no fim:

- **Todo prompt do candidato** vai íntegro para `docs/ia/prompts/`, numerado e
  em ordem, **sem correção de digitação e sem reescrita**.
- **Toda verificação do candidato** sobre o que o agente devolveu vai para
  `docs/ia/registro-de-verificacao.md`.
- **Todo erro do agente** percebido pelo candidato vai para o mesmo registro,
  com o que foi feito a respeito.
- **Todo início e fim de fase** vai para `docs/ia/registro-de-tempo.md` com
  relógio real.

## 7. O que o agente NÃO decide sozinho

- Escolha entre alternativas de arquitetura → apresentar 2–3 opções com
  trade-offs e **recomendação**; a decisão é do candidato e vira ADR.
- Qualquer ação externa: `git push`, criação de repositório, envio de e-mail.
- Conteúdo em primeira pessoa do candidato (carta de fechamento, parágrafo
  sobre erros do agente, parágrafo sobre escolha de testes).
