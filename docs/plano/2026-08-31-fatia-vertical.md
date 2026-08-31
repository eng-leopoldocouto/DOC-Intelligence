# Plano de implementação — fatia vertical do DOC Intelligence

> **Para executores agênticos:** este plano é executado tarefa a tarefa. Os
> passos usam caixas de seleção (`- [ ]`) para acompanhamento.

**Objetivo:** implementar o caminho `envio em lote → acompanhamento →
conferência → correção de campo → gravação` sobre dados falsos, provando que o
contrato definido em `docs/spec/openapi.yaml` fecha de ponta a ponta.

**Arquitetura:** React 19 + Vite + TypeScript estrito, em camadas
`app → pages → features → entities → shared`, com seis costuras nomeadas em
[`04-arquitetura.md`](../spec/04-arquitetura.md). Todo estado de servidor vive
no TanStack Query. O contrato é servido por um único conjunto de handlers MSW
que atende navegador, testes e porta HTTP.

**Pilha:** React 19 · Vite 6 · TypeScript 5.7 estrito · TanStack Query 5 ·
MSW 2 + `@mswjs/http-middleware` · Vitest + Testing Library · `openapi-typescript`
· Python 3.13 (geração dos documentos fictícios).

## Nota sobre o formato deste plano

A skill `writing-plans` pede código completo em cada passo, porque assume um
executor sem contexto do projeto. Aqui o executor tem a spec inteira em
contexto e o prazo é inferior a um dia. **Adaptação declarada:** código real
onde ele é não óbvio ou onde um erro seria silencioso (backoff, deduplicação,
registry de campos, trava otimista, handlers do mock); assinaturas exatas e
descrição precisa onde é ligação previsível de React. Onde houve corte, ele
está aqui em vez de escondido.

---

## Restrições globais

Valem para **todas** as tarefas. Vêm do `CLAUDE.md` e da spec.

| # | Restrição | Origem |
|---|---|---|
| G1 | Nenhum tipo de documento em constante, `enum`, `switch` ou condicional | fato (f), ADR-008 |
| G2 | Nenhum `fetch` fora de `src/shared/api/` | ADR-002, RNF-01 |
| G3 | Tipos de resposta **gerados** do OpenAPI, nunca escritos à mão | ADR-003 |
| G4 | Nenhum dado pessoal em URL, `localStorage`, IndexedDB, telemetria ou log | fato (d), ADR-010 |
| G5 | Nenhum retry automático de operação que dispare o modelo | fato (a), ADR-005 |
| G6 | `entities/` sem React, sem `fetch`, sem `window` | ADR-002 |
| G7 | Domínio em português, infraestrutura em inglês | `CLAUDE.md` §3 |
| G8 | TypeScript estrito, sem `any`, sem `@ts-ignore` sem justificativa | `CLAUDE.md` §3 |
| G9 | Nenhum dado real; documentos de teste fictícios e marcados | enunciado |
| G10 | Divergência da spec vai para `docs/spec/08-divergencias.md` **no ato** | enunciado II.2 |

**Commit ao final de cada tarefa**, com trailer `Co-Authored-By: Claude Opus 5`.

---

## Estrutura de arquivos

```
scripts/gerar-documentos-ficticios.py     gera fixtures com marca d'água
fixtures/documentos-ficticios/            RG, comprovante, contracheque, PDF

src/
  main.tsx                                ponto de entrada; inicia MSW em dev
  app/
    App.tsx                               casca + navegação
    router.tsx                            rotas
    providers.tsx                         QueryClient + boundary de erro
  shared/
    api/
      types.gen.ts        GERADO do openapi.yaml — nunca editar à mão
      http.ts             ÚNICA costura de rede: fetch, cabeçalhos, If-Match,
                          retry só em GET, normalização RFC 9457, sanitização
      client.ts           uma função por endpoint, tipada pelos tipos gerados
      queryKeys.ts        chaves de cache centralizadas
      identidade.ts       lê identidade do host (ADR-011)
    lib/
      hash.ts             SHA-256 via crypto.subtle
      imagem.ts           redução + orientação EXIF
      mascara.ts          CPF/CNPJ: mascarar e formatar
      formato.ts          data, tamanho de arquivo, tempo decorrido
    ui/                   Botao, Campo, Badge, Dialogo, EstadoVazio
  entities/
    documento/
      tipos.ts            reexporta os tipos gerados com nomes de domínio
      estado.ts           transições válidas, invariantes, portão de confiança
      nome.ts             composição do nome padronizado a partir do padrão
    tipo-documento/tipos.ts
  features/
    upload/
      validacao.ts        whitelist, teto, mensagens acionáveis
      deduplicacao.ts     dedup dentro do lote
      filaDeEnvio.ts      concorrência máxima 3
      useEnvio.ts
      AreaDeEnvio.tsx · ItemDeEnvio.tsx
    processing/
      backoff.ts          2s / 5s / 15s por tempo decorrido
      usePollingLote.ts   1 requisição para N documentos, pausa com aba oculta
      ListaDeAcompanhamento.tsx
    review/
      useFilaDeConferencia.ts   cursor + virtualização
      useClaim.ts               lease, renovação, liberação no beforeunload
      useGravarCampos.ts        If-Match, 409
      fields/
        registry.ts             TipoDeDado -> Componente  (o coração do fato f)
        CampoTexto · CampoData · CampoCpf · CampoCnpj · CampoNumero · CampoSelecao
      VisualizadorDocumento.tsx   zoom, rotação, EXIF
      PainelDeCampos.tsx          percorre o schema, resolve pelo registry
      ConflitoDialog.tsx · RejeitarDialog.tsx
  pages/
    PaginaEnvio · PaginaAcompanhamento · PaginaFilaConferencia · PaginaConferencia
  mocks/
    dados.ts        estado em memória, sorteio de confiança e latência
    handlers.ts     implementa o contrato  (limite auto-imposto: 400 linhas)
    browser.ts · node.ts · servidor.ts

tests/
  entities/            domínio puro (T-07)
  features/            fluxos (T-01 a T-06)
  arquitetura/         T-08: varredura por tipo hardcoded

.claude/agents/auditor-de-entrega.md
```

**Regra de dependência verificada por lint:** `entities/` não importa de
`features/`; nada importa `fetch` fora de `shared/api/`.

---

## Tarefa 1 — Scaffold, tooling e geração de tipos

**Arquivos:** criar `package.json`, `vite.config.ts`, `tsconfig.json`,
`.eslintrc.cjs`, `.env.example`, `index.html`, `src/main.tsx`, `src/app/App.tsx`

**Produz:** `npm run dev` · `npm test` · `npm run gen:api` · `src/shared/api/types.gen.ts`

- [ ] **1.1** Criar o projeto e instalar dependências

```bash
npm create vite@latest . -- --template react-ts
npm i @tanstack/react-query react-router-dom
npm i -D msw @mswjs/http-middleware openapi-typescript vitest \
        @testing-library/react @testing-library/user-event jsdom \
        @vitest/coverage-v8 tsx
npx msw init public/ --save
```

- [ ] **1.2** Scripts em `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "gen:api": "openapi-typescript docs/spec/openapi.yaml -o src/shared/api/types.gen.ts",
    "mock": "tsx src/mocks/servidor.ts"
  }
}
```

- [ ] **1.3** `tsconfig.json` estrito, com alias `@/` para `src/`

`"strict": true`, `"noUncheckedIndexedAccess": true`, `"noUnusedLocals": true`,
`"paths": { "@/*": ["./src/*"] }`. Espelhar o alias em `vite.config.ts`
(`resolve.alias`) e em `test.alias`.

- [ ] **1.4** `vite.config.ts` com Vitest

```ts
test: { environment: 'jsdom', globals: true, setupFiles: ['./tests/setup.ts'] }
```

- [ ] **1.5** Gerar os tipos e conferir

```bash
npm run gen:api
```
Esperado: `src/shared/api/types.gen.ts` criado, contendo `Documento`,
`CampoExtraido`, `TipoDocumento`, `EstadoDocumento`.

- [ ] **1.6** `npm run typecheck` — esperado: sem erros

- [ ] **1.7** Commit

```bash
git add -A && git commit -m "feat: scaffold Vite/React/TS e geração de tipos do OpenAPI"
```

---

## Tarefa 2 — Domínio puro (`entities/`)

**Arquivos:** criar `src/entities/documento/{tipos,estado,nome}.ts`,
`src/entities/tipo-documento/tipos.ts`, `tests/entities/*.test.ts`

**Consome:** `types.gen.ts` (Tarefa 1)
**Produz:**
- `type Documento`, `type CampoExtraido`, `type EstadoDocumento` (reexportados)
- `transicaoValida(de: EstadoDocumento, para: EstadoDocumento): boolean`
- `precisaConferencia(confianca: number | null, limiar: number): boolean`
- `campoAbaixoDoLimiar(campo: CampoExtraido, limiar: number): boolean`
- `comporNomePadronizado(padrao: string, campos: CampoExtraido[], tipoRotulo: string): string`

Sem React, sem `fetch`, sem `window` (G6).

- [ ] **2.1 Escrever os testes que falham** — `tests/entities/estado.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { transicaoValida, precisaConferencia } from '@/entities/documento/estado'

describe('máquina de estados', () => {
  it('permite RECEBIDO -> EM_PROCESSAMENTO', () => {
    expect(transicaoValida('RECEBIDO', 'EM_PROCESSAMENTO')).toBe(true)
  })

  it('NÃO permite pular a conferência: AGUARDANDO_CONFERENCIA -> PRONTO exige EM_CONFERENCIA', () => {
    expect(transicaoValida('AGUARDANDO_CONFERENCIA', 'PRONTO')).toBe(false)
    expect(transicaoValida('AGUARDANDO_CONFERENCIA', 'EM_CONFERENCIA')).toBe(true)
    expect(transicaoValida('EM_CONFERENCIA', 'PRONTO')).toBe(true)
  })

  it('REJEITADO é terminal', () => {
    expect(transicaoValida('REJEITADO', 'EM_PROCESSAMENTO')).toBe(false)
    expect(transicaoValida('REJEITADO', 'PRONTO')).toBe(false)
  })

  it('falha só volta a processar por ação explícita', () => {
    expect(transicaoValida('FALHOU', 'EM_PROCESSAMENTO')).toBe(true)
    expect(transicaoValida('EXPIRADO', 'EM_PROCESSAMENTO')).toBe(true)
  })
})

describe('portão de confiança (invariante 1)', () => {
  it('abaixo do limiar exige conferência', () => {
    expect(precisaConferencia(0.62, 0.85)).toBe(true)
  })
  it('no limiar ou acima, não exige', () => {
    expect(precisaConferencia(0.85, 0.85)).toBe(false)
    expect(precisaConferencia(0.99, 0.85)).toBe(false)
  })
  it('confiança ausente SEMPRE exige conferência', () => {
    expect(precisaConferencia(null, 0.85)).toBe(true)
  })
})
```

> O último caso é o que importa: ausência de confiança **não** pode ser
> interpretada como confiança alta. É o modo de falha que deixaria documento
> não processado passar por pronto.

- [ ] **2.2 Escrever os testes de composição do nome** — `tests/entities/nome.test.ts`

```ts
import { comporNomePadronizado } from '@/entities/documento/nome'

const campos = [
  { chave: 'nome',   valor: 'Fulano de Tal da Silva', confianca: 0.9, origem: 'MODELO' as const },
  { chave: 'numero', valor: '12.345.678-9',           confianca: 0.7, origem: 'MODELO' as const },
]

it('substitui as chaves do padrão e normaliza', () => {
  expect(comporNomePadronizado('{tipo}_{nome}_{numero}', campos, 'RG'))
    .toBe('RG_FULANO_DE_TAL_DA_SILVA_12345678-9')
})

it('campo ausente vira marcador visível, não string vazia', () => {
  expect(comporNomePadronizado('{tipo}_{nome}_{orgao}', campos, 'RG'))
    .toBe('RG_FULANO_DE_TAL_DA_SILVA_SEM-ORGAO')
})
```

> Marcador visível em vez de string vazia: `RG_FULANO__.jpg` esconde o problema;
> `RG_FULANO_SEM-ORGAO.jpg` mostra a lacuna para quem confere.

- [ ] **2.3** Rodar e confirmar que falham

Run: `npm test -- tests/entities` · Esperado: FAIL, "Cannot find module"

- [ ] **2.4** Implementar `estado.ts` com um mapa de transições

```ts
const TRANSICOES: Record<EstadoDocumento, EstadoDocumento[]> = {
  RECEBIDO:               ['EM_PROCESSAMENTO'],
  EM_PROCESSAMENTO:       ['PRONTO', 'AGUARDANDO_CONFERENCIA', 'FALHOU', 'EXPIRADO'],
  AGUARDANDO_CONFERENCIA: ['EM_CONFERENCIA'],
  EM_CONFERENCIA:         ['PRONTO', 'REJEITADO', 'AGUARDANDO_CONFERENCIA'],
  FALHOU:                 ['EM_PROCESSAMENTO', 'REJEITADO'],
  EXPIRADO:               ['EM_PROCESSAMENTO', 'REJEITADO'],
  PRONTO:                 [],
  REJEITADO:              [],
}
export const transicaoValida = (de: EstadoDocumento, para: EstadoDocumento) =>
  TRANSICOES[de].includes(para)

export const precisaConferencia = (confianca: number | null, limiar: number) =>
  confianca === null || confianca < limiar
```

- [ ] **2.5** Implementar `nome.ts` — normalização sem acento, maiúsculas,
      espaços viram `_`, chave ausente vira `SEM-<CHAVE>`

- [ ] **2.6** Rodar: `npm test -- tests/entities` — esperado: PASS

- [ ] **2.7** Commit: `test+feat: domínio puro com máquina de estados e portão de confiança`

---

## Tarefa 3 — `shared/lib`: hash, máscara, formato

**Arquivos:** criar `src/shared/lib/{hash,mascara,formato,imagem}.ts`,
`tests/shared/{hash,mascara}.test.ts`

**Produz:**
- `sha256(arquivo: File): Promise<string>` — 64 hex minúsculos
- `mascararDocumento(valor: string, tipo: 'CPF' | 'CNPJ'): string`
- `formatarTempoDecorrido(desde: string, agora?: Date): string`
- `reduzirImagem(arquivo: File, ladoMaximo: number): Promise<File>`

- [ ] **3.1 Teste que falha** — `tests/shared/hash.test.ts`

```ts
it('produz SHA-256 estável e em minúsculas', async () => {
  const a = new File(['conteudo do documento'], 'scan0001.pdf')
  const b = new File(['conteudo do documento'], 'WhatsApp Image 2026-08-11.jpeg')
  expect(await sha256(a)).toMatch(/^[a-f0-9]{64}$/)
  expect(await sha256(a)).toBe(await sha256(b))   // nome não influencia — fato (b)
})

it('conteúdos diferentes produzem hashes diferentes', async () => {
  const a = new File(['documento A'], 'x.pdf')
  const b = new File(['documento B'], 'x.pdf')
  expect(await sha256(a)).not.toBe(await sha256(b))
})
```

> O primeiro teste é a afirmação central do fato (b): **o nome do arquivo não
> participa da identidade.** Dois nomes absurdamente diferentes, mesmo hash.

- [ ] **3.2 Teste de mascaramento** — `tests/shared/mascara.test.ts`

```ts
it('mascara CPF preservando só o suficiente para reconhecer', () => {
  expect(mascararDocumento('12345678901', 'CPF')).toBe('***.456.789-**')
})
it('valor incompleto não vaza o que sobrou', () => {
  expect(mascararDocumento('123', 'CPF')).toBe('***.***.***-**')
})
```

> O segundo caso importa: mascarar por posição num valor curto pode revelar
> tudo. Valor fora do formato vira máscara total.

- [ ] **3.3** Rodar: FAIL esperado
- [ ] **3.4** Implementar `sha256` com `crypto.subtle.digest('SHA-256', await arquivo.arrayBuffer())`
- [ ] **3.5** Implementar `mascararDocumento`, `formatarTempoDecorrido`, `reduzirImagem`

`reduzirImagem` usa `createImageBitmap` com `{ imageOrientation: 'from-image' }`
(respeita EXIF) e `OffscreenCanvas`. **Não testado automaticamente** — jsdom não
decodifica imagem; verificado à mão, conforme `06-plano-de-testes.md`.

- [ ] **3.6** Rodar: PASS
- [ ] **3.7** Commit: `test+feat: hash de conteúdo, mascaramento e formatação`

---

## Tarefa 4 — `shared/api`: a única costura de rede

**Arquivos:** criar `src/shared/api/{http,client,queryKeys,identidade}.ts`

**Consome:** `types.gen.ts`
**Produz:**
- `http<T>(caminho, opcoes): Promise<T>` — lança `ErroDeApi`
- `class ErroDeApi { status: number; problema: Problema; corpo?: unknown }`
- `client.enviarDocumento(arquivo, contentHash, nomeOrigem)`
- `client.statusEmLote(ids: string[])`
- `client.obterDocumento(id)` · `client.listarDocumentos(params)`
- `client.reservar(id)` · `client.liberar(id)`
- `client.gravarCampos(id, versao, campos, nomePadronizado)`
- `client.rejeitar(id, motivo, observacao)`
- `client.tiposDocumento()` · `client.urlDoArquivo(id)`
- `queryKeys` centralizadas

- [ ] **4.1** Implementar `http.ts` — o arquivo com mais consequência do projeto

```ts
const RETENTAVEIS = new Set([502, 503, 504])

export async function http<T>(caminho: string, opcoes: OpcoesHttp = {}): Promise<T> {
  const metodo = opcoes.metodo ?? 'GET'
  // G5: retry SÓ em GET idempotente. Nada que dispare o modelo é repetido
  // automaticamente — cada execução custa dinheiro (fato a).
  const tentativas = metodo === 'GET' ? 3 : 1

  for (let n = 1; n <= tentativas; n++) {
    try {
      const r = await fetch(BASE + caminho, {
        method: metodo,
        headers: cabecalhos(opcoes),
        body: opcoes.corpo,
      })
      if (!r.ok) throw await construirErro(r)
      return r.status === 204 ? (undefined as T) : await r.json()
    } catch (e) {
      const ultima = n === tentativas
      const retentavel = e instanceof ErroDeApi ? RETENTAVEIS.has(e.status) : true
      if (ultima || !retentavel) throw sanitizar(e)
      await esperar(2 ** n * 250)
    }
  }
  throw new Error('inalcancavel')
}
```

**`sanitizar` é obrigatório (G4):** remove corpo de requisição, valores de campo
e qualquer string com aparência de CPF ou RG antes de o erro sair daqui. Este é
o **último ponto por onde todo erro passa** — espalhada pelos componentes, a
sanitização seria esquecida no primeiro `catch` novo.

- [ ] **4.2** `identidade.ts` — lê a identidade injetada pelo host (ADR-011);
      em desenvolvimento, de `import.meta.env`. **Ausência é caminho válido**,
      não erro: degrada para anônimo.

- [ ] **4.3** `client.ts` — uma função por endpoint, tipada pelos tipos gerados.
      Nenhuma regra de negócio aqui: só tradução de chamada.

- [ ] **4.4** `queryKeys.ts`

```ts
export const queryKeys = {
  documentos: ['documentos'] as const,
  documento: (id: string) => ['documentos', id] as const,
  statusLote: (ids: string[]) => ['documentos', 'status', ...ids.slice().sort()] as const,
  fila: (cursor?: string) => ['documentos', 'fila', cursor ?? 'inicio'] as const,
  tipos: ['tipos-documento'] as const,
}
```

> `ids.slice().sort()` evita que a mesma consulta com ids em ordem diferente
> vire duas entradas de cache. Sem isso, o polling em lote duplica sozinho.

- [ ] **4.5** `npm run typecheck` — esperado: sem erros
- [ ] **4.6** Commit: `feat: costura de rede única, com retry só em GET e sanitização de PII`

---

## Tarefa 5 — Mock MSW: navegador, testes e servidor HTTP

**Arquivos:** criar `src/mocks/{dados,handlers,browser,node,servidor}.ts`,
`tests/mocks/contrato.test.ts`

**Produz:** `handlers` · `iniciarNoNavegador()` · `servidorDeTeste` ·
`npm run mock` em `http://localhost:8787`

**Limite auto-imposto:** `handlers.ts` até 400 linhas. Passar disso significa
que o mock virou back-end, e a fronteira da ADR-004 foi rompida.

- [ ] **5.1** `dados.ts` — estado em memória, simulando o ambiente **hostil**

```ts
export const config = {
  latenciaMin: 5_000, latenciaMax: 40_000,  // fato (a); testes usam 20/80 ms
  taxaFalha: 0.08,                           // 8% viram FALHOU ou EXPIRADO
  limiarConfianca: 0.85,
}
```

Catálogo com **quatro** tipos — RG, comprovante de residência, contracheque e
procuração — cada um com schema completo de campos. **Estes nomes vivem só aqui,
no mock; nunca no front-end** (G1).

- [ ] **5.2** `handlers.ts` — implementar os 9 endpoints do contrato

Comportamentos que o mock **precisa** ter, porque são onde os fatos aparecem:

| Comportamento | Fato |
|---|---|
| `contentHash` repetido devolve 200 com `duplicado: true`, sem processar | (c), (a) |
| Latência sorteada; o documento passa por `EM_PROCESSAMENTO` de verdade | (a) |
| `taxaFalha` produz `FALHOU` **e** `EXPIRADO`, distintos | (a) |
| Confiança sorteada; abaixo do limiar vai para `AGUARDANDO_CONFERENCIA` | invariante 1 |
| `claim` de outra sessão responde 409 | (g) |
| `PATCH` com `If-Match` desatualizado responde 409 **com o documento atual** | (g) |
| `versao` incrementa a cada gravação | invariante 3 |

> Um mock que só devolve o caminho feliz produz uma interface que só funciona no
> caminho feliz. Os estados de erro precisam ser **alcançáveis na demonstração**.

- [ ] **5.3 Teste do contrato** — `tests/mocks/contrato.test.ts`

```ts
it('mesmo contentHash não gera segundo processamento', async () => {
  const arquivo = new File(['doc'], 'scan0001.pdf')
  const hash = await sha256(arquivo)
  const a = await client.enviarDocumento(arquivo, hash, 'scan0001.pdf')
  const b = await client.enviarDocumento(arquivo, hash, 'WhatsApp Image 2026-08-11.jpeg')
  expect(a.duplicado).toBe(false)
  expect(b.duplicado).toBe(true)
  expect(b.documento.id).toBe(a.documento.id)
})
```

- [ ] **5.4** `servidor.ts` com `@mswjs/http-middleware`; verificar por fora

```bash
npm run mock &
curl -s http://localhost:8787/api/v1/tipos-documento
```
Esperado: JSON com `itens` e `limiarConfiancaPadrao`.

- [ ] **5.5** Rodar `npm test` — esperado: PASS
- [ ] **5.6** Commit: `feat: mock MSW único servindo navegador, testes e HTTP`

---

## Tarefa 6 — Documentos fictícios para teste

**Arquivos:** criar `scripts/gerar-documentos-ficticios.py`,
`fixtures/documentos-ficticios/*`, `fixtures/README.md`

**Produz:** seis arquivos que imitam o que o fato (b) descreve.

- [ ] **6.1** Escrever o gerador (Python 3.13 + Pillow, sem rede)

Regras **não negociáveis** (G9):

1. Marca d'água diagonal `DOCUMENTO FICTÍCIO — GERADO PARA TESTE` em todos.
2. Dados inequivocamente falsos: `FULANO DE TAL DA SILVA`, CPF `000.000.000-00`
   (inválido pelo dígito verificador), endereço `Rua Exemplo, 000`.
3. Nomes de arquivo que imitam a realidade do fato (b):

```
WhatsApp Image 2026-08-11 at 09.12.33.jpeg    RG frente, foto reta
IMG_20260811_091247.jpg                        RG frente, TORTA (rotação 7°) + ruído
scan0001.pdf                                   comprovante de residência
scan0002.pdf                                   contracheque
WhatsApp Image 2026-08-11 at 10.02.15.jpeg     procuração
copia de WhatsApp Image 2026-08-11 at 09.12.33.jpeg   duplicata BYTE A BYTE
```

> O último arquivo existe para exercitar o fato (c) na demonstração: é cópia
> exata, então o hash colide e a interface precisa dizer "já enviado".
> A versão *torta* existe para exercitar o visualizador com rotação.

- [ ] **6.2** Gerar e conferir

```bash
python scripts/gerar-documentos-ficticios.py
ls -la fixtures/documentos-ficticios/
sha256sum "fixtures/documentos-ficticios/WhatsApp Image 2026-08-11 at 09.12.33.jpeg" \
          "fixtures/documentos-ficticios/copia de WhatsApp Image 2026-08-11 at 09.12.33.jpeg"
```
Esperado: seis arquivos; os dois últimos hashes **idênticos**.

- [ ] **6.3** `fixtures/README.md` — declarar que são fictícios, como
      regenerá-los, e que nenhum dado real de pessoa foi usado.

- [ ] **6.4** Commit: `chore: gerador de documentos fictícios para teste`

---

## Tarefa 7 — Envio em lote (RF-01, RF-02, RF-03)

**Arquivos:** criar `src/features/upload/{validacao,deduplicacao,filaDeEnvio,useEnvio}.ts`,
`src/features/upload/{AreaDeEnvio,ItemDeEnvio}.tsx`,
`src/pages/PaginaEnvio.tsx`, `tests/features/envio.test.tsx`

**Consome:** `sha256` (T3), `client.enviarDocumento` (T4), mock (T5)
**Produz:**
- `validar(arquivo: File): { ok: true } | { ok: false; motivo: string; comoResolver: string }`
- `dedupNoLote(arquivos: File[]): Promise<{ unicos: File[]; descartados: File[] }>`
- `executarComConcorrencia<T>(tarefas: (() => Promise<T>)[], maximo: number): Promise<PromiseSettledResult<T>[]>`
- `useEnvio()` → `{ itens, enviar, estado }`

- [ ] **7.1 Testes que falham** — `tests/features/envio.test.tsx`

```ts
it('T-06: um arquivo inválido não derruba o lote', async () => {
  const chamadas = contarChamadas('POST', '/api/v1/documentos')
  const arquivos = [png(), png(), docx(), png(), png()]   // docx é inválido
  render(<PaginaEnvio />)
  await soltar(arquivos)

  expect(await screen.findAllByRole('listitem')).toHaveLength(5)
  expect(screen.getByText(/formato não suportado/i)).toBeInTheDocument()
  await waitFor(() => expect(chamadas()).toBe(4))   // o inválido não subiu
})

it('T-02: duplicata no mesmo lote não vira segunda requisição', async () => {
  const chamadas = contarChamadas('POST', '/api/v1/documentos')
  const a = new File(['mesmo conteudo'], 'scan0001.pdf', { type: 'application/pdf' })
  const b = new File(['mesmo conteudo'], 'copia.pdf',    { type: 'application/pdf' })
  render(<PaginaEnvio />)
  await soltar([a, b])

  await waitFor(() => expect(chamadas()).toBe(1))
  expect(screen.getByText(/duplicata descartada/i)).toBeInTheDocument()
})

it('respeita a concorrência máxima de 3', async () => {
  const emVoo = rastrearEmVoo('POST', '/api/v1/documentos')
  render(<PaginaEnvio />)
  await soltar(Array.from({ length: 10 }, () => png()))
  await waitFor(() => expect(emVoo.pico()).toBeLessThanOrEqual(3))
})
```

> Os três testam **efeito colateral que não aconteceu** — requisição não feita,
> concorrência não excedida. É a única forma de garantir que não acontece.

- [ ] **7.2** Rodar: FAIL esperado

- [ ] **7.3** Implementar `validacao.ts`

Mensagem sempre com **o que fazer**, não só o que falhou. Para HEIC,
especificamente (risco registrado do fato b):

```ts
if (ehHeic(arquivo)) return {
  ok: false,
  motivo: 'Formato HEIC não é suportado pelo navegador',
  comoResolver: 'No iPhone: Ajustes > Câmera > Formatos > "Mais compatível". ' +
                'Ou reenvie tirando print da foto.',
}
```

- [ ] **7.4** Implementar `deduplicacao.ts` — hash de todos, agrupar por hash,
      manter o primeiro, reportar os descartados

- [ ] **7.5** Implementar `filaDeEnvio.ts`

```ts
export async function executarComConcorrencia<T>(
  tarefas: (() => Promise<T>)[], maximo = 3,
): Promise<PromiseSettledResult<T>[]> {
  const resultados: PromiseSettledResult<T>[] = new Array(tarefas.length)
  let proxima = 0
  const trabalhador = async () => {
    while (proxima < tarefas.length) {
      const i = proxima++
      // allSettled por trabalhador: a falha de um item NUNCA aborta os outros
      resultados[i] = await tarefas[i]!().then(
        (value) => ({ status: 'fulfilled', value }) as const,
        (reason) => ({ status: 'rejected', reason }) as const,
      )
    }
  }
  await Promise.all(Array.from({ length: Math.min(maximo, tarefas.length) }, trabalhador))
  return resultados
}
```

- [ ] **7.6** Implementar `useEnvio`, `AreaDeEnvio`, `ItemDeEnvio`, `PaginaEnvio`

Ordem por item: validar → hash → reduzir se imagem → enfileirar → `POST`.
`ItemDeEnvio` mostra: miniatura, `nomeOrigem`, tamanho antes/depois da redução,
estado, e — quando duplicado — "já enviado em `<data>` · ver documento".

- [ ] **7.7** Rodar: PASS
- [ ] **7.8** Commit: `feat: envio em lote com validação local, deduplicação e concorrência limitada`

---

## Tarefa 8 — Acompanhamento (RF-04, RF-05)

**Arquivos:** criar `src/features/processing/{backoff,usePollingLote}.ts`,
`src/features/processing/ListaDeAcompanhamento.tsx`,
`src/pages/PaginaAcompanhamento.tsx`, `tests/features/acompanhamento.test.tsx`

**Produz:**
- `intervaloDeBackoff(msDecorridos: number): number`
- `usePollingLote(ids: string[])` → `{ porId: Record<string, StatusResumido> }`

- [ ] **8.1 Testes que falham**

```ts
it('backoff cresce com o tempo decorrido', () => {
  expect(intervaloDeBackoff(0)).toBe(2_000)
  expect(intervaloDeBackoff(29_000)).toBe(2_000)
  expect(intervaloDeBackoff(31_000)).toBe(5_000)
  expect(intervaloDeBackoff(3 * 60_000)).toBe(15_000)
})

it('N documentos geram UMA requisição de status', async () => {
  const chamadas = contarChamadas('GET', '/api/v1/documentos/status')
  render(<PaginaAcompanhamento ids={vinteIds} />)
  await avancarRelogio(2_100)
  expect(chamadas()).toBe(1)          // não 20 — fato (e)
})

it('T-05: FALHOU não reprocessa sozinho', async () => {
  const chamadas = contarChamadas('POST', '/reprocessar')
  render(<PaginaAcompanhamento ids={[idQueFalhou]} />)
  await avancarRelogio(60_000)
  expect(chamadas()).toBe(0)          // fato (a)
})

it('reprocessar exige confirmação que informa o custo', async () => {
  render(<PaginaAcompanhamento ids={[idQueFalhou]} />)
  await user.click(screen.getByRole('button', { name: /reprocessar/i }))
  expect(screen.getByText(/nova chamada.*cobrada/i)).toBeInTheDocument()
  expect(contarChamadas('POST', '/reprocessar')()).toBe(0)   // ainda não
  await user.click(screen.getByRole('button', { name: /confirmar/i }))
  await waitFor(() => expect(contarChamadas('POST', '/reprocessar')()).toBe(1))
})
```

- [ ] **8.2** Rodar: FAIL esperado

- [ ] **8.3** Implementar `backoff.ts`

```ts
export const intervaloDeBackoff = (ms: number): number =>
  ms < 30_000 ? 2_000 : ms < 120_000 ? 5_000 : 15_000
```

- [ ] **8.4** Implementar `usePollingLote` com `useQuery` + `refetchInterval`
      dinâmico, `refetchIntervalInBackground: false` e pausa via
      `visibilitychange`

- [ ] **8.5** Implementar a lista: tempo decorrido (**nunca** barra de
      progresso), estados `FALHOU` e `EXPIRADO` com mensagem distinta, e o
      diálogo de confirmação de reprocessamento

- [ ] **8.6** Rodar: PASS
- [ ] **8.7** Commit: `feat: acompanhamento com polling em lote, backoff e reprocessamento explícito`

---

## Tarefa 9 — Fila de conferência e reserva (RF-06, RF-07)

**Arquivos:** criar `src/features/review/{useFilaDeConferencia,useClaim}.ts`,
`src/features/review/ListaVirtualizada.tsx`,
`src/pages/PaginaFilaConferencia.tsx`, `tests/features/fila.test.tsx`

**Produz:** `useFilaDeConferencia()` · `useClaim(id)` → `{ reserva, reservar, liberar, conflito }`

- [ ] **9.1 Testes que falham**

```ts
it('documento reservado por outra pessoa aparece marcado e não é oferecido', async () => {
  reservarComoOutroUsuario('doc-7', 'Ana Souza')
  render(<PaginaFilaConferencia />)
  const linha = await screen.findByRole('row', { name: /doc-7/ })
  expect(within(linha).getByText(/em conferência por Ana Souza/i)).toBeInTheDocument()
  expect(within(linha).queryByRole('button', { name: /conferir/i })).toBeNull()
})

it('sem identidade do host, degrada para "outra sessão" sem quebrar', async () => {
  semIdentidadeDoHost()
  reservarComoOutroUsuario('doc-7', null)
  render(<PaginaFilaConferencia />)
  expect(await screen.findByText(/em conferência por outra sessão/i)).toBeInTheDocument()
})

it('libera a reserva ao sair da tela', async () => {
  const liberacoes = contarChamadas('DELETE', '/conferencia/claim')
  const { unmount } = render(<PaginaConferencia id="doc-1" />)
  await screen.findByRole('heading', { name: /conferência/i })
  unmount()
  await waitFor(() => expect(liberacoes()).toBe(1))
})

it('CPF vem mascarado na listagem e revela sob demanda', async () => {
  render(<PaginaFilaConferencia />)
  expect(await screen.findByText('***.456.789-**')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /revelar/i }))
  expect(screen.getByText('123.456.789-01')).toBeInTheDocument()
})
```

- [ ] **9.2** Rodar: FAIL esperado

- [ ] **9.3** Implementar `useFilaDeConferencia` — `useInfiniteQuery` com cursor,
      ordenação por chegada (premissa P6), sem priorização (premissa P2)

- [ ] **9.4** Implementar `useClaim` — reservar ao montar, renovar a cada
      2 minutos (TTL de 5), liberar no `unmount` **e** no `beforeunload`

```ts
useEffect(() => {
  const liberar = () => navigator.sendBeacon(urlDeLiberacao(id))
  window.addEventListener('beforeunload', liberar)
  return () => { window.removeEventListener('beforeunload', liberar); liberarViaApi(id) }
}, [id])
```

> `sendBeacon` porque `fetch` durante `beforeunload` é cancelado pelo navegador.
> Sem isso, a reserva só se liberaria pelo TTL — e o fato (g) pediria 5 minutos
> de espera a cada aba fechada.

- [ ] **9.5** Implementar a lista virtualizada (janela fixa, altura de linha
      conhecida) e o mascaramento com botão de revelar

- [ ] **9.6** Rodar: PASS
- [ ] **9.7** Commit: `feat: fila de conferência com reserva por lease e mascaramento na listagem`

---

## Tarefa 10 — Conferência dirigida por schema (RF-08, RF-09)

**A tarefa que sustenta o fato (f). Se ela sair errada, a spec vira conversa fiada.**

**Arquivos:** criar `src/features/review/fields/registry.ts` e os seis
componentes de campo, `src/features/review/{VisualizadorDocumento,PainelDeCampos}.tsx`,
`src/pages/PaginaConferencia.tsx`, `tests/features/conferencia.test.tsx`

**Produz:**
- `type ComponenteDeCampo = React.FC<{ descritor: DescritorDeCampo; campo: CampoExtraido; onChange: (v: string) => void; abaixoDoLimiar: boolean }>`
- `registry: Record<TipoDeDado, ComponenteDeCampo>`
- `resolverComponente(tipo: TipoDeDado): ComponenteDeCampo`

- [ ] **10.1 O teste central** — `tests/features/conferencia.test.tsx`

```ts
it('T-03: renderiza um tipo de documento que o front-end nunca viu', async () => {
  // Tipo inventado no mock, com campos inéditos. NENHUMA linha do front mudou.
  mockarTipoDocumento({
    id: 'certidao-de-nascimento-2027',
    rotulo: 'Certidão de Nascimento',
    campos: [
      { chave: 'nomeRegistrado', rotulo: 'Nome registrado', tipoDeDado: 'TEXTO',   obrigatorio: true,  ordem: 1 },
      { chave: 'dataRegistro',   rotulo: 'Data do registro', tipoDeDado: 'DATA',   obrigatorio: true,  ordem: 2 },
      { chave: 'livro',          rotulo: 'Livro',            tipoDeDado: 'NUMERO', obrigatorio: false, ordem: 3 },
      { chave: 'cartorio',       rotulo: 'Cartório',         tipoDeDado: 'SELECAO',obrigatorio: true,  ordem: 4,
        opcoes: ['1º Ofício', '2º Ofício'] },
    ],
  })

  render(<PaginaConferencia id="doc-novo" />)

  expect(await screen.findByLabelText('Nome registrado')).toBeInTheDocument()
  expect(screen.getByLabelText('Data do registro')).toHaveAttribute('type', 'date')
  expect(screen.getByLabelText('Cartório')).toHaveRole('combobox')
  // ordem respeitada
  const rotulos = screen.getAllByRole('textbox').map(e => e.getAttribute('aria-label'))
  expect(rotulos[0]).toBe('Nome registrado')
})

it('campo abaixo do limiar é destacado individualmente', async () => {
  render(<PaginaConferencia id="doc-1" />)   // 'numero' tem confiança 0,42
  const campo = await screen.findByLabelText(/número/i)
  expect(campo).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByText(/confiança baixa/i)).toBeInTheDocument()
})

it('mostra o nome como chegou E o nome padronizado proposto', async () => {
  render(<PaginaConferencia id="doc-1" />)
  expect(await screen.findByText('WhatsApp Image 2026-08-11 at 09.12.33.jpeg')).toBeInTheDocument()
  expect(screen.getByLabelText(/nome padronizado/i)).toHaveValue('RG_FULANO_DE_TAL_DA_SILVA_12345678-9')
})
```

- [ ] **10.2** Rodar: FAIL esperado

- [ ] **10.3** Implementar o `registry` — **o arquivo inteiro**

```ts
import type { TipoDeDado } from '@/entities/tipo-documento/tipos'

export const registry: Record<TipoDeDado, ComponenteDeCampo> = {
  TEXTO:   CampoTexto,
  DATA:    CampoData,
  CPF:     CampoCpf,
  CNPJ:    CampoCnpj,
  NUMERO:  CampoNumero,
  SELECAO: CampoSelecao,
}

// Tipo desconhecido cai em TEXTO, com aviso. NUNCA quebra a tela:
// um schema novo do fornecedor não pode deixar o atendimento sem trabalhar.
export const resolverComponente = (tipo: TipoDeDado): ComponenteDeCampo =>
  registry[tipo] ?? CampoTexto
```

- [ ] **10.4** Implementar `PainelDeCampos` — ordena por `ordem`, resolve pelo
      registry, marca `abaixoDoLimiar` por campo. **Zero condicional por tipo de
      documento** (G1).

- [ ] **10.5** Implementar `VisualizadorDocumento` — zoom, rotação, PDF em
      `<object>`, imagem com orientação EXIF, `alt` descritivo. URL obtida por
      `client.urlDoArquivo`, **nunca cacheada** (G4).

- [ ] **10.6** Implementar `PaginaConferencia` — layout de duas colunas,
      original à esquerda, campos à direita

- [ ] **10.7** Rodar: PASS
- [ ] **10.8** Commit: `feat: conferência com campos dirigidos por schema da API`

---

## Tarefa 11 — Gravação com trava otimista e conflito (RF-10, RF-11)

**O defeito mais caro do sistema mora aqui. É a tarefa que menos pode sair errada.**

**Arquivos:** criar `src/features/review/{useGravarCampos.ts,ConflitoDialog.tsx}`,
`tests/features/gravacao.test.tsx`

**Produz:** `useGravarCampos(id)` → `{ gravar, conflito, limparConflito }`

- [ ] **11.1 O teste T-01**

```ts
it('T-01: ninguém sobrescreve o trabalho de ninguém', async () => {
  render(<PaginaConferencia id="doc-1" />)          // Ana carrega na versão 3
  await screen.findByLabelText(/filiação/i)

  gravarComoOutroUsuario('doc-1', 'Bruno Lima', { numero: '99.999.999-9' })  // versão -> 4

  await user.clear(screen.getByLabelText(/filiação/i))
  await user.type(screen.getByLabelText(/filiação/i), 'Maria de Tal')
  await user.click(screen.getByRole('button', { name: /salvar/i }))

  // 1. avisa, nomeando quem
  expect(await screen.findByText(/Bruno Lima alterou este documento/i)).toBeInTheDocument()
  // 2. mostra o que mudou
  expect(screen.getByText(/99\.999\.999-9/)).toBeInTheDocument()
  // 3. NÃO descarta a edição da Ana
  expect(screen.getByLabelText(/filiação/i)).toHaveValue('Maria de Tal')
  // 4. NÃO sobrescreveu o Bruno
  expect(await estadoNoServidor('doc-1')).toMatchObject({
    versao: 4, campos: expect.arrayContaining([campo('numero', '99.999.999-9')]),
  })
})

it('envia If-Match com a versão carregada', async () => {
  const req = capturarRequisicao('PATCH', '/campos')
  render(<PaginaConferencia id="doc-1" />)
  await user.click(await screen.findByRole('button', { name: /salvar/i }))
  expect((await req()).headers.get('If-Match')).toBe('3')
})

it('sucesso leva o documento a PRONTO', async () => {
  render(<PaginaConferencia id="doc-1" />)
  await user.click(await screen.findByRole('button', { name: /salvar/i }))
  await waitFor(async () =>
    expect(await estadoNoServidor('doc-1')).toMatchObject({ estado: 'PRONTO' }))
})
```

> As quatro asserções do primeiro teste são quatro defeitos distintos. Falhar
> qualquer uma delas produz perda silenciosa de dado pessoal já conferido — que
> só aparece semanas depois, dentro de um processo.

- [ ] **11.2** Rodar: FAIL esperado

- [ ] **11.3** Implementar `useGravarCampos`

```ts
const mutation = useMutation({
  mutationFn: (dados) => client.gravarCampos(id, versaoCarregada, dados.campos, dados.nome),
  onError: (erro) => {
    if (erro instanceof ErroDeApi && erro.status === 409) {
      // NÃO reverte a edição local, NÃO aplica por cima.
      // Guarda o conflito e devolve a decisão para a pessoa.
      setConflito({
        atual: erro.corpo.documentoAtual,
        alteradoPor: erro.corpo.alteradoPor,
      })
      return
    }
    throw erro
  },
})
```

- [ ] **11.4** Implementar `ConflitoDialog` — lista campo a campo *seu valor* ×
      *valor dele*, com três saídas: **recarregar e perder minha edição** ·
      **manter a minha e sobrescrever** (recarrega a versão e regrava) ·
      **cancelar e continuar editando**. Nenhuma delas é automática.

- [ ] **11.5** Implementar o recálculo do nome padronizado ao editar campo,
      **respeitando edição manual** (RF-11, ADR-013)

```ts
const [nomeEditadoManualmente, setNomeEditadoManualmente] = useState(false)
useEffect(() => {
  if (nomeEditadoManualmente) return   // a edição da pessoa prevalece
  setNome(comporNomePadronizado(tipo.padraoDeNome, campos, tipo.rotulo))
}, [campos, tipo, nomeEditadoManualmente])
```

- [ ] **11.6** Rodar: PASS
- [ ] **11.7** Commit: `feat: gravação com trava otimista e resolução humana de conflito`

---

## Tarefa 12 — Rejeição pelo conferente (RF-12, ADR-012)

**Arquivos:** criar `src/features/review/RejeitarDialog.tsx`,
`tests/features/rejeicao.test.tsx`

- [ ] **12.1 Testes que falham**

```ts
it('rejeitar exige motivo e tira o documento da fila', async () => {
  render(<PaginaConferencia id="doc-1" />)
  await user.click(await screen.findByRole('button', { name: /rejeitar/i }))
  expect(screen.getByRole('button', { name: /confirmar/i })).toBeDisabled()
  await user.selectOptions(screen.getByLabelText(/motivo/i), 'ILEGIVEL')
  await user.click(screen.getByRole('button', { name: /confirmar/i }))
  await waitFor(async () =>
    expect(await estadoNoServidor('doc-1')).toMatchObject({ estado: 'REJEITADO' }))
})

it('rejeitar NÃO dispara reprocessamento', async () => {
  const chamadas = contarChamadas('POST', '/reprocessar')
  await rejeitar('doc-1', 'ILEGIVEL')
  expect(chamadas()).toBe(0)      // fato (a): reprocessar foto ilegível é dinheiro fora
})
```

- [ ] **12.2** Rodar: FAIL · **12.3** Implementar · **12.4** Rodar: PASS
- [ ] **12.5** Commit: `feat: rejeição de documento com motivo obrigatório`

---

## Tarefa 13 — Teste de arquitetura (T-08)

**Regra de arquitetura que não é verificada automaticamente é sugestão.**

**Arquivos:** criar `tests/arquitetura/fronteiras.test.ts`

- [ ] **13.1** Escrever o teste

```ts
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const fontes = globSync('src/**/*.{ts,tsx}', { exclude: (p) => p.includes('/mocks/') })

it('G1: nenhum tipo de documento aparece no código do front-end', () => {
  const proibidos = /\b(RG|CPF_DOC|comprovante|contracheque|procuracao|carteira_trabalho|laudo)\b/i
  const infratores = fontes.filter(f => proibidos.test(readFileSync(f, 'utf8')))
  expect(infratores).toEqual([])
})

it('G2: nenhum fetch fora de shared/api/', () => {
  const infratores = fontes
    .filter(f => !f.includes('shared/api/'))
    .filter(f => /\bfetch\s*\(/.test(readFileSync(f, 'utf8')))
  expect(infratores).toEqual([])
})

it('G6: entities/ não importa React, fetch nem window', () => {
  const dominio = fontes.filter(f => f.includes('/entities/'))
  const infratores = dominio.filter(f =>
    /from ['"]react|fetch\s*\(|window\./.test(readFileSync(f, 'utf8')))
  expect(infratores).toEqual([])
})
```

> `CPF` sozinho é permitido — é um **tipo de dado**, não um tipo de documento.
> A distinção é exatamente o ponto da ADR-008, e o regex precisa refleti-la.

- [ ] **13.2** Rodar: esperado PASS. **Se falhar, o código é que está errado**,
      não o teste.
- [ ] **13.3** Commit: `test: fronteiras de arquitetura verificadas automaticamente`

---

## Tarefa 14 — README, divergências e registro de IA

**Arquivos:** criar `README.md`; atualizar `docs/spec/08-divergencias.md`,
`docs/ia/onde-o-agente-errou.md`, `docs/ia/registro-de-tempo.md`

- [ ] **14.1** `README.md` — outra pessoa precisa subir o projeto sem perguntar nada

Conteúdo mínimo: o que é e qual trilha · como rodar (`npm i` → `npm run dev`) ·
como servir o contrato por fora (`npm run mock`) · como rodar os testes ·
**como reproduzir a demonstração** com os documentos fictícios, incluindo qual
arquivo dispara duplicata e qual está torto · mapa do repositório · e link para
`07-nao-feito.md` logo no topo.

- [ ] **14.2** Preencher `08-divergencias.md` com **tudo** que divergiu de `spec-v1`

```bash
git diff spec-v1 --stat -- docs/spec/
```
Cada entrada: o que a spec dizia · o que foi feito · por quê · se a spec é que
deveria mudar. **Divergir não é demérito; esconder seria.**

- [ ] **14.3** *(autoria do candidato — A2)* Escrever
      `docs/ia/onde-o-agente-errou.md`, em primeira pessoa, a partir de
      `registro-de-verificacao.md`

- [ ] **14.4** *(autoria do candidato — A3)* Escrever o parágrafo sobre escolha
      de testes, no README, a partir de `06-plano-de-testes.md`

- [ ] **14.5** Fechar o `registro-de-tempo.md` com os horários reais

- [ ] **14.6** Commit: `docs: README, divergências e fechamento do registro de IA`

---

## Tarefa 15 — Carta de fechamento

**Arquivos:** criar `docs/carta-de-fechamento.md` e `docs/carta-de-fechamento.pdf`

- [ ] **15.1** *(autoria do candidato — A4)* Responder às quatro perguntas

1. **O que ficou de fora e por quê** — material pronto em `07-nao-feito.md`
2. **O que quebra primeiro com volume × 10** (1.500/dia, 8.000 no pico) —
   material em `05-fatos-do-ambiente.md`. *Minha leitura:* não é a interface, é
   a **fila de conferência**. Duas pessoas a 4 min por documento conferem cerca
   de 240 por dia; a 8.000 no pico, a fila nunca drena. O gargalo é humano, e
   nenhuma decisão de front-end resolve — é o item de priorização, hoje
   registrado como não feito.
3. **Qual decisão você menos defenderia hoje** — candidatas honestas: o `PATCH`
   que grava e conclui sem permitir rascunho (`02-contrato-api.md`); a
   ampliação de escopo da rejeição (ADR-012); polling em vez de SSE (ADR-005).
   **A escolha é sua.**
4. **Quanto tempo levou** — `registro-de-tempo.md`, relógio real

- [ ] **15.2** Gerar o PDF: Roboto 11 pt, entrelinha 1,15, 6 pt entre
      parágrafos, texto justificado, **máximo 2 páginas**

Sem pandoc, LibreOffice ou Roboto local. Caminho: HTML com Roboto do Google
Fonts + Chrome headless.

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="docs/carta-de-fechamento.pdf" docs/carta-de-fechamento.html
```

**Plano B**, se o Chrome não estiver disponível: `fpdf2` com a TTF do Roboto
embutida (`pip install fpdf2`), controlando entrelinha e justificação à mão.

- [ ] **15.3** Conferir o PDF: fonte incorporada, 2 páginas no máximo
- [ ] **15.4** Commit: `docs: carta de fechamento`

---

## Tarefa 16 — Agente auditor e relatório

**Arquivos:** criar `.claude/agents/auditor-de-entrega.md`;
gerar `auditoria/relatorio-final.md` (**no `.gitignore`**, fora do escopo da entrega)

- [ ] **16.1** Escrever o subagente especialista

Deve conferir a entrega **contra o enunciado**, item por item — II.1 a II.5 e os
cinco critérios de pontuação — e emitir veredito **APROVADO**, **APROVADO COM
RESSALVAS** ou **REPROVADO**. Nos dois últimos, explicar **o que** melhorar e
**por quê**.

Instrução crítica no agente: *ler o enunciado em `docs/enunciado.md` como fonte
de verdade e verificar cada afirmação contra os arquivos, sem aceitar a
narrativa do repositório sobre si mesmo.* Um auditor que lê o README e acredita
não está auditando.

- [ ] **16.2** Rodar o auditor e gravar o relatório em `auditoria/`
- [ ] **16.3** Confirmar que `auditoria/` **não** entra no commit

```bash
git status --porcelain | grep auditoria || echo "OK: fora do versionamento"
```

- [ ] **16.4** Commit: `chore: agente auditor de entrega`

---

## Ordem, dependências e caminho crítico

```
T1 scaffold
 ├─ T2 domínio ──┐
 ├─ T3 lib ──────┤
 └─ T4 api ──────┴─ T5 mock ─┬─ T7 envio ──── T8 acompanhamento
                             ├─ T9 fila ───── T10 conferência ─ T11 gravação ─ T12 rejeição
                             └─ T6 fixtures
                                                                  T13 arquitetura
                                                                  T14 · T15 · T16
```

**Caminho crítico:** T1 → T4 → T5 → T10 → T11. Se o tempo apertar, T12
(rejeição) é o primeiro corte — vira "modelado, não feito" em `07-nao-feito.md`,
com a ADR-012 atualizada para registrar a mudança.

## Auto-revisão do plano

| Verificação | Resultado |
|---|---|
| Cobertura da spec | RF-01 a RF-12 → T7, T8, T9, T10, T11, T12. RF-13 declarado não feito. RNF-01, 02, 06 → T4. RNF-03, 07 → T4 e T9. RNF-04 → T9. RNF-05 → T5 |
| Testes T-01 a T-08 alocados | T-01 → T11 · T-02 → T7 · T-03 → T10 · T-04 → T2 e T5 · T-05 → T8 · T-06 → T7 · T-07 → T2 · T-08 → T13 |
| Placeholders | nenhum |
| Consistência de tipos | `sha256`, `validar`, `executarComConcorrencia`, `intervaloDeBackoff`, `resolverComponente`, `comporNomePadronizado` — mesma assinatura onde declaradas e onde usadas |
| ADRs sem tarefa | nenhuma. ADR-013 → T11.5 · ADR-012 → T12 · ADR-011 → T4.2 · ADR-008 → T10 |
