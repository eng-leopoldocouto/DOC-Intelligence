/**
 * Fila de envio com concorrência limitada (RF-01, fato e).
 *
 * Enviar 40 arquivos em paralelo satura o uplink do escritório e faz todos
 * falharem juntos — justamente no pico das 9h às 11h.
 */
export const CONCORRENCIA_MAXIMA = 3

export async function executarComConcorrencia<T>(
  tarefas: (() => Promise<T>)[],
  maximo: number = CONCORRENCIA_MAXIMA,
): Promise<PromiseSettledResult<T>[]> {
  const resultados = new Array<PromiseSettledResult<T>>(tarefas.length)
  let proxima = 0

  const trabalhador = async (): Promise<void> => {
    while (proxima < tarefas.length) {
      const i = proxima++
      // Cada item é resolvido isoladamente: a falha de um NUNCA aborta os
      // outros. Um lote inteiro reenviado por causa de um arquivo é custo
      // multiplicado (fato a).
      resultados[i] = await tarefas[i]!().then(
        (value): PromiseFulfilledResult<T> => ({ status: 'fulfilled', value }),
        (reason: unknown): PromiseRejectedResult => ({ status: 'rejected', reason }),
      )
    }
  }

  const trabalhadores = Array.from(
    { length: Math.min(maximo, tarefas.length) },
    trabalhador,
  )
  await Promise.all(trabalhadores)
  return resultados
}
