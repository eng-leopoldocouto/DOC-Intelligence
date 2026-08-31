import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
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
