import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { emProcessamento, falhou } from '@/entities/documento/estado'
import type { Documento, EstadoDocumento } from '@/entities/documento/tipos'
import { formatarDataHora, formatarTempoDecorrido } from '@/shared/lib/formato'
import { usePollingLote } from '@/features/processing/usePollingLote'
import { useAnuncioDeTransicoes } from '@/features/processing/useAnuncioDeTransicoes'

const ETIQUETA: Record<EstadoDocumento, { texto: string; classe: string }> = {
  RECEBIDO: { texto: 'Recebido', classe: 'neutra' },
  EM_PROCESSAMENTO: { texto: 'Processando', classe: 'processando' },
  AGUARDANDO_CONFERENCIA: { texto: 'Aguardando conferência', classe: 'atencao' },
  EM_CONFERENCIA: { texto: 'Em conferência', classe: 'atencao' },
  PRONTO: { texto: 'Pronto', classe: 'ok' },
  FALHOU: { texto: 'Falhou', classe: 'erro' },
  EXPIRADO: { texto: 'Sem resposta', classe: 'erro' },
  REJEITADO: { texto: 'Rejeitado', classe: 'erro' },
}

function Reprocessar({ documento }: { documento: Documento }) {
  const [confirmando, setConfirmando] = useState(false)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => client.reprocessar(documento.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.documentos }); setConfirmando(false) },
  })

  if (!confirmando) {
    return (
      <button type="button" className="botao" onClick={() => setConfirmando(true)}>
        Reprocessar
      </button>
    )
  }

  return (
    <div className="confirmacao-custo">
      {/* Fato (a): cada reprocessamento é uma nova chamada COBRADA.
          A pessoa precisa saber disso antes de decidir — e a decisão é dela. */}
      <span className="confirmacao-custo-texto">
        Isso gera uma nova chamada cobrada ao modelo. Confirmar?
      </span>
      <button
        type="button" className="botao primario"
        disabled={mutation.isPending} onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Enviando…' : 'Confirmar'}
      </button>
      <button type="button" className="botao" onClick={() => setConfirmando(false)}>
        Cancelar
      </button>
    </div>
  )
}

export function PaginaAcompanhamento() {
  const lista = useQuery({
    queryKey: queryKeys.documentos,
    queryFn: () => client.listarDocumentos({ limite: 200 }),
  })

  const documentos = lista.data?.itens ?? []
  const emAndamento = documentos.filter((d) => emProcessamento(d.estado))

  const { porId, pausado } = usePollingLote(
    emAndamento.map((d) => d.id),
    emAndamento.map((d) => d.recebidoEm),
  )

  const agora = new Date()

  // O estado efetivo é o da consulta em lote quando existe, e o da listagem
  // quando não. Este mapa é a entrada do anúncio e a fonte da etiqueta —
  // calculá-lo duas vezes deixaria os dois divergirem.
  const estadoPorId: Record<string, EstadoDocumento> = Object.fromEntries(
    documentos.map((d) => [d.id, porId[d.id]?.estado ?? d.estado]),
  )
  const anuncio = useAnuncioDeTransicoes(estadoPorId, (e) => ETIQUETA[e].texto)

  return (
    <>
      <h1>Acompanhamento</h1>
      <p className="subtitulo">
        O processamento leva de 5 a 40 segundos por documento. O tempo mostrado é
        o decorrido — não sabemos a porcentagem concluída e não vamos inventá-la.
        {pausado && ' Consulta pausada enquanto a aba está em segundo plano.'}
      </p>

      {/* O estado muda sozinho por consulta em lote. Sem esta região, quem usa
          leitor de tela não fica sabendo — as etiquetas trocam em silêncio.
          O texto é AGREGADO de propósito: o nome padronizado contém o nome da
          pessoa, e anúncio é saída de dado como qualquer outra (regra 4). */}
      <p className="anuncio-vivo" role="status" aria-live="polite" aria-atomic="true">
        {anuncio}
      </p>

      {documentos.length === 0 ? (
        <div className="cartao vazio">
          Nenhum documento ainda. <Link to="/">Envie os primeiros</Link>.
        </div>
      ) : (
        <ul className="lista-itens">
          {documentos.map((doc) => {
            const estado = estadoPorId[doc.id] ?? doc.estado
            const etiqueta = ETIQUETA[estado]
            return (
              <li key={doc.id} className="item">
                <div className="miniatura" aria-hidden="true">
                  {doc.nomeOrigem.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMG'}
                </div>
                <div>
                  <div className="nome">{doc.nomePadronizado ?? doc.nomeOrigem}</div>
                  <div className="meta">
                    {doc.nomePadronizado && <>como chegou: {doc.nomeOrigem} · </>}
                    recebido {formatarDataHora(doc.recebidoEm)}
                    {emProcessamento(estado) &&
                      ` · há ${formatarTempoDecorrido(doc.recebidoEm, agora)}`}
                  </div>
                  {doc.motivoFalha && <div className="resolucao">{doc.motivoFalha}</div>}
                </div>
                <div className="acoes-item">
                  {falhou(estado) && <Reprocessar documento={doc} />}
                  {(estado === 'AGUARDANDO_CONFERENCIA' || estado === 'EM_CONFERENCIA') && (
                    <Link className="botao" to={`/conferencia/${doc.id}`}>Conferir</Link>
                  )}
                  <span className={`etiqueta ${etiqueta.classe}`}>{etiqueta.texto}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
