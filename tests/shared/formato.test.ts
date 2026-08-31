import { describe, it, expect } from 'vitest'
import { formatarTempoDecorrido, formatarTamanho } from '@/shared/lib/formato'

const agora = new Date('2026-08-31T12:00:00Z')
const atras = (segundos: number) =>
  new Date(agora.getTime() - segundos * 1000).toISOString()

describe('tempo decorrido (RF-04: nunca barra de progresso)', () => {
  it('segundos', () => {
    expect(formatarTempoDecorrido(atras(12), agora)).toBe('12 s')
  })
  it('minutos', () => {
    expect(formatarTempoDecorrido(atras(150), agora)).toBe('2 min')
  })
  it('horas', () => {
    expect(formatarTempoDecorrido(atras(3900), agora)).toBe('1 h 5 min')
  })
  it('relógio adiantado no cliente não produz tempo negativo', () => {
    const futuro = new Date(agora.getTime() + 5000).toISOString()
    expect(formatarTempoDecorrido(futuro, agora)).toBe('0 s')
  })
})

describe('tamanho de arquivo', () => {
  it('formata em unidade legível', () => {
    expect(formatarTamanho(8_400_000)).toBe('8,0 MB')
    expect(formatarTamanho(612_000)).toBe('598 KB')
    expect(formatarTamanho(512)).toBe('512 B')
  })
})
