/**
 * Orquestra o envio de um lote (RF-01, RF-02, RF-03).
 *
 * Ordem por item: validar -> deduplicar -> hash -> reduzir -> enfileirar -> POST.
 * Validação e deduplicação vêm ANTES do hash pesado e da rede, porque cada
 * arquivo barrado aqui é banda e chamada paga que não se gasta (fatos a, b, c).
 */
import { useCallback, useState } from 'react'
import { client } from '@/shared/api/client'
import { reduzirImagem } from '@/shared/lib/imagem'
import type { Documento } from '@/entities/documento/tipos'
import { dedupNoLote } from './deduplicacao'
import { executarComConcorrencia } from './filaDeEnvio'
import { validar, type Recusa } from './validacao'

export type ItemDeEnvio = {
  chave: string
  nomeOrigem: string
  tamanhoOriginal: number
  tamanhoEnviado?: number
  situacao: 'aguardando' | 'enviando' | 'enviado' | 'duplicado' | 'recusado' | 'falhou'
  recusa?: Recusa
  duplicaDe?: string
  documento?: Documento
  erro?: string
}

let contador = 0
const novaChave = () => `envio-${++contador}`

export function useEnvio() {
  const [itens, setItens] = useState<ItemDeEnvio[]>([])
  const [enviando, setEnviando] = useState(false)

  const atualizar = (chave: string, mudanca: Partial<ItemDeEnvio>) =>
    setItens((atuais) => atuais.map((i) => (i.chave === chave ? { ...i, ...mudanca } : i)))

  const enviar = useCallback(async (arquivos: File[]) => {
    setEnviando(true)

    // 1. Validação local — nada inválido consome rede (fato b)
    const recusados: ItemDeEnvio[] = []
    const aprovados: File[] = []
    for (const arquivo of arquivos) {
      const r = validar(arquivo)
      if (r.ok) {
        aprovados.push(arquivo)
      } else {
        recusados.push({
          chave: novaChave(), nomeOrigem: arquivo.name,
          tamanhoOriginal: arquivo.size, situacao: 'recusado', recusa: r,
        })
      }
    }

    // 2. Deduplicação no lote — antes de qualquer requisição (fato c)
    const { unicos, descartados } = await dedupNoLote(aprovados)

    const duplicadosLocais: ItemDeEnvio[] = descartados.map((d) => ({
      chave: novaChave(), nomeOrigem: d.arquivo.name,
      tamanhoOriginal: d.arquivo.size, situacao: 'duplicado', duplicaDe: d.duplicaDe,
    }))

    const pendentes: ItemDeEnvio[] = unicos.map((u) => ({
      chave: novaChave(), nomeOrigem: u.arquivo.name,
      tamanhoOriginal: u.arquivo.size, situacao: 'aguardando',
    }))

    setItens((atuais) => [...atuais, ...recusados, ...duplicadosLocais, ...pendentes])

    // 3. Envio com concorrência limitada (fato e)
    await executarComConcorrencia(
      unicos.map((u, i) => async () => {
        const chave = pendentes[i]!.chave
        atualizar(chave, { situacao: 'enviando' })
        try {
          const reduzido = await reduzirImagem(u.arquivo)
          const resposta = await client.enviarDocumento(reduzido, u.contentHash, u.arquivo.name)
          atualizar(chave, {
            situacao: resposta.duplicado ? 'duplicado' : 'enviado',
            documento: resposta.documento,
            tamanhoEnviado: reduzido.size,
          })
          return resposta
        } catch (erro) {
          // Falha de um item NÃO derruba o lote (T-06)
          atualizar(chave, {
            situacao: 'falhou',
            erro: erro instanceof Error ? erro.message : 'Falha no envio',
          })
          throw erro
        }
      }),
    )

    setEnviando(false)
  }, [])

  const limpar = useCallback(() => setItens([]), [])

  /** Ids que o acompanhamento precisa consultar. */
  const idsEnviados = itens
    .filter((i) => i.documento && i.situacao !== 'recusado')
    .map((i) => i.documento!.id)

  return { itens, enviar, enviando, limpar, idsEnviados }
}
