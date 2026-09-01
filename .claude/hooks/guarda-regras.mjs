/**
 * Hook PreToolUse — as regras 2 e 3 do CLAUDE.md deixam de depender de boa
 * vontade.
 *
 * As duas regras mais estruturais deste projeto são negativas: "nenhum tipo de
 * documento no front-end" e "nenhuma chamada de rede fora de shared/api/". Até
 * aqui elas eram verificadas DEPOIS, pelo teste de arquitetura. Isso funciona,
 * e chega tarde: o código já foi escrito, já parece certo, e desfazê-lo custa
 * mais do que não tê-lo escrito.
 *
 * Este hook roda ANTES da escrita e a BLOQUEIA. A ordem importa mais do que
 * parece: quem programa recebe a regra no instante em que ia quebrá-la, com o
 * motivo junto, em vez de receber uma falha de teste sem contexto minutos
 * depois.
 *
 * A lista de termos NÃO mora aqui: mora em `regras-do-projeto.json`, lida
 * também por `tests/arquitetura/fronteiras.test.ts`. Duas cópias divergiriam em
 * silêncio — e há um teste que compara as duas leituras justamente por isso.
 *
 * Contrato do hook: JSON na entrada padrão; saída 2 bloqueia e o texto do erro
 * volta para o agente; saída 0 deixa passar.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const AQUI = dirname(fileURLToPath(import.meta.url))
const regras = JSON.parse(readFileSync(join(AQUI, 'regras-do-projeto.json'), 'utf8'))

/**
 * Lê o conteúdo SEM comentários.
 *
 * Esta linha é a lição que o teste de arquitetura já tinha aprendido do jeito
 * difícil: a primeira versão dele acusou `estado.ts` de tocar em `window`
 * porque a docstring do arquivo dizia "sem React, sem fetch, sem window". As
 * regras valem para CÓDIGO. Um hook que pune comentário ensina a apagar
 * explicação, que é o oposto do que este repositório quer.
 */
const semComentarios = (t) => t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ')

const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

let evento
try {
  evento = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  // Entrada que não entendo não é motivo para travar o trabalho de ninguém.
  process.exit(0)
}

const alvo = evento?.tool_input ?? {}
const caminhoBruto = alvo.file_path ?? ''

// Write traz o arquivo inteiro; Edit traz só o pedaço novo — que é justamente o
// que importa, porque o hook só precisa julgar o que está ENTRANDO.
const novo = [alvo.content, alvo.new_string, ...(alvo.edits ?? []).map((e) => e?.new_string)]
  .filter((x) => typeof x === 'string')
  .join('\n')

if (!caminhoBruto || !novo) process.exit(0)

const caminho = caminhoBruto.replace(/\\+/g, '/')
const dentroDe = (pasta) => caminho.includes(`/${pasta}`) || caminho.startsWith(pasta)

// Fora de src/ as duas regras não valem: mocks, testes, scripts e documentação
// PRECISAM poder nomear um tipo de documento.
if (!dentroDe('src/')) process.exit(0)

const codigo = semComentarios(novo)
const recusas = []

// --- Regra 3: uma única costura de rede ------------------------------------
if (!dentroDe('src/shared/api/') && /(?<!\w)fetch\s*\(/.test(codigo)) {
  recusas.push(
    'REGRA 3 do CLAUDE.md — nenhuma chamada de rede fora de src/shared/api/.\n' +
      `${regras.regra3_redeSoEmUmLugar.porque}\n` +
      'Escreva a chamada em src/shared/api/client.ts e consuma-a por um hook.',
  )
}

// --- Regra 2: nenhum tipo de documento no front-end ------------------------
if (!dentroDe('src/mocks/')) {
  const regra = regras.regra2_tiposDeDocumentoProibidos
  const achados = regra.termos.filter((t) => new RegExp(`\\b${escapar(t)}\\b`, 'i').test(codigo))
  if (achados.length > 0) {
    recusas.push(
      `REGRA 2 do CLAUDE.md — tipo de documento no front-end: ${achados.join(', ')}.\n` +
        `${regra.porque}\n` +
        `${regra.atencao}\n` +
        'O rótulo, os campos e a ordem vêm de GET /tipos-documento. Se o nome de' +
        ' um tipo é mesmo necessário, o lugar dele é src/mocks/.',
    )
  }
}

if (recusas.length > 0) {
  process.stderr.write(
    `Escrita bloqueada em ${caminho}\n\n${recusas.join('\n\n')}\n\n` +
      'A regra é mecânica de propósito: quebrá-la não produz um bug, produz um' +
      ' sistema que precisa de deploy toda vez que o fornecedor muda um prompt' +
      ' (fato f).\n',
  )
  process.exit(2)
}

process.exit(0)
