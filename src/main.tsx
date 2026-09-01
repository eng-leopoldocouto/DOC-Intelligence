import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Provedores } from './app/providers'
import { router } from './app/router'
import '@/shared/ui/estilos.css'

async function iniciar(): Promise<void> {
  // O mock é ligado por variável de ambiente. Trocar para a API real não
  // muda uma linha do aplicativo (ADR-004).
  if (import.meta.env['VITE_API_MODE'] === 'mock') {
    const { iniciarNoNavegador } = await import('./mocks/browser')
    await iniciarNoNavegador()
  }

  const raiz = document.getElementById('raiz')
  if (!raiz) throw new Error('Elemento #raiz não encontrado')

  createRoot(raiz).render(
    <StrictMode>
      <Provedores>
        <RouterProvider router={router} />
      </Provedores>
    </StrictMode>,
  )
}

void iniciar()
