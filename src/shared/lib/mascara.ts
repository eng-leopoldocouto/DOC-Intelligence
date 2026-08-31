/**
 * Mascaramento de documento na listagem (fato d, ADR-010).
 *
 * Na LISTAGEM o número é contexto: basta o suficiente para a pessoa reconhecer
 * a linha. Na CONFERÊNCIA ele é o objeto do trabalho e aparece inteiro — quem
 * confere precisa lê-lo contra a imagem.
 */
export type TipoDeDocumentoIdentificador = 'CPF' | 'CNPJ'

const MASCARA_TOTAL: Record<TipoDeDocumentoIdentificador, string> = {
  CPF: '***.***.***-**',
  CNPJ: '**.***.***/****-**',
}

const DIGITOS: Record<TipoDeDocumentoIdentificador, number> = { CPF: 11, CNPJ: 14 }

const somenteDigitos = (valor: string): string => valor.replace(/\D/g, '')

/**
 * Valor fora do formato vira máscara TOTAL, nunca parcial.
 *
 * Mascarar por posição num valor mais curto que o esperado pode acabar
 * revelando tudo. Sendo dado pessoal, o erro deve pender para o seguro.
 */
export function mascararDocumento(
  valor: string,
  tipo: TipoDeDocumentoIdentificador,
): string {
  const d = somenteDigitos(valor)
  if (d.length !== DIGITOS[tipo]) return MASCARA_TOTAL[tipo]

  return tipo === 'CPF'
    ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
    : `**.***.${d.slice(5, 8)}/${d.slice(8, 12)}-**`
}

/** Formatação sem mascarar — usada na conferência e ao revelar sob demanda. */
export function formatarDocumento(
  valor: string,
  tipo: TipoDeDocumentoIdentificador,
): string {
  const d = somenteDigitos(valor)
  if (d.length !== DIGITOS[tipo]) return valor // não força formato em valor incompleto

  return tipo === 'CPF'
    ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
    : `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
