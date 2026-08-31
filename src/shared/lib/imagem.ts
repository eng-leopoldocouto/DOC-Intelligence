/**
 * Normalização de imagem antes do envio (fato b).
 *
 * NÃO é coberto por teste automatizado: jsdom não decodifica imagem de
 * verdade, então um teste aqui passaria sem provar nada. Verificado à mão com
 * os documentos fictícios, incluindo a variante torta.
 * Ver docs/spec/06-plano-de-testes.md.
 */

export const TIPOS_ACEITOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

export const TAMANHO_MAXIMO = 20 * 1024 * 1024 // 20 MB antes da redução
export const LADO_MAXIMO = 2000 // px — preserva legibilidade de texto impresso

export const ehImagem = (arquivo: File): boolean => arquivo.type.startsWith('image/')

/**
 * HEIC/HEIF é o formato padrão de câmera do iPhone e não é decodificado por
 * todos os navegadores. Risco registrado e NÃO resolvido — ver
 * docs/spec/05-fatos-do-ambiente.md, fato (b).
 */
export const ehHeic = (arquivo: File): boolean =>
  /heic|heif/i.test(arquivo.type) || /\.hei[cf]$/i.test(arquivo.name)

/**
 * Reduz a imagem preservando a orientação EXIF.
 *
 * Sem `imageOrientation: 'from-image'`, a foto de celular aparece deitada — e o
 * conferente recusa um documento perfeitamente legível porque não consegue lê-lo.
 *
 * Uma foto típica de 8 MB sai em torno de 600 KB. Em dia de pico (fato e), essa
 * é a diferença entre o uplink do escritório aguentar e não aguentar.
 */
export async function reduzirImagem(arquivo: File, ladoMaximo = LADO_MAXIMO): Promise<File> {
  if (!ehImagem(arquivo)) return arquivo

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
  } catch {
    // Navegador sem suporte, ou formato que ele não decodifica: segue o
    // original. Reduzir é otimização; falhar aqui não pode impedir o envio.
    return arquivo
  }

  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  if (escala === 1) return arquivo

  const largura = Math.round(bitmap.width * escala)
  const altura = Math.round(bitmap.height * escala)
  const canvas = new OffscreenCanvas(largura, altura)
  const ctx = canvas.getContext('2d')
  if (!ctx) return arquivo

  ctx.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close()

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })
  // Só troca se realmente ficou menor — reamostragem pode inflar imagem já comprimida.
  if (blob.size >= arquivo.size) return arquivo

  return new File([blob], arquivo.name, { type: 'image/jpeg', lastModified: arquivo.lastModified })
}
