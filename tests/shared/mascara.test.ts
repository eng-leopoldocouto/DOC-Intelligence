import { describe, it, expect } from 'vitest'
import { mascararDocumento, formatarDocumento } from '@/shared/lib/mascara'

describe('mascaramento na listagem (fato d, ADR-010)', () => {
  it('mascara CPF preservando só o suficiente para reconhecer', () => {
    expect(mascararDocumento('12345678901', 'CPF')).toBe('***.456.789-**')
    expect(mascararDocumento('123.456.789-01', 'CPF')).toBe('***.456.789-**')
  })

  it('valor fora do formato vira máscara TOTAL, não parcial', () => {
    // Mascarar por posição num valor curto pode revelar tudo. Na dúvida,
    // esconde inteiro: é dado pessoal, e o erro deve pender para o seguro.
    expect(mascararDocumento('123', 'CPF')).toBe('***.***.***-**')
    expect(mascararDocumento('', 'CPF')).toBe('***.***.***-**')
  })

  it('mascara CNPJ', () => {
    expect(mascararDocumento('12345678000195', 'CNPJ')).toBe('**.***.678/0001-**')
    expect(mascararDocumento('123', 'CNPJ')).toBe('**.***.***/****-**')
  })

  it('formata sem mascarar quando a pessoa revela sob demanda', () => {
    expect(formatarDocumento('12345678901', 'CPF')).toBe('123.456.789-01')
    expect(formatarDocumento('12345678000195', 'CNPJ')).toBe('12.345.678/0001-95')
  })

  it('formatação preserva o valor original se ele não couber no formato', () => {
    expect(formatarDocumento('123', 'CPF')).toBe('123')
  })
})
