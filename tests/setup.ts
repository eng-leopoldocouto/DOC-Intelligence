import '@testing-library/jest-dom/vitest'

/**
 * jsdom não implementa Blob.arrayBuffer(), que é padrão e existe em todos os
 * navegadores reais. É lacuna do ambiente de teste, não do produto — por isso
 * o polyfill vive aqui, e não dentro de src/.
 *
 * Contorcer o código de produção para acomodar limitação de jsdom seria
 * escrever para o teste em vez de para o navegador.
 */
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader()
      leitor.onload = () => resolve(leitor.result as ArrayBuffer)
      leitor.onerror = () => reject(leitor.error)
      leitor.readAsArrayBuffer(this)
    })
  }
}
