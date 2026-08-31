import '@testing-library/jest-dom/vitest'
import { Blob as BlobNode, File as FileNode } from 'node:buffer'

/**
 * O jsdom traz implementações próprias de Blob e File que o `fetch` do Node
 * (undici) não reconhece ao serializar multipart/form-data — o resultado é uma
 * requisição sem Content-Type multipart, e o envio de arquivo se torna
 * intestável.
 *
 * Em navegador real isso não acontece: lá Blob, File e fetch vêm do mesmo
 * motor. Substituímos os do jsdom pelos nativos do Node, que SÃO os que o
 * fetch entende — ficando, portanto, mais perto do navegador do que o padrão
 * do ambiente de teste.
 *
 * Consequência colateral boa: o Blob do Node já implementa arrayBuffer(),
 * então o polyfill que existia aqui deixou de ser necessário.
 */
Object.defineProperties(globalThis, {
  Blob: { value: BlobNode, writable: true, configurable: true },
  File: { value: FileNode, writable: true, configurable: true },
})
