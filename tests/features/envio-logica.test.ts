/**
 * @vitest-environment node
 *
 * Lógica de envio, sem DOM. Ver nota em tests/mocks/contrato.test.ts sobre
 * por que Blob/File nativos do Node são mais fiéis ao navegador aqui.
 */
import { describe, it, expect } from 'vitest'
import { validar } from '@/features/upload/validacao'
import { dedupNoLote } from '@/features/upload/deduplicacao'
import { executarComConcorrencia } from '@/features/upload/filaDeEnvio'

const arq = (nome: string, tipo: string, conteudo = 'x', tamanhoForcado?: number): File => {
  const f = new File([conteudo], nome, { type: tipo })
  if (tamanhoForcado !== undefined) {
    Object.defineProperty(f, 'size', { value: tamanhoForcado })
  }
  return f
}

describe('RF-02 — validação local é controle de custo (fatos a e b)', () => {
  it('aceita os formatos que o modelo consegue ler', () => {
    expect(validar(arq('a.jpg', 'image/jpeg')).ok).toBe(true)
    expect(validar(arq('a.png', 'image/png')).ok).toBe(true)
    expect(validar(arq('scan0001.pdf', 'application/pdf')).ok).toBe(true)
  })

  it('recusa formato não suportado ANTES de qualquer requisição', () => {
    const r = validar(arq('peticao.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
    expect(r.ok).toBe(false)
  })

  it('toda recusa diz o que fazer, não só o que falhou', () => {
    const casos = [
      arq('a.docx', 'application/msword'),
      arq('foto.heic', 'image/heic'),
      arq('vazio.pdf', 'application/pdf', ''),
    ]
    for (const caso of casos) {
      const r = validar(caso)
      expect(r.ok).toBe(false)
      if (!r.ok) {
        expect(r.comoResolver.length).toBeGreaterThan(10)
      }
    }
  })

  it('HEIC do iPhone é recusado com instrução acionável (risco registrado, fato b)', () => {
    const r = validar(arq('IMG_0042.HEIC', ''))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.comoResolver).toMatch(/Mais compatível/i)
  })

  it('imagem acima do limite passa (será reduzida); PDF acima não', () => {
    expect(validar(arq('foto.jpg', 'image/jpeg', 'x', 30 * 1024 * 1024)).ok).toBe(true)
    expect(validar(arq('grande.pdf', 'application/pdf', 'x', 30 * 1024 * 1024)).ok).toBe(false)
  })
})

describe('RF-03 — deduplicação dentro do lote (fatos a e c)', () => {
  it('o mesmo arquivo arrastado duas vezes vira um item só', async () => {
    const a = arq('scan0001.pdf', 'application/pdf', 'mesmo conteudo')
    const b = arq('copia.pdf', 'application/pdf', 'mesmo conteudo')
    const r = await dedupNoLote([a, b])

    expect(r.unicos).toHaveLength(1)
    expect(r.descartados).toHaveLength(1)
    expect(r.descartados[0]!.duplicaDe).toBe('scan0001.pdf')
  })

  it('mesmo NOME com conteúdos diferentes NÃO é duplicata', async () => {
    const r = await dedupNoLote([
      arq('scan0001.pdf', 'application/pdf', 'comprovante'),
      arq('scan0001.pdf', 'application/pdf', 'contracheque'),
    ])
    expect(r.unicos).toHaveLength(2)
    expect(r.descartados).toHaveLength(0)
  })

  it('mantém o primeiro, de forma determinística', async () => {
    const r = await dedupNoLote([
      arq('primeiro.pdf', 'application/pdf', 'igual'),
      arq('segundo.pdf', 'application/pdf', 'igual'),
      arq('terceiro.pdf', 'application/pdf', 'igual'),
    ])
    expect(r.unicos[0]!.arquivo.name).toBe('primeiro.pdf')
    expect(r.descartados.map((d) => d.arquivo.name)).toEqual(['segundo.pdf', 'terceiro.pdf'])
  })
})

describe('RF-01 — concorrência limitada (fato e)', () => {
  it('nunca ultrapassa o máximo de tarefas simultâneas', async () => {
    let emVoo = 0
    let pico = 0
    const tarefas = Array.from({ length: 12 }, () => async () => {
      emVoo++
      pico = Math.max(pico, emVoo)
      await new Promise((r) => setTimeout(r, 5))
      emVoo--
      return 'ok'
    })

    await executarComConcorrencia(tarefas, 3)
    expect(pico).toBeLessThanOrEqual(3)
  })

  it('T-06: a falha de um item não derruba os outros', async () => {
    const tarefas = [
      async () => 'a',
      async () => { throw new Error('rede caiu') },
      async () => 'c',
      async () => 'd',
    ]
    const r = await executarComConcorrencia(tarefas, 2)

    expect(r.map((x) => x.status)).toEqual(['fulfilled', 'rejected', 'fulfilled', 'fulfilled'])
    expect(r.filter((x) => x.status === 'fulfilled')).toHaveLength(3)
  })

  it('preserva a ordem dos resultados mesmo com conclusões fora de ordem', async () => {
    const atrasos = [30, 5, 20, 1]
    const tarefas = atrasos.map((ms, i) => async () => {
      await new Promise((r) => setTimeout(r, ms))
      return i
    })
    const r = await executarComConcorrencia(tarefas, 4)
    expect(r.map((x) => (x.status === 'fulfilled' ? x.value : null))).toEqual([0, 1, 2, 3])
  })
})
