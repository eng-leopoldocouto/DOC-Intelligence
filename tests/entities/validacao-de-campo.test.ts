/**
 * O segundo portão (ADR-015, fato a).
 *
 * Os dois casos que importam estão nomeados nos títulos: o que a versão antiga
 * deixava passar, e o que ela já pegava e precisa continuar pegando.
 *
 * Todos os números aqui são sintéticos e canônicos de teste — nenhum CPF ou
 * CNPJ deste arquivo pertence a alguém (regra 7 do CLAUDE.md).
 */
import { describe, it, expect } from 'vitest'
import {
  cnpjValido, cpfValido, dataPlausivel, formatoFecha, motivoDeConferencia,
} from '@/entities/documento/validacao-de-campo'
import type { CampoExtraido } from '@/entities/documento/tipos'

const CPF_VALIDO = '11144477735'
const CPF_INVALIDO = '11144477736'
const CPF_DO_MOCK = '00000000000'
const CNPJ_VALIDO = '11222333000181'
const CNPJ_INVALIDO = '11222333000182'

const LIMIAR = 0.85
const campo = (valor: string | null, confianca: number, origem: 'MODELO' | 'HUMANO' = 'MODELO'): CampoExtraido =>
  ({ chave: 'x', valor, confianca, origem })

describe('dígito verificador — a aritmética que não depende do fornecedor', () => {
  it('aceita CPF e CNPJ válidos', () => {
    expect(cpfValido(CPF_VALIDO)).toBe(true)
    expect(cpfValido('111.444.777-35')).toBe(true) // pontuado é o mesmo número
    expect(cnpjValido(CNPJ_VALIDO)).toBe(true)
  })

  it('recusa dígito verificador errado, tamanho errado e sequência repetida', () => {
    expect(cpfValido(CPF_INVALIDO)).toBe(false)
    expect(cpfValido('1114447773')).toBe(false)
    // Todos os dígitos iguais passam na conta e não são documento de ninguém.
    expect(cpfValido(CPF_DO_MOCK)).toBe(false)
    expect(cnpjValido(CNPJ_INVALIDO)).toBe(false)
    expect(cnpjValido('00000000000000')).toBe(false)
  })
})

describe('plausibilidade de data — o erro real é o dígito do ano', () => {
  const agora = new Date('2026-09-01T00:00:00Z')

  it('aceita data de calendário dentro da janela', () => {
    expect(dataPlausivel('1987-03-14', agora)).toBe(true)
    expect(dataPlausivel('2026-07-01', agora)).toBe(true)
  })

  it('recusa ano impossível, dia inexistente e formato fora do ISO', () => {
    expect(dataPlausivel('1087-03-14', agora)).toBe(false) // troca de dígito no ano
    expect(dataPlausivel('2926-03-14', agora)).toBe(false)
    expect(dataPlausivel('2026-02-31', agora)).toBe(false) // 31 de fevereiro
    expect(dataPlausivel('14/03/1987', agora)).toBe(false)
  })
})

describe('formatoFecha — o desconhecido nunca reprova', () => {
  it('tipo de dado sem regra conhecida passa', () => {
    expect(formatoFecha('qualquer coisa', 'TEXTO')).toBe(true)
    expect(formatoFecha('1234', 'NUMERO')).toBe(true)
    expect(formatoFecha('SSP/RN', 'SELECAO')).toBe(true)
  })

  it('vazio passa — ausência é assunto de obrigatoriedade, não de formato', () => {
    expect(formatoFecha('', 'CPF')).toBe(true)
    expect(formatoFecha(null, 'CPF')).toBe(true)
  })
})

describe('motivoDeConferencia — os dois casos que importam', () => {
  it('ALTA confiança + formato inválido vai para conferência (era o buraco)', () => {
    // Exatamente o cenário da ADR-015: o modelo diz 0,97 e o número não fecha.
    expect(motivoDeConferencia(campo(CPF_INVALIDO, 0.97), 'CPF', LIMIAR)).toBe('FORMATO_INVALIDO')
    expect(motivoDeConferencia(campo('1087-03-14', 0.99), 'DATA', LIMIAR)).toBe('FORMATO_INVALIDO')
  })

  it('BAIXA confiança + formato válido continua indo, pelo motivo antigo', () => {
    expect(motivoDeConferencia(campo(CPF_VALIDO, 0.4), 'CPF', LIMIAR)).toBe('CONFIANCA_BAIXA')
    expect(motivoDeConferencia(campo('qualquer', 0.4), 'TEXTO', LIMIAR)).toBe('CONFIANCA_BAIXA')
  })

  it('alta confiança e formato válido não pede olho humano', () => {
    expect(motivoDeConferencia(campo(CPF_VALIDO, 0.97), 'CPF', LIMIAR)).toBeNull()
  })

  it('quando os dois portões acusam, o motivo é o FORMATO — é o verificável', () => {
    expect(motivoDeConferencia(campo(CPF_INVALIDO, 0.2), 'CPF', LIMIAR)).toBe('FORMATO_INVALIDO')
  })

  it('campo corrigido por PESSOA some da dúvida por confiança, mas não da inválida', () => {
    // A opinião do modelo perdeu a relevância quando alguém conferiu...
    expect(motivoDeConferencia(campo(CPF_VALIDO, 1, 'HUMANO'), 'CPF', LIMIAR)).toBeNull()
    // ...mas quem digitou o CPF errado AGORA foi a pessoa, e nenhum outro
    // mecanismo desta interface pega esse erro.
    expect(motivoDeConferencia(campo(CPF_INVALIDO, 1, 'HUMANO'), 'CPF', LIMIAR)).toBe('FORMATO_INVALIDO')
  })

  it('confiança AUSENTE continua contando como insuficiente', () => {
    // O contrato declara `CampoExtraido.confianca` como number NÃO anulável, e
    // por isso este caso não deveria existir. A defesa em `precisaConferencia`
    // é deliberada mesmo assim: tratar ausência como confiança alta deixaria
    // documento não processado passar por pronto, que é o modo de falha mais
    // caro deste sistema porque é silencioso. O molde abaixo força o caso que o
    // tipo proíbe, para provar que a defesa está de pé e não é comentário.
    const semConfianca = { chave: 'x', valor: CPF_VALIDO, confianca: null, origem: 'MODELO' } as unknown as CampoExtraido
    expect(motivoDeConferencia(semConfianca, 'CPF', LIMIAR)).toBe('CONFIANCA_BAIXA')
  })
})
