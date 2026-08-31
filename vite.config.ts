import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { createReadStream, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Serve `fixtures/documentos-ficticios/` em `/fixtures/*` durante o
 * desenvolvimento.
 *
 * Evita duplicar os binários dentro de `public/`: o mock devolve URLs
 * assinadas apontando para `/fixtures/<nome>`, e este middleware as resolve
 * a partir da pasta original.
 */
function servirDocumentosFicticios(): Plugin {
  return {
    name: 'servir-documentos-ficticios',
    configureServer(server) {
      server.middlewares.use('/fixtures', (req, res, next) => {
        const nome = decodeURIComponent((req.url ?? '').split('?')[0]!.replace(/^\//, ''))
        const caminho = resolve(__dirname, 'fixtures/documentos-ficticios', nome)
        if (!nome || !existsSync(caminho)) return next()
        res.setHeader('Content-Type', nome.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')
        // Documento pessoal não fica em cache do navegador (fato d, ADR-010).
        res.setHeader('Cache-Control', 'no-store')
        createReadStream(caminho).pipe(res)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), servirDocumentosFicticios()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Base ABSOLUTA nos testes: em ambiente Node não existe `location` para
    // resolver caminho relativo. O handler do MSW casa com qualquer origem
    // (`*/api/v1`), então isto vale para jsdom e para Node igualmente.
    env: { VITE_API_BASE: 'http://doc-intelligence.local/api/v1' },
    // Fatia estreita: não perseguimos cobertura percentual (ver 06-plano-de-testes.md)
    coverage: { provider: 'v8', reporter: ['text'] },
  },
})
