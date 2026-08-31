/**
 * Identidade da pessoa que está usando a interface (ADR-011).
 *
 * NÃO fazemos login. O sistema interno que hospeda esta interface autentica a
 * pessoa e injeta a identidade na página; nós apenas a lemos e repassamos como
 * cabeçalho para a API.
 *
 * A AUSÊNCIA de identidade é caminho válido, não erro: o claim degrada para
 * anônimo e a fila passa a mostrar "em conferência por outra sessão". Ainda
 * evita trabalho duplicado (fato g); perde só a informação de a quem recorrer.
 */
export type Identidade = { id: string; nome: string | null } | null

declare global {
  interface Window {
    __CONTEXTO_HOST__?: { usuarioId?: string; usuarioNome?: string }
  }
}

export function identidadeAtual(): Identidade {
  // 1. Injetada pelo host em produção
  const doHost = typeof window !== 'undefined' ? window.__CONTEXTO_HOST__ : undefined
  if (doHost?.usuarioId) {
    return { id: doHost.usuarioId, nome: doHost.usuarioNome ?? null }
  }

  // 2. Em desenvolvimento, do .env — deixe em branco para exercitar o
  //    caminho anônimo, que é comportamento de produção legítimo.
  const id = import.meta.env['VITE_USUARIO_ID'] as string | undefined
  if (id) {
    return { id, nome: (import.meta.env['VITE_USUARIO_NOME'] as string | undefined) ?? null }
  }

  return null
}

export function cabecalhosDeIdentidade(): Record<string, string> {
  const identidade = identidadeAtual()
  if (!identidade) return {}
  return {
    'X-Usuario-Id': identidade.id,
    ...(identidade.nome ? { 'X-Usuario-Nome': identidade.nome } : {}),
  }
}
