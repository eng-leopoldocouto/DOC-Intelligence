/**
 * O anúncio das transições (fatos a e e).
 *
 * O que este teste protege não é a existência da região `aria-live` — é o
 * FORMATO dela. Duas coisas quebrariam em silêncio: anunciar a cada consulta
 * (o leitor de tela vira alarme e a pessoa desliga o recurso) e anunciar
 * identificando o documento (o nome padronizado contém o nome da pessoa).
 */
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAnuncioDeTransicoes } from '@/features/processing/useAnuncioDeTransicoes'
import type { EstadoDocumento } from '@/entities/documento/tipos'

const rotulo = (e: EstadoDocumento) => ({
  RECEBIDO: 'Recebido',
  EM_PROCESSAMENTO: 'Processando',
  AGUARDANDO_CONFERENCIA: 'Aguardando conferência',
  EM_CONFERENCIA: 'Em conferência',
  PRONTO: 'Pronto',
  FALHOU: 'Falhou',
  EXPIRADO: 'Sem resposta',
  REJEITADO: 'Rejeitado',
}[e])

const render = (inicial: Record<string, EstadoDocumento>) =>
  renderHook(({ mapa }) => useAnuncioDeTransicoes(mapa, rotulo), {
    initialProps: { mapa: inicial },
  })

describe('useAnuncioDeTransicoes', () => {
  it('não anuncia a primeira leitura — abrir a tela não é transição', () => {
    const { result } = render({ 'doc-1': 'EM_PROCESSAMENTO', 'doc-2': 'PRONTO' })
    expect(result.current).toBe('')
  })

  it('não anuncia quando nada muda, mesmo com nova consulta', () => {
    const { result, rerender } = render({ 'doc-1': 'EM_PROCESSAMENTO' })
    rerender({ mapa: { 'doc-1': 'EM_PROCESSAMENTO' } })
    rerender({ mapa: { 'doc-1': 'EM_PROCESSAMENTO' } })
    expect(result.current).toBe('')
  })

  it('anuncia agrupado por destino, sem identificar documento algum', () => {
    const { result, rerender } = render({
      'doc-1': 'EM_PROCESSAMENTO',
      'doc-2': 'EM_PROCESSAMENTO',
      'doc-3': 'EM_PROCESSAMENTO',
    })
    rerender({
      mapa: {
        'doc-1': 'AGUARDANDO_CONFERENCIA',
        'doc-2': 'AGUARDANDO_CONFERENCIA',
        'doc-3': 'FALHOU',
      },
    })

    expect(result.current).toBe(
      '2 documentos passaram para Aguardando conferência; 1 documento passou para Falhou.',
    )
    // A garantia que importa para a regra 4: nenhum identificador no anúncio.
    expect(result.current).not.toMatch(/doc-\d/)
  })

  it('documento novo na lista não conta como transição', () => {
    const { result, rerender } = render({ 'doc-1': 'PRONTO' })
    rerender({ mapa: { 'doc-1': 'PRONTO', 'doc-2': 'RECEBIDO' } })
    expect(result.current).toBe('')
  })
})
