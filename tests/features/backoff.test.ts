import { describe, it, expect } from 'vitest'
import { intervaloDeBackoff, intervaloDoLote } from '@/features/processing/backoff'

const agora = new Date('2026-08-31T09:30:00Z')
const atras = (s: number) => new Date(agora.getTime() - s * 1000).toISOString()

describe('RF-04 — backoff cresce com o tempo decorrido (fatos a e e)', () => {
  it('consulta de perto nos primeiros 30 s', () => {
    expect(intervaloDeBackoff(0)).toBe(2_000)
    expect(intervaloDeBackoff(29_999)).toBe(2_000)
  })

  it('afrouxa entre 30 s e 2 min', () => {
    expect(intervaloDeBackoff(30_000)).toBe(5_000)
    expect(intervaloDeBackoff(119_999)).toBe(5_000)
  })

  it('afrouxa mais depois de 2 min', () => {
    expect(intervaloDeBackoff(120_000)).toBe(15_000)
    expect(intervaloDeBackoff(10 * 60_000)).toBe(15_000)
  })
})

describe('intervalo do lote', () => {
  it('sem documentos, não consulta', () => {
    expect(intervaloDoLote([], agora)).toBe(0)
  })

  it('usa o documento MAIS NOVO — é ele que ainda pode responder rápido', () => {
    // Um enviado há 5 min e outro agora: se usássemos o mais antigo,
    // esperaríamos 15 s para ver o resultado do recém-enviado.
    expect(intervaloDoLote([atras(300), atras(2)], agora)).toBe(2_000)
  })

  it('lote inteiro antigo consulta devagar', () => {
    expect(intervaloDoLote([atras(300), atras(400)], agora)).toBe(15_000)
  })
})
