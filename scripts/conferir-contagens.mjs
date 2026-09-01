#!/usr/bin/env node
/**
 * As contagens do README batem com a realidade?
 *
 * POR QUE ISTO EXISTE
 * -------------------
 * Quatro rodadas de auditoria acharam a MESMA classe de defeito quatro vezes: um
 * número escrito num documento e desmentido pelo repositório. "64 testes" quando
 * eram 95. "13 decisões" quando eram 15. "12 prompts" quando eram 14. "seis
 * asserções" quando eram sete.
 *
 * As três primeiras rodadas responderam com uma regra de disciplina — *procurar
 * pelo número, não pelo assunto*. Disciplina funciona até a vez em que não
 * funciona, e essa vez chegou quatro vezes seguidas.
 *
 * O conserto durável não é acertar o número desta vez: é **tornar o erro incapaz
 * de sobreviver a um push**. Este script é da mesma família da verificação que já
 * existe no `ci.yml` regenerando os tipos do contrato — em ambos, o repositório
 * para de pedir confiança e passa a provar.
 *
 * Foi recomendado pela quarta auditoria, que o descreveu como "dez linhas de
 * shell". São mais que dez, porque ele também explica o que fazer quando falha:
 * uma verificação que só diz "errado" transfere o trabalho para quem lê.
 *
 * Uso:
 *     npm run contagens
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const RAIZ = process.cwd()
const ler = (p) => readFileSync(join(RAIZ, p), 'utf8')
const contarArquivos = (dir, padrao) =>
  readdirSync(join(RAIZ, dir)).filter((f) => padrao.test(f)).length

/** Números por extenso que o README usa. Só os que aparecem de fato. */
const EXTENSO = {
  cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
  onze: 11, doze: 12, treze: 13, catorze: 14, quinze: 15, dezesseis: 16,
}

const numero = (t) => (/^\d+$/.test(t) ? Number(t) : EXTENSO[t.toLowerCase()])

/**
 * Roda a suíte e devolve o total REAL de testes.
 *
 * Roda de novo, em vez de reaproveitar a execução anterior, porque o valor deste
 * script está em não depender de nada que alguém tenha lembrado de fazer antes.
 */
function totalDeTestes() {
  const arquivo = join(mkdtempSync(join(tmpdir(), 'doc-intel-')), 'testes.json')

  // Chama o CLI local do vitest com o Node, e nao `npx` com `shell: true`.
  // Duas razoes, as duas descobertas rodando: `shell: true` concatena os
  // argumentos sem escapar (o Node avisa), e `npx` dentro de um script npm
  // herda variaveis de ambiente que o fazem sair com codigo 1 — o mesmo comando
  // que passa no terminal falhava sob `npm run`.
  try {
    execFileSync(process.execPath, [
      join(RAIZ, 'node_modules', 'vitest', 'vitest.mjs'),
      'run',
      '--reporter=json',
      `--outputFile=${arquivo}`,
    ], { stdio: ['ignore', 'ignore', 'pipe'] })
  } catch (erro) {
    // Nunca falhar calado: sem isto, uma suite quebrada vira "erro no script de
    // contagens" e quem le procura no lugar errado.
    console.error('A suíte de testes não passou; o total não pode ser conferido.\n')
    console.error(String(erro.stderr ?? '').slice(-2000))
    process.exit(1)
  }

  return JSON.parse(readFileSync(arquivo, 'utf8')).numTotalTests
}

const readme = ler('README.md')

/** Toda ocorrência de um padrão no README, já convertida em número. */
const declarados = (padrao) =>
  [...readme.matchAll(padrao)].map((m) => ({
    // Uma afirmação pode estar quebrada em duas linhas do Markdown; normalizar
    // evita que a mensagem de erro saia rasgada no meio.
    texto: m[0].trim().replace(/\s+/g, ' '),
    valor: numero(m[1]),
  }))

const real = {
  testes: totalDeTestes(),
  adrs: contarArquivos('docs/adr', /^\d{3}-.*\.md$/),
  prompts: contarArquivos('docs/ia/prompts', /\.md$/),
  divergencias: (ler('docs/spec/08-divergencias.md').match(/^## D-/gm) ?? []).length,
  testesDeArquitetura: (ler('tests/arquitetura/fronteiras.test.ts').match(/^\s*it\(/gm) ?? []).length,
  comandosDeAuditoria: readdirSync(join(RAIZ, 'docs/ia/transcricao/auditorias'))
    .filter((f) => f.endsWith('.md'))
    .reduce((n, f) => n + (ler(`docs/ia/transcricao/auditorias/${f}`).match(/^```bash$/gm) ?? []).length, 0),
}

const conferencias = [
  ['testes', /badge\/testes-(\d+)-/g, real.testes, 'o selo no topo do README'],
  ['testes', /(\d+) testes\b/g, real.testes, 'a suíte'],
  ['ADRs', /(\d+) decisões/g, real.adrs, 'os arquivos numerados em docs/adr/'],
  ['prompts', /Os (\d+) prompts/g, real.prompts, 'os arquivos em docs/ia/prompts/'],
  ['divergências', /(\w+) divergências/g, real.divergencias, 'as entradas "## D-" em 08-divergencias.md'],
  ['testes de arquitetura', /(\w+) testes de arquitetura/g, real.testesDeArquitetura, 'os blocos it() em fronteiras.test.ts'],
  ['comandos de auditoria', /(\d+)\s*\n?comandos que o auditor rodou/g, real.comandosDeAuditoria, 'os blocos bash nas transcrições exportadas'],
]

const falhas = []

for (const [rotulo, padrao, esperado, fonte] of conferencias) {
  for (const { texto, valor } of declarados(padrao)) {
    // Palavra que não é número da tabela não é erro — é só uma palavra.
    if (valor === undefined) continue
    if (valor !== esperado) {
      falhas.push(`${rotulo}: o README diz "${texto}", e a contagem real é ${esperado} (${fonte}).`)
    }
  }
}

// O índice das ADRs conta a mesma coisa que os arquivos, e já divergiu antes.
const noIndice = (ler('docs/adr/README.md').match(/^\| \[\d{3}\]/gm) ?? []).length
if (noIndice !== real.adrs) {
  falhas.push(
    `ADRs: o índice em docs/adr/README.md lista ${noIndice}, e existem ${real.adrs} arquivos.`,
  )
}

console.log('Contagens reais:')
for (const [k, v] of Object.entries(real)) console.log(`  ${k.padEnd(22)} ${v}`)
console.log(`  ${'ADRs no índice'.padEnd(22)} ${noIndice}`)

if (falhas.length > 0) {
  console.error('\nO README afirma número que o repositório desmente:\n')
  for (const f of falhas) console.error('  - ' + f)
  console.error(
    '\nCorrija o TEXTO, e não a contagem. Se o número mudou de propósito, ele mudou\n' +
      'em mais de um lugar: procure pelo número, não pelo assunto.\n',
  )
  process.exit(1)
}

console.log('\nOK — nenhum número do README é desmentido pelo repositório.')
