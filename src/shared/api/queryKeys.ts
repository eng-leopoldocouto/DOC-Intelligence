/**
 * Chaves de cache centralizadas.
 *
 * Ficam num arquivo só porque, espalhadas, viram acoplamento implícito entre
 * telas: a tela A invalida uma chave que a tela B escreveu com outro formato,
 * e o cache passa a mentir em silêncio.
 */
export const queryKeys = {
  tipos: ['tipos-documento'] as const,
  documentos: ['documentos'] as const,
  documento: (id: string) => ['documentos', id] as const,
  fila: () => ['documentos', 'fila'] as const,
  arquivo: (id: string) => ['documentos', id, 'arquivo'] as const,

  /**
   * `slice().sort()` é essencial: sem ordenar, os mesmos ids em ordem diferente
   * viram DUAS entradas de cache e o polling em lote se duplica sozinho —
   * exatamente o que o fato (e) manda evitar.
   */
  statusLote: (ids: string[]) => ['documentos', 'status', ...ids.slice().sort()] as const,
} as const
