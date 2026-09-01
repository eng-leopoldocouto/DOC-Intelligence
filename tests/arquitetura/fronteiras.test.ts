/**
 * @vitest-environment node
 *
 * Fronteiras de arquitetura verificadas automaticamente.
 *
 * Regra de arquitetura que não é verificada por máquina é sugestão. Estas três
 * são as que sustentam as ADRs 002, 008 e a regra de dependência — se alguma
 * quebrar, é o CÓDIGO que está errado, nunca o teste.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const RAIZ = join(process.cwd(), 'src')

function fontes(dir: string = RAIZ, acc: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome)
    if (statSync(caminho).isDirectory()) fontes(caminho, acc)
    else if (/\.tsx?$/.test(caminho) && !caminho.endsWith('.d.ts')) acc.push(caminho)
  }
  return acc
}

const TODAS = fontes()

/**
 * Lê o arquivo SEM comentários.
 *
 * A primeira versão deste teste acusou `estado.ts` de tocar em `window` — o
 * que ele fazia era declarar, na própria docstring, "sem React, sem fetch, sem
 * window". E acusou `http.ts` de conhecer o tipo "RG", quando o que há lá é um
 * comentário identificando o formato do número num regex de sanitização.
 *
 * As regras valem para CÓDIGO. Comentário que explica o domínio é desejável, e
 * um teste que o pune ensina a apagar explicação — o oposto do que queremos.
 */
const conteudoDeTexto = (t: string): string =>
  t
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')

const conteudo = (f: string) => conteudoDeTexto(readFileSync(f, 'utf8'))
const rel = (f: string) => relative(process.cwd(), f).split(sep).join('/')
const foraDoMock = (f: string) => !rel(f).includes('/mocks/')

/**
 * A lista de termos NÃO vive neste arquivo.
 *
 * Ela vive em `.claude/hooks/regras-do-projeto.json`, lida também pelo hook
 * PreToolUse que BLOQUEIA a escrita antes que ela aconteça. Duas cópias — uma
 * no hook, outra no teste — divergiriam em silêncio, e a divergência apareceria
 * do pior jeito: o hook liberando o que o teste reprova, ou o contrário.
 *
 * O hook chega antes e explica; este teste chega depois e não deixa passar. Os
 * dois só têm valor se falarem da mesma lista.
 */
const REGRAS = JSON.parse(
  readFileSync(join(process.cwd(), '.claude/hooks/regras-do-projeto.json'), 'utf8'),
) as { regra2_tiposDeDocumentoProibidos: { termos: string[] } }

describe('G1 — o front-end não conhece nenhum tipo de documento (ADR-008, fato f)', () => {
  it('nenhum nome de tipo de documento aparece fora de mocks/', () => {
    // Atenção: CPF e CNPJ NÃO entram nesta lista. São TIPOS DE DADO, e o
    // registry existe justamente para conhecê-los. A distinção entre tipo de
    // dado e tipo de documento é o ponto inteiro da ADR-008.
    const termos = REGRAS.regra2_tiposDeDocumentoProibidos.termos
    expect(termos.length).toBeGreaterThan(0) // guarda contra o teste virar vácuo

    const proibidos = new RegExp(`\\b(${termos.join("|")})\\b`, 'i')

    const infratores = TODAS.filter(foraDoMock)
      .filter((f) => proibidos.test(conteudo(f)))
      .map(rel)

    expect(infratores).toEqual([])
  })

  it('o hook PreToolUse lê a MESMA lista — não guarda uma cópia própria', () => {
    // Se alguém colar os termos dentro do .mjs, o hook e este teste passam a
    // poder discordar. O hook precisa continuar LENDO o json, e não contê-lo.
    const hook = readFileSync(join(process.cwd(), '.claude/hooks/guarda-regras.mjs'), 'utf8')
    const semComentario = conteudoDeTexto(hook)

    expect(semComentario).toContain('regras-do-projeto.json')
    for (const termo of REGRAS.regra2_tiposDeDocumentoProibidos.termos) {
      expect(semComentario).not.toContain(`'${termo}'`)
      expect(semComentario).not.toContain(`"${termo}"`)
    }
  })
})

describe('G2 — uma única costura de rede (ADR-002)', () => {
  it('nenhum fetch fora de shared/api/', () => {
    const infratores = TODAS.filter((f) => !rel(f).includes('shared/api/'))
      .filter((f) => /(?<!\w)fetch\s*\(/.test(conteudo(f)))
      .map(rel)

    expect(infratores).toEqual([])
  })
})

describe('G6 — entities/ é domínio puro', () => {
  it('não importa React, não usa fetch e não toca em window', () => {
    const dominio = TODAS.filter((f) => rel(f).includes('src/entities/'))
    expect(dominio.length).toBeGreaterThan(0) // guarda contra o teste virar vácuo

    const infratores = dominio
      .filter((f) => /from ['"]react|(?<!\w)fetch\s*\(|window\./.test(conteudo(f)))
      .map(rel)

    expect(infratores).toEqual([])
  })
})

describe('regra de dependência: app → pages → features → entities → shared', () => {
  it('entities/ não importa de features/, pages/ ou app/', () => {
    const infratores = TODAS.filter((f) => rel(f).includes('src/entities/'))
      .filter((f) => /from ['"]@\/(features|pages|app)\//.test(conteudo(f)))
      .map(rel)

    expect(infratores).toEqual([])
  })

  it('shared/ não importa de features/, pages/ ou app/', () => {
    const infratores = TODAS.filter((f) => rel(f).includes('src/shared/'))
      .filter((f) => /from ['"]@\/(features|pages|app)\//.test(conteudo(f)))
      .map(rel)

    expect(infratores).toEqual([])
  })
})

describe('ADR-004 — o mock simula, não implementa', () => {
  it('handlers.ts fica dentro do limite auto-imposto de 400 linhas', () => {
    const handlers = TODAS.find((f) => rel(f).endsWith('src/mocks/handlers.ts'))!
    const linhas = conteudo(handlers).split('\n').length
    // Passar disso significaria que o mock virou back-end e a fronteira
    // declarada na ADR-004 foi rompida.
    expect(linhas).toBeLessThan(400)
  })
})
