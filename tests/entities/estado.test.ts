import { describe, it, expect } from 'vitest'
import {
  transicaoValida,
  precisaConferencia,
  campoAbaixoDoLimiar,
  ehTerminal,
} from '@/entities/documento/estado'
import type { CampoExtraido } from '@/entities/documento/tipos'

describe('máquina de estados (03-modelo-de-dominio.md)', () => {
  it('permite RECEBIDO -> EM_PROCESSAMENTO', () => {
    expect(transicaoValida('RECEBIDO', 'EM_PROCESSAMENTO')).toBe(true)
  })

  it('invariante 1: não se pula a conferência', () => {
    expect(transicaoValida('AGUARDANDO_CONFERENCIA', 'PRONTO')).toBe(false)
    expect(transicaoValida('AGUARDANDO_CONFERENCIA', 'EM_CONFERENCIA')).toBe(true)
    expect(transicaoValida('EM_CONFERENCIA', 'PRONTO')).toBe(true)
  })

  it('invariante 5: REJEITADO é terminal', () => {
    expect(transicaoValida('REJEITADO', 'EM_PROCESSAMENTO')).toBe(false)
    expect(transicaoValida('REJEITADO', 'PRONTO')).toBe(false)
    expect(ehTerminal('REJEITADO')).toBe(true)
    expect(ehTerminal('PRONTO')).toBe(true)
  })

  it('invariante 4: falha só volta a processar por ação explícita', () => {
    expect(transicaoValida('FALHOU', 'EM_PROCESSAMENTO')).toBe(true)
    expect(transicaoValida('EXPIRADO', 'EM_PROCESSAMENTO')).toBe(true)
  })

  it('a conferência pode ser devolvida à fila (reserva expirada)', () => {
    expect(transicaoValida('EM_CONFERENCIA', 'AGUARDANDO_CONFERENCIA')).toBe(true)
  })
})

describe('portão de confiança (invariante 1, comportamento 4 do produto)', () => {
  it('abaixo do limiar exige conferência', () => {
    expect(precisaConferencia(0.62, 0.85)).toBe(true)
  })

  it('no limiar ou acima, não exige', () => {
    expect(precisaConferencia(0.85, 0.85)).toBe(false)
    expect(precisaConferencia(0.99, 0.85)).toBe(false)
  })

  it('confiança AUSENTE sempre exige conferência', () => {
    // O modo de falha que este teste protege: tratar ausência de confiança
    // como confiança alta deixaria documento não processado passar por pronto.
    expect(precisaConferencia(null, 0.85)).toBe(true)
    expect(precisaConferencia(undefined, 0.85)).toBe(true)
  })
})

describe('confiança por campo (não só do documento)', () => {
  const campo = (confianca: number): CampoExtraido => ({
    chave: 'numero',
    valor: '12.345.678-9',
    confianca,
    origem: 'MODELO',
  })

  it('destaca o campo abaixo do limiar', () => {
    expect(campoAbaixoDoLimiar(campo(0.42), 0.85)).toBe(true)
    expect(campoAbaixoDoLimiar(campo(0.91), 0.85)).toBe(false)
  })

  it('campo corrigido por humano nunca aparece como duvidoso', () => {
    const corrigido: CampoExtraido = { ...campo(0.1), origem: 'HUMANO' }
    expect(campoAbaixoDoLimiar(corrigido, 0.85)).toBe(false)
  })
})
