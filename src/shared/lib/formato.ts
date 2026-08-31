/** Formatação para exibição. Domínio-adjacente, sem dependência de React. */

/**
 * Tempo decorrido desde o recebimento (RF-04).
 *
 * A interface mostra tempo decorrido e NUNCA barra de progresso: o modelo leva
 * de 5 a 40 segundos e não informa progresso. Uma barra aqui seria invenção, e
 * o operador aprende rápido a não confiar nela.
 */
export function formatarTempoDecorrido(desde: string, agora: Date = new Date()): string {
  // Relógio do cliente adiantado não pode produzir tempo negativo.
  const s = Math.max(0, Math.floor((agora.getTime() - new Date(desde).getTime()) / 1000))

  if (s < 60) return `${s} s`
  if (s < 3600) return `${Math.floor(s / 60)} min`

  const h = Math.floor(s / 3600)
  const min = Math.floor((s % 3600) / 60)
  return min === 0 ? `${h} h` : `${h} h ${min} min`
}

/** Tamanho de arquivo. Usado para mostrar o ganho da redução no cliente (fato b). */
export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/** Data e hora em português, para "já enviado em ..." (fato c). */
export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}
