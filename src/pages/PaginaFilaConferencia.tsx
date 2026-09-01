import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { indexarPorId, limiarDoTipo } from '@/entities/tipo-documento/tipos'
import { campoAbaixoDoLimiar } from '@/entities/documento/estado'
import { formatarDataHora, formatarTempoDecorrido } from '@/shared/lib/formato'
import { mascararDocumento } from '@/shared/lib/mascara'
import { useFilaDeConferencia } from '@/features/review/useFilaDeConferencia'
import type { Documento } from '@/entities/documento/tipos'
import type { TipoDocumento } from '@/entities/tipo-documento/tipos'

/**
 * Dado sensível aparece MASCARADO na listagem, onde é contexto, e é revelado
 * sob demanda, um de cada vez (fato d, ADR-010). Na conferência ele aparece
 * inteiro, porque lá é o objeto do trabalho.
 */
function Identificador({ doc, tipo }: { doc: Documento; tipo: TipoDocumento | undefined }) {
  const [revelado, setRevelado] = useState(false)

  const descritorSensivel = tipo?.campos.find(
    (c) => c.sensivel && (c.tipoDeDado === 'CPF' || c.tipoDeDado === 'CNPJ'),
  )
  if (!descritorSensivel) return null

  const campo = doc.campos.find((c) => c.chave === descritorSensivel.chave)
  const valor = campo?.valor
  if (!valor) return null

  const tipoDeDado = descritorSensivel.tipoDeDado as 'CPF' | 'CNPJ'

  return (
    <>
      {' · '}
      {descritorSensivel.rotulo}: {revelado ? valor : mascararDocumento(valor, tipoDeDado)}{' '}
      <button
        type="button"
        className="botao-inline"
        onClick={() => setRevelado((r) => !r)}
        aria-label={revelado ? 'Ocultar' : `Revelar ${descritorSensivel.rotulo}`}
      >
        {revelado ? 'ocultar' : 'revelar'}
      </button>
    </>
  )
}

export function PaginaFilaConferencia() {
  const { itens, carregando, temMais, carregarMais, carregandoMais } = useFilaDeConferencia()
  const catalogo = useQuery({ queryKey: queryKeys.tipos, queryFn: client.tiposDocumento })

  const porId = indexarPorId(catalogo.data?.itens ?? [])
  const padrao = catalogo.data?.limiarConfiancaPadrao ?? 1
  const agora = new Date()

  return (
    <>
      <h1>Fila de conferência</h1>
      <p className="subtitulo">
        Documentos em que a máquina não teve confiança suficiente. Ordem de chegada,
        mais antigo primeiro. Números de documento aparecem mascarados aqui.
      </p>

      {carregando ? (
        <div className="cartao vazio">Carregando fila…</div>
      ) : itens.length === 0 ? (
        <div className="cartao vazio">Fila vazia — nada aguardando conferência.</div>
      ) : (
        <>
          <ul className="lista-itens">
            {itens.map((doc) => {
              const tipo = doc.tipoDocumentoId ? porId[doc.tipoDocumentoId] : undefined
              const limiar = limiarDoTipo(tipo, padrao)
              const duvidosos = doc.campos.filter((c) => campoAbaixoDoLimiar(c, limiar)).length
              const reservado = doc.reserva

              return (
                <li key={doc.id} className="item">
                  <div className="miniatura" aria-hidden="true">
                    {doc.nomeOrigem.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMG'}
                  </div>

                  <div>
                    <div className="nome">{doc.nomePadronizado ?? doc.nomeOrigem}</div>
                    <div className="meta">
                      {tipo?.rotulo ?? 'tipo não identificado'} · aguardando há{' '}
                      {formatarTempoDecorrido(doc.recebidoEm, agora)} ({formatarDataHora(doc.recebidoEm)})
                      <Identificador doc={doc} tipo={tipo} />
                    </div>
                    {duvidosos > 0 && (
                      <div className="meta">
                        {duvidosos} campo{duvidosos === 1 ? '' : 's'} com confiança abaixo do limiar
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {reservado ? (
                      /* Fato (g): o item não é oferecido a quem chegou depois.
                         Sem identidade do host, degrada para "outra sessão". */
                      <span className="etiqueta atencao">
                        em conferência por {reservado.usuarioNome ?? 'outra sessão'}
                      </span>
                    ) : (
                      <Link className="botao primario" to={`/conferencia/${doc.id}`}>
                        Conferir
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {temMais && (
            <button
              type="button" className="botao"
              style={{ marginTop: 16 }}
              disabled={carregandoMais}
              onClick={() => void carregarMais()}
            >
              {carregandoMais ? 'Carregando…' : 'Carregar mais'}
            </button>
          )}
        </>
      )}
    </>
  )
}
