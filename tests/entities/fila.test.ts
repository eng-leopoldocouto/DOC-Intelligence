/**
 * Pressão da fila (fato e).
 *
 * O que este teste protege é a honestidade do cabeçalho: ele não pode dizer
 * "está tudo bem" quando o mais antigo espera desde as nove da manhã.
 */
import { describe, it, expect } from 'vitest'
import { LIMITE_DE_ESPERA_MIN, LIMITE_DE_ITENS, pressaoDaFila } from '@/entities/documento/fila'

const agora = new Date('2026-09-01T12:00:00Z')
const minutosAtras = (m: number) => new Date(agora.getTime() - m * 60_000).toISOString()

describe('pressaoDaFila', () => {
  it('fila vazia não tem espera nem tensão', () => {
    expect(pressaoDaFila(0, undefined, agora)).toEqual({ esperaDoMaisAntigoMin: null, tensa: false })
  })

  it('mede a espera do mais antigo em minutos', () => {
    expect(pressaoDaFila(3, minutosAtras(47), agora).esperaDoMaisAntigoMin).toBe(47)
  })

  it('fila curta e recente não é tensa', () => {
    expect(pressaoDaFila(LIMITE_DE_ITENS - 1, minutosAtras(10), agora).tensa).toBe(false)
  })

  it('quantidade acima do limite deixa a fila tensa, mesmo tudo recente', () => {
    expect(pressaoDaFila(LIMITE_DE_ITENS, minutosAtras(1), agora).tensa).toBe(true)
  })

  it('espera longa deixa a fila tensa, mesmo com poucos itens', () => {
    // Um único documento parado desde as nove da manhã é um problema, e a
    // contagem sozinha nunca o mostraria.
    expect(pressaoDaFila(1, minutosAtras(LIMITE_DE_ESPERA_MIN), agora).tensa).toBe(true)
  })
})
