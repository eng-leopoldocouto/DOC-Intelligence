/**
 * SHA-256 do CONTEÚDO do arquivo (ADR-007).
 *
 * A identidade de um documento é o que ele contém, nunca como foi batizado.
 * O fato (b) garante nomes como "WhatsApp Image 2026-08-11 at 09.12.33.jpeg" e
 * "scan0001.pdf" — o segundo é nome de scanner e chega repetido para documentos
 * completamente diferentes.
 *
 * Calculado no cliente para que a duplicata não gaste banda nem chamada paga
 * ao modelo (fatos a e c).
 */
export async function sha256(arquivo: Blob): Promise<string> {
  const bytes = await arquivo.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
