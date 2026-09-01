/**
 * Fila de conferência (RF-06).
 *
 * Ordem de CHEGADA, sem priorização (premissa P2): assumimos que não há SLA de
 * mesmo dia. Se houver, priorização e contrapressão são a primeira coisa a
 * construir — está registrado em 07-nao-feito.md.
 */
import { useInfiniteQuery } from '@tanstack/react-query'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Documento } from '@/entities/documento/tipos'

const POR_PAGINA = 50

export function useFilaDeConferencia() {
  const consulta = useInfiniteQuery({
    queryKey: queryKeys.fila(),
    // Cursor, não offset: a fila MUDA enquanto é paginada — documentos entram
    // por cima e saem quando alguém confere. Offset pularia ou repetiria itens.
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      client.listarDocumentos({
        estado: 'AGUARDANDO_CONFERENCIA',
        limite: POR_PAGINA,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (ultima) => ultima.proximoCursor ?? undefined,
  })

  const itens: Documento[] = consulta.data?.pages.flatMap((p) => p.itens) ?? []

  return {
    itens,
    carregando: consulta.isPending,
    temMais: consulta.hasNextPage,
    carregarMais: consulta.fetchNextPage,
    carregandoMais: consulta.isFetchingNextPage,
  }
}
