import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Mesmos handlers do navegador — nenhum dublê paralelo (ADR-004). */
export const servidorDeTeste = setupServer(...handlers)
