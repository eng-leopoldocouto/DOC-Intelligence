/**
 * O front-end NÃO conhece nenhum tipo de documento (G1, ADR-008).
 * Conhece apenas a FORMA de um tipo de documento — que é outra coisa.
 */
import type { components } from '@/shared/api/types.gen'

type S = components['schemas']

export type TipoDocumento = S['TipoDocumento']
export type DescritorDeCampo = S['DescritorDeCampo']
export type TipoDeDado = S['TipoDeDado']

export type CatalogoDeTipos = {
  itens: TipoDocumento[]
  limiarConfiancaPadrao: number
}

/** Índice por id, para resolver o tipo de um documento sem varrer a lista. */
export const indexarPorId = (itens: TipoDocumento[]): Record<string, TipoDocumento> =>
  Object.fromEntries(itens.map((t) => [t.id, t]))

/**
 * O limiar do tipo sobrepõe o padrão do catálogo.
 * Nunca há limiar no código do front-end (fato f): ele só compara.
 */
export const limiarDoTipo = (tipo: TipoDocumento | undefined, padrao: number): number =>
  tipo?.limiarConfianca ?? padrao
