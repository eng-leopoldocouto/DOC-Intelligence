import { describe, it, expect } from 'vitest'
import { comporNomePadronizado } from '@/entities/documento/nome'
import type { CampoExtraido } from '@/entities/documento/tipos'

const campos: CampoExtraido[] = [
  { chave: 'nome', valor: 'Fulano de Tal da Silva', confianca: 0.9, origem: 'MODELO' },
  { chave: 'numero', valor: '12.345.678-9', confianca: 0.7, origem: 'MODELO' },
]

describe('composição do nome padronizado (RF-11, ADR-013)', () => {
  it('substitui as chaves do padrão e normaliza', () => {
    expect(comporNomePadronizado('{tipo}_{nome}_{numero}', campos, 'RG'))
      .toBe('RG_FULANO_DE_TAL_DA_SILVA_12345678-9')
  })

  it('remove acentuação, porque o nome vira nome de arquivo', () => {
    const comAcento: CampoExtraido[] = [
      { chave: 'nome', valor: 'João Conceição Ávila', confianca: 0.9, origem: 'MODELO' },
    ]
    expect(comporNomePadronizado('{nome}', comAcento, 'RG')).toBe('JOAO_CONCEICAO_AVILA')
  })

  it('campo ausente vira marcador VISÍVEL, não string vazia', () => {
    // RG_FULANO__.jpg esconde a lacuna; RG_FULANO_SEM-ORGAO.jpg mostra
    // para quem confere. É a diferença entre um defeito silencioso e um visível.
    expect(comporNomePadronizado('{tipo}_{nome}_{orgao}', campos, 'RG'))
      .toBe('RG_FULANO_DE_TAL_DA_SILVA_SEM-ORGAO')
  })

  it('campo presente porém vazio também vira marcador', () => {
    const comVazio: CampoExtraido[] = [
      { chave: 'nome', valor: '', confianca: 0.2, origem: 'MODELO' },
    ]
    expect(comporNomePadronizado('{nome}', comVazio, 'RG')).toBe('SEM-NOME')
  })

  it('sem padrão definido, cai no rótulo do tipo mais a data', () => {
    expect(comporNomePadronizado(null, campos, 'Comprovante de Residência'))
      .toMatch(/^COMPROVANTE_DE_RESIDENCIA_\d{8}$/)
  })
})
