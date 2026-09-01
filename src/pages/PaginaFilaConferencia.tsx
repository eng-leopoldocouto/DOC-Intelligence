import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { client } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { indexarPorId, limiarDoTipo } from '@/entities/tipo-documento/tipos'
import { motivoDeConferencia } from '@/entities/documento/validacao-de-campo'
import { LIMITE_DE_ESPERA_MIN, LIMITE_DE_ITENS, pressaoDaFila } from '@/entities/documento/fila'
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

  // Fato (e): a fila é o gargalo HUMANO, e quem decide contratar não abre a
  // fila — abre um relatório. O mínimo que esta tela pode fazer é dizer o
  // tamanho do problema em voz alta, no cabeçalho, sem endpoint novo.
  const pressao = pressaoDaFila(itens.length, itens[0]?.recebidoEm, agora)

  return (
    <>
      <h1>Fila de conferência</h1>
      <p className="subtitulo">
        Documentos em que a máquina não teve confiança suficiente. Ordem de chegada,
        mais antigo primeiro. Números de documento aparecem mascarados aqui.
      </p>

      {!carregando && itens.length > 0 && (
        <div className={`pressao-da-fila ${pressao.tensa ? 'tensa' : ''}`} role="status">
          <strong>
            {itens.length}
            {/* "50+" e não "50": com paginação por cursor só se conhece o que
                foi carregado. Escrever o número cheio seria afirmar uma
                contagem que a interface não tem. */}
            {temMais ? '+' : ''} aguardando conferência
          </strong>
          {pressao.esperaDoMaisAntigoMin !== null && (
            <span>
              {' · o mais antigo espera há '}
              {formatarTempoDecorrido(itens[0]!.recebidoEm, agora)}
            </span>
          )}
          {pressao.tensa && (
            <p className="pressao-da-fila-nota">
              Acima do que duas pessoas conferem numa hora ({LIMITE_DE_ITENS} documentos
              ou {LIMITE_DE_ESPERA_MIN} minutos de espera). A interface não acelera
              conferência — quem decide reforço é a gestão.
            </p>
          )}
        </div>
      )}

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
              // O tipo de dado de cada campo vem do schema. Campo que o schema
              // não descreve cai em TEXTO, que não tem validação de formato —
              // o desconhecido nunca reprova (ADR-015).
              const tipoDeDado = new Map((tipo?.campos ?? []).map((d) => [d.chave, d.tipoDeDado]))
              const motivos = doc.campos.map((c) =>
                motivoDeConferencia(c, tipoDeDado.get(c.chave) ?? 'TEXTO', limiar, agora),
              )
              const duvidosos = motivos.filter((m) => m === 'CONFIANCA_BAIXA').length
              const invalidos = motivos.filter((m) => m === 'FORMATO_INVALIDO').length
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
                    {/* Segundo portão, independente do modelo (ADR-015). */}
                    {invalidos > 0 && (
                      <div className="meta aviso-invalido">
                        {invalidos} campo{invalidos === 1 ? '' : 's'} em que o formato não fecha
                      </div>
                    )}
                  </div>

                  <div className="acoes-item">
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
              type="button" className="botao carregar-mais"
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
