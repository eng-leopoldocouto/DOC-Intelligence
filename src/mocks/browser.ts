import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { semear } from './dados'

export const worker = setupWorker(...handlers)

/** Só inicia se VITE_API_MODE=mock. Trocar para a API real é variável de ambiente. */
export async function iniciarNoNavegador(): Promise<void> {
  if (import.meta.env['VITE_API_MODE'] !== 'mock') return
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  // Só no navegador: os testes precisam de estado limpo e determinístico.
  semear()
}
