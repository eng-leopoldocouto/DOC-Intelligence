import { formatarDataHora, formatarTamanho } from '@/shared/lib/formato'
import type { ItemDeEnvio as Item } from './useEnvio'

const ETIQUETA: Record<Item['situacao'], { texto: string; classe: string }> = {
  aguardando: { texto: 'Na fila', classe: 'neutra' },
  enviando: { texto: 'Enviando…', classe: 'processando' },
  enviado: { texto: 'Recebido', classe: 'ok' },
  duplicado: { texto: 'Já enviado', classe: 'atencao' },
  recusado: { texto: 'Recusado', classe: 'erro' },
  falhou: { texto: 'Falhou', classe: 'erro' },
}

export function ItemDeEnvio({ item }: { item: Item }) {
  const etiqueta = ETIQUETA[item.situacao]
  const reduziu = item.tamanhoEnviado !== undefined && item.tamanhoEnviado < item.tamanhoOriginal

  return (
    <li
      className={`item ${item.situacao === 'recusado' ? 'recusado' : ''} ${
        item.situacao === 'duplicado' ? 'duplicado' : ''
      }`}
    >
      <div className="miniatura" aria-hidden="true">
        {item.nomeOrigem.toLowerCase().endsWith('.pdf') ? 'PDF' : 'IMG'}
      </div>

      <div>
        {/* O nome de origem é METADADO, nunca identificador (fato b).
            Aparece porque a pessoa precisa reconhecer o que enviou. */}
        <div className="nome">{item.nomeOrigem}</div>

        <div className="meta">
          {formatarTamanho(item.tamanhoOriginal)}
          {reduziu && ` → ${formatarTamanho(item.tamanhoEnviado!)} (reduzido no envio)`}
          {item.situacao === 'duplicado' && item.duplicaDe && ` · duplicata de ${item.duplicaDe}`}
          {item.situacao === 'duplicado' && item.documento &&
            ` · já enviado em ${formatarDataHora(item.documento.recebidoEm)}`}
        </div>

        {/* Toda recusa diz o que FAZER, não só o que falhou. */}
        {item.recusa && (
          <div className="resolucao">
            {item.recusa.motivo}. {item.recusa.comoResolver}
          </div>
        )}
        {item.erro && <div className="resolucao">{item.erro}</div>}
      </div>

      <span className={`etiqueta ${etiqueta.classe}`}>{etiqueta.texto}</span>
    </li>
  )
}
