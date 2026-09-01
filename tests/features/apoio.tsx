import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'

export function renderizarEmRota(elemento: ReactElement, caminho: string, rota: string): RenderResult {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[caminho]}>
        <Routes>
          <Route path={rota} element={elemento} />
          <Route path="*" element={<div>outra rota</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}
