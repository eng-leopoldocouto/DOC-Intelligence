import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { client, type MotivoRejeicao } from '@/shared/api/client'
import { queryKeys } from '@/shared/api/queryKeys'
import { comporNomePadronizado } from '@/entities/documento/nome'
import { indexarPorId, limiarDoTipo } from '@/entities/tipo-documento/tipos'
import { formatarDataHora } from '@/shared/lib/formato'
import { useClaim } from '@/features/review/useClaim'
import { useGravarCampos } from '@/features/review/useGravarCampos'
import { PainelDeCampos } from '@/features/review/PainelDeCampos'
import { VisualizadorDocumento } from '@/features/review/VisualizadorDocumento'
import { ConflitoDialog } from '@/features/review/ConflitoDialog'
import { RejeitarDialog } from '@/features/review/RejeitarDialog'

export function PaginaConferencia() {
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const qc = useQueryClient()

  const documento = useQuery({
    queryKey: queryKeys.documento(id),
    queryFn: () => client.obterDocumento(id),
    enabled: Boolean(id),
  })
  const catalogo = useQuery({ queryKey: queryKeys.tipos, queryFn: client.tiposDocumento })

  const claim = useClaim(id)
  const { gravar, gravando, conflito, descartarConflito } = useGravarCampos(id)

  const [valores, setValores] = useState<Record<string, string>>({})
  const [nome, setNome] = useState('')
  const [nomeEditadoManualmente, setNomeEditadoManualmente] = useState(false)
  const [rejeitando, setRejeitando] = useState(false)

  const doc = documento.data
  const tipo = doc?.tipoDocumentoId
    ? indexarPorId(catalogo.data?.itens ?? [])[doc.tipoDocumentoId]
    : undefined
  const limiar = limiarDoTipo(tipo, catalogo.data?.limiarConfiancaPadrao ?? 1)

  // Carrega os valores do servidor uma vez por VERSÃO. Recarregar a cada
  // render apagaria o que a pessoa está digitando.
  const versao = doc?.versao
  useEffect(() => {
    if (!doc) return
    setValores(Object.fromEntries(doc.campos.map((c) => [c.chave, c.valor ?? ''])))
    setNome(doc.nomePadronizado ?? '')
    setNomeEditadoManualmente(false)
  }, [doc?.id, versao]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * O nome padronizado é recalculado quando um campo que o compõe muda —
   * MAS a edição manual prevalece (RF-11, ADR-013).
   *
   * Sem essa guarda, o sistema desfaria o que a pessoa acabou de digitar, que
   * é a forma mais rápida de fazer alguém desistir de usar a ferramenta.
   */
  const nomeProposto = useMemo(() => {
    if (!tipo || !doc) return ''
    const campos = doc.campos.map((c) => ({ ...c, valor: valores[c.chave] ?? c.valor }))
    return comporNomePadronizado(tipo.padraoDeNome, campos, tipo.rotulo)
  }, [tipo, doc, valores])

  useEffect(() => {
    if (!nomeEditadoManualmente && nomeProposto) setNome(nomeProposto)
  }, [nomeProposto, nomeEditadoManualmente])

  const rejeicao = useMutation({
    mutationFn: (dados: { motivo: MotivoRejeicao; observacao: string }) =>
      client.rejeitar(id, dados.motivo, dados.observacao),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.documentos })
      navegar('/conferencia')
    },
  })

  const camposParaEnvio = () =>
    Object.entries(valores).map(([chave, valor]) => ({ chave, valor: valor || null }))

  if (documento.isPending || catalogo.isPending) {
    return <div className="cartao vazio">Carregando…</div>
  }
  if (!doc) return <div className="cartao vazio">Documento não encontrado.</div>

  if (claim.situacao === 'de-outro') {
    return (
      <div className="cartao vazio">
        <p><strong>Este documento está em conferência por {claim.deQuem}.</strong></p>
        <p>Para não duplicarem trabalho, escolha outro item da fila.</p>
        <Link className="botao" to="/conferencia">Voltar para a fila</Link>
      </div>
    )
  }

  return (
    <>
      <div className="cabecalho-conferencia">
        <div>
          <h1>Conferência</h1>
          <p className="subtitulo">
            {tipo?.rotulo ?? 'Tipo não identificado'} · recebido {formatarDataHora(doc.recebidoEm)}
            {/* Procedência: sem isto, "a extração piorou depois da atualização"
                é uma frase sem investigação possível (fato f). */}
            {doc.procedencia && ` · ${doc.procedencia.modelo} / ${doc.procedencia.versaoPrompt}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="botao" to="/conferencia">Voltar</Link>
          <button type="button" className="botao perigo" onClick={() => setRejeitando(true)}>
            Rejeitar
          </button>
          <button
            type="button" className="botao primario" disabled={gravando}
            onClick={() => gravar({
              versao: doc.versao,
              campos: camposParaEnvio(),
              ...(nome ? { nomePadronizado: nome } : {}),
            })}
          >
            {gravando ? 'Salvando…' : 'Salvar e concluir'}
          </button>
        </div>
      </div>

      <div className="conferencia">
        <VisualizadorDocumento id={doc.id} nomeOrigem={doc.nomeOrigem} />

        <div className="lado-campos">
          <div className="campo">
            <label htmlFor="nome-padronizado">Nome padronizado (proposto)</label>
            <input
              id="nome-padronizado" type="text" value={nome}
              onChange={(e) => { setNome(e.target.value); setNomeEditadoManualmente(true) }}
            />
            {/* O nome como chegou é METADADO. Aparece porque a pessoa precisa
                reconhecer o arquivo, mas não identifica nada (fato b). */}
            <span className="dica-campo">como chegou: {doc.nomeOrigem}</span>
            {nomeEditadoManualmente && (
              <span className="dica-campo">editado à mão — não será recalculado</span>
            )}
          </div>

          {tipo ? (
            <PainelDeCampos
              tipo={tipo} campos={doc.campos} valores={valores} limiar={limiar}
              onChange={(chave, valor) => setValores((v) => ({ ...v, [chave]: valor }))}
            />
          ) : (
            <p className="vazio">
              A máquina não identificou o tipo deste documento. Rejeite-o para que
              quem enviou saiba que precisa reenviar.
            </p>
          )}
        </div>
      </div>

      {conflito && (
        <ConflitoDialog
          conflito={conflito} tipo={tipo} meusValores={valores}
          onCancelar={descartarConflito}
          onRecarregar={() => { descartarConflito(); void documento.refetch() }}
          onSobrescrever={() => {
            // Regrava sobre a versão atual — decisão consciente da pessoa,
            // tomada DEPOIS de ver o que a outra escreveu. Nunca automática.
            const versaoAtual = conflito.atual.versao
            descartarConflito()
            gravar({
              versao: versaoAtual,
              campos: camposParaEnvio(),
              ...(nome ? { nomePadronizado: nome } : {}),
            })
          }}
        />
      )}

      {rejeitando && (
        <RejeitarDialog
          enviando={rejeicao.isPending}
          onCancelar={() => setRejeitando(false)}
          onConfirmar={(motivo, observacao) => rejeicao.mutate({ motivo, observacao })}
        />
      )}
    </>
  )
}
