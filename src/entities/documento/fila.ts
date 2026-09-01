/**
 * Pressão da fila de conferência (fato e).
 *
 * Domínio puro (G6): sem React, sem fetch, sem window.
 *
 * ## O buraco que isto fecha
 *
 * A carta de fechamento diz, sobre multiplicar o volume por dez, que *"a fila
 * não drena e nada na minha interface avisa o gestor"*. A segunda metade dessa
 * frase era um defeito, não um limite: a interface tinha os dados na mão e não
 * os mostrava.
 *
 * ## De onde vêm os dois limites — e por que não os inventei
 *
 * O enunciado dá os números: **quatro minutos por documento** no trabalho manual
 * e **duas pessoas** podendo abrir a fila ao mesmo tempo (fato g). Quatro
 * minutos por documento, duas pessoas, é uma vazão de **cerca de 30 documentos
 * por hora** — e conferir é mais rápido que digitar do zero, então 30 é
 * conservador na direção segura.
 *
 * - `LIMITE_DE_ITENS = 30` — acima disso, há mais de uma hora de trabalho
 *   parado na fila para a equipe inteira.
 * - `LIMITE_DE_ESPERA_MIN = 60` — acima disso, o documento mais antigo já não
 *   será conferido na hora em que chegou.
 *
 * ## Onde estes números DEVERIAM morar
 *
 * No servidor, ao lado de `limiarConfiancaPadrao`, pelo mesmo motivo do fato
 * (f): o escritório vai contratar mais gente, ou menos, e calibrar isso não
 * pode custar um deploy do front-end. Não os movi para o contrato nesta rodada
 * porque a instrução era não inventar endpoint — fica declarado como risco
 * residual em `05-fatos-do-ambiente.md`, fato (e).
 */

export const LIMITE_DE_ITENS = 30
export const LIMITE_DE_ESPERA_MIN = 60

export type PressaoDaFila = {
  /** Minutos de espera do MAIS ANTIGO. `null` quando a fila está vazia. */
  esperaDoMaisAntigoMin: number | null
  /** Algum dos dois limites foi ultrapassado. */
  tensa: boolean
}

/**
 * A fila chega ordenada por chegada, mais antigo primeiro (`handlers.ts` ordena
 * por `recebidoEm`), então o mais antigo é o primeiro item da primeira página —
 * e isso continua exato mesmo com paginação por cursor. A CONTAGEM, essa sim, é
 * do que foi carregado: quem chama sabe disso e indica com `temMais`.
 */
export function pressaoDaFila(
  quantidadeCarregada: number,
  maisAntigoRecebidoEm: string | undefined,
  agora: Date = new Date(),
): PressaoDaFila {
  const espera = maisAntigoRecebidoEm
    ? Math.max(0, Math.floor((agora.getTime() - new Date(maisAntigoRecebidoEm).getTime()) / 60_000))
    : null

  return {
    esperaDoMaisAntigoMin: espera,
    tensa: quantidadeCarregada >= LIMITE_DE_ITENS || (espera !== null && espera >= LIMITE_DE_ESPERA_MIN),
  }
}
