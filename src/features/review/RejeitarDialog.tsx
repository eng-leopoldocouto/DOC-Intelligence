/**
 * Rejeição do documento (RF-12, ADR-012).
 *
 * Requisito DERIVADO do fato (b), não pedido pelo enunciado: quando a foto está
 * ilegível, não há o que corrigir. Sem uma saída, a pessoa preenche o campo com
 * qualquer coisa para desbloquear a fila — e o sistema passa a produzir dado
 * inventado com aparência de conferido.
 */
import { useState } from 'react'
import { Dialogo } from '@/shared/ui/Dialogo'
import type { MotivoRejeicao } from '@/shared/api/client'

const MOTIVOS: { valor: MotivoRejeicao; rotulo: string }[] = [
  { valor: 'ILEGIVEL', rotulo: 'Ilegível — foto sem foco, escura ou cortada' },
  { valor: 'TIPO_INCORRETO', rotulo: 'Não é o documento que deveria ser' },
  { valor: 'INCOMPLETO', rotulo: 'Faltam páginas ou partes do documento' },
  { valor: 'NAO_E_DOCUMENTO', rotulo: 'Não é um documento' },
  { valor: 'OUTRO', rotulo: 'Outro motivo' },
]

export function RejeitarDialog({
  onConfirmar, onCancelar, enviando,
}: {
  onConfirmar: (motivo: MotivoRejeicao, observacao: string) => void
  onCancelar: () => void
  enviando: boolean
}) {
  const [motivo, setMotivo] = useState<MotivoRejeicao | ''>('')
  const [observacao, setObservacao] = useState('')

  return (
    <Dialogo
      titulo="Rejeitar documento"
      aoFechar={onCancelar}
      acoes={
        <>
          <button type="button" className="botao" onClick={onCancelar}>Cancelar</button>
          <button
            type="button"
            className="botao perigo"
            /* Motivo é obrigatório: rejeição sem motivo vira lixo para quem
               enviou e impede ver padrões (muita ILEGIVEL do mesmo remetente
               é problema de treinamento, não de software). */
            disabled={!motivo || enviando}
            onClick={() => motivo && onConfirmar(motivo, observacao)}
          >
            {enviando ? 'Rejeitando…' : 'Confirmar rejeição'}
          </button>
        </>
      }
    >
      <p className="subtitulo">
        O documento sai da fila e quem enviou recebe o motivo. Isso não gera
        reprocessamento — reprocessar uma foto ilegível chega ao mesmo lugar,
        cobrando de novo.
      </p>

      <div className="campo">
        <label htmlFor="motivo-rejeicao">Motivo</label>
        <select
          id="motivo-rejeicao"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value as MotivoRejeicao)}
          required
        >
          <option value="">Escolha um motivo</option>
          {MOTIVOS.map((m) => (
            <option key={m.valor} value={m.valor}>{m.rotulo}</option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="observacao-rejeicao">Observação (opcional)</label>
        <textarea
          id="observacao-rejeicao"
          rows={3}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="O que a pessoa que enviou precisa saber para reenviar corretamente"
        />
      </div>
    </Dialogo>
  )
}
