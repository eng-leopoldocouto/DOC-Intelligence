/**
 * Gravação com trava otimista (RF-10).
 *
 * Fato (g), parte 2 — contra a PERDA. O defeito que este arquivo evita é o
 * mais caro do sistema inteiro porque é SILENCIOSO: Bruno salva por último, a
 * correção da Ana some, o documento fica com aparência de conferido e o dado
 * errado segue para a planilha e para o processo. Ninguém percebe.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { client } from '@/shared/api/client'
import { ErroDeApi } from '@/shared/api/http'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Documento } from '@/entities/documento/tipos'

export type Conflito = { atual: Documento; alteradoPor: string | null }

type CorpoDaGravacao = {
  versao: number
  campos: { chave: string; valor: string | null }[]
  nomePadronizado?: string
}

export function useGravarCampos(id: string) {
  const qc = useQueryClient()
  const [conflito, setConflito] = useState<Conflito | null>(null)

  const mutation = useMutation({
    mutationFn: (dados: CorpoDaGravacao) =>
      client.gravarCampos(id, dados.versao, dados.campos, dados.nomePadronizado),

    onSuccess: (doc) => {
      setConflito(null)
      qc.setQueryData(queryKeys.documento(id), doc)
      void qc.invalidateQueries({ queryKey: queryKeys.documentos })
    },

    onError: (erro) => {
      if (erro instanceof ErroDeApi && erro.status === 409) {
        const corpo = erro.corpo as { documentoAtual?: Documento; alteradoPor?: string | null }
        if (corpo?.documentoAtual) {
          // NÃO reverte a edição local. NÃO aplica por cima.
          // Guarda o conflito e devolve a decisão para a pessoa — é ela que
          // sabe qual das duas versões está certa, não o cliente.
          setConflito({ atual: corpo.documentoAtual, alteradoPor: corpo.alteradoPor ?? null })
          return
        }
      }
      // Qualquer outro erro sobe para o boundary; não fingimos ter salvo.
    },
  })

  return {
    gravar: mutation.mutate,
    gravando: mutation.isPending,
    erro: conflito ? null : mutation.error,
    conflito,
    descartarConflito: () => setConflito(null),
  }
}
