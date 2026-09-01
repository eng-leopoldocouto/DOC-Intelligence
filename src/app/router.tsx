import { createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { PaginaEnvio } from '@/pages/PaginaEnvio'
import { PaginaAcompanhamento } from '@/pages/PaginaAcompanhamento'

/**
 * Rotas carregam apenas ID OPACO — nunca dado pessoal (G4, fato d).
 * Query string vaza para histórico, log de proxy e cabeçalho Referer.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <PaginaEnvio /> },
      { path: 'acompanhamento', element: <PaginaAcompanhamento /> },
    ],
  },
])
