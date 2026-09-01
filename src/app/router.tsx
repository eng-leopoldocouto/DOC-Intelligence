import { createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { PaginaEnvio } from '@/pages/PaginaEnvio'
import { PaginaAcompanhamento } from '@/pages/PaginaAcompanhamento'
import { PaginaFilaConferencia } from '@/pages/PaginaFilaConferencia'
import { PaginaConferencia } from '@/pages/PaginaConferencia'

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
      { path: 'conferencia', element: <PaginaFilaConferencia /> },
      // Só ID OPACO na rota — nunca nome, CPF ou qualquer dado pessoal (G4).
      { path: 'conferencia/:id', element: <PaginaConferencia /> },
    ],
  },
])
