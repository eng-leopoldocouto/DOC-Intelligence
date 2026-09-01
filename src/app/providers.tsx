import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ErroDeApi } from '@/shared/api/http'

export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // O retry de rede já mora em shared/api/http.ts, com a política certa
        // (só GET). Repetir aqui multiplicaria as tentativas sem querer.
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 10_000,
      },
      mutations: {
        // G5: nenhuma mutação é repetida automaticamente. Cada uma pode
        // disparar o modelo, e cada disparo é cobrado (fato a).
        retry: false,
      },
    },
  })
}

export const ehConflito = (erro: unknown): erro is ErroDeApi =>
  erro instanceof ErroDeApi && erro.status === 409

export function Provedores({ children, client }: { children: ReactNode; client?: QueryClient }) {
  return <QueryClientProvider client={client ?? criarQueryClient()}>{children}</QueryClientProvider>
}
