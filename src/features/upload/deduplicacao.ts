/**
 * Deduplicação DENTRO do lote selecionado (RF-03, primeira camada).
 *
 * A segunda camada é do servidor, que responde 200 com `duplicado: true`.
 * Esta primeira existe para que o arquivo repetido nem chegue a subir: em dia
 * de pico, com fotos de celular, isso é banda que o escritório não tem
 * sobrando (fatos c e e).
 */
import { sha256 } from '@/shared/lib/hash'

export type ArquivoComHash = { arquivo: File; contentHash: string }

export type ResultadoDedup = {
  unicos: ArquivoComHash[]
  descartados: { arquivo: File; duplicaDe: string }[]
}

export async function dedupNoLote(arquivos: File[]): Promise<ResultadoDedup> {
  const unicos: ArquivoComHash[] = []
  const descartados: { arquivo: File; duplicaDe: string }[] = []
  const vistos = new Map<string, File>()

  for (const arquivo of arquivos) {
    const contentHash = await sha256(arquivo)
    const anterior = vistos.get(contentHash)
    if (anterior) {
      // Mantém o PRIMEIRO. A pessoa arrastou o mesmo arquivo duas vezes;
      // qual das duas cópias fica é indiferente, mas precisa ser determinístico.
      descartados.push({ arquivo, duplicaDe: anterior.name })
      continue
    }
    vistos.set(contentHash, arquivo)
    unicos.push({ arquivo, contentHash })
  }

  return { unicos, descartados }
}
