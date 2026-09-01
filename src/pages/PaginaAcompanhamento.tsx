import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { emProcessamento, falhou } from '@/entities/documento/estado'
import type { Documento, EstadoDocumento } from '@/entities/documento/tipos'
import { formatarDataHora, formatarTempoDecorrido } from '@/shared/lib/formato'
import { usePollingLote } from '@/features/processing/usePollingLote'

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
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {/* Fato (a): cada reprocessamento é uma nova chamada COBRADA.
          A pessoa precisa saber disso antes de decidir — e a decisão é dela. */}
      <span style={{ fontSize: 12, color: 'var(--alerta)' }}>
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

  return (
    <>
      <h1>Acompanhamento</h1>
      <p className="subtitulo">
        O processamento leva de 5 a 40 segundos por documento. O tempo mostrado é
        o decorrido — não sabemos a porcentagem concluída e não vamos inventá-la.
        {pausado && ' Consulta pausada enquanto a aba está em segundo plano.'}
      </p>

      {documentos.length === 0 ? (
        <div className="cartao vazio">
          Nenhum documento ainda. <Link to="/">Envie os primeiros</Link>.
        </div>
      ) : (
        <ul className="lista-itens">
          {documentos.map((doc) => {
            const estado = porId[doc.id]?.estado ?? doc.estado
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
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
