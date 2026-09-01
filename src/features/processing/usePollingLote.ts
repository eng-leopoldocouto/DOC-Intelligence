/**
 * Acompanhamento do processamento (RF-04, fatos a e e).
 *
 * UMA requisição para N documentos. Com 800 em acompanhamento, um polling por
 * documento a cada 3 s seriam 267 requisições por segundo saindo de um único
 * navegador — o gargalo seríamos nós, não o servidor.
 */
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { emProcessamento } from '@/entities/documento/estado'
import type { StatusResumido } from '@/entities/documento/tipos'
import { intervaloDoLote } from './backoff'

/** O atendimento deixa a aba aberta o dia todo; consultar em segundo plano é desperdício. */
function useAbaVisivel(): boolean {
  const [visivel, setVisivel] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden,
  )
  useEffect(() => {
    const ao = () => setVisivel(!document.hidden)
    document.addEventListener('visibilitychange', ao)
    return () => document.removeEventListener('visibilitychange', ao)
  }, [])
  return visivel
}

export function usePollingLote(ids: string[], recebidosEm: string[]) {
  const visivel = useAbaVisivel()

  const consulta = useQuery({
    queryKey: queryKeys.statusLote(ids),
    queryFn: () => client.statusEmLote(ids),
    enabled: ids.length > 0 && visivel,
    refetchInterval: (q) => {
      const itens = q.state.data as StatusResumido[] | undefined
      // Todos em estado final: para de consultar. Não há por que insistir.
      if (itens && itens.length > 0 && !itens.some((i) => emProcessamento(i.estado))) return false
      const intervalo = intervaloDoLote(recebidosEm)
      return intervalo === 0 ? false : intervalo
    },
    refetchIntervalInBackground: false,
  })

  const porId = Object.fromEntries((consulta.data ?? []).map((s) => [s.id, s]))
  return { porId, consultando: consulta.isFetching, pausado: !visivel }
}
