/**
 * Composição do nome padronizado (RF-11, ADR-013).
 *
 * O nome é DERIVADO dos campos extraídos. Se os campos são incertos a ponto de
 * exigir conferência, o nome herda essa incerteza — por isso ele é proposta
 * editável, e não regra imposta.
 *
 * Domínio puro (G6).
 */
import type { CampoExtraido } from './tipos'

/**
 * O resultado vira nome de arquivo, então precisa sobreviver a qualquer
 * sistema de arquivos: sem acento, sem espaço, sem pontuação exótica.
 */
const normalizar = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacríticos
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_-]/g, '')

const dataCompacta = (agora: Date): string =>
  `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(
    agora.getDate(),
  ).padStart(2, '0')}`

/**
 * Marcador para campo ausente ou vazio.
 *
 * `RG_FULANO__.jpg` esconde a lacuna. `RG_FULANO_SEM-ORGAO.jpg` mostra ao
 * conferente exatamente o que faltou. Defeito visível é sempre melhor que
 * defeito silencioso.
 */
const marcadorDeAusencia = (chave: string): string => `SEM-${normalizar(chave)}`

export function comporNomePadronizado(
  padrao: string | null | undefined,
  campos: CampoExtraido[],
  rotuloDoTipo: string,
  agora: Date = new Date(),
): string {
  if (!padrao) {
    return `${normalizar(rotuloDoTipo)}_${dataCompacta(agora)}`
  }

  const porChave = new Map(campos.map((c) => [c.chave, c.valor]))

  return padrao.replace(/\{(\w+)\}/g, (_, chave: string) => {
    if (chave === 'tipo') return normalizar(rotuloDoTipo)
    const valor = porChave.get(chave)
    if (valor === undefined || valor === null || valor.trim() === '') {
      return marcadorDeAusencia(chave)
    }
    return normalizar(valor)
  })
}
