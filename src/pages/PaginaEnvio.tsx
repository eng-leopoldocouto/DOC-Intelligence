import { useEnvio } from '@/features/upload/useEnvio'
import { AreaDeEnvio } from '@/features/upload/AreaDeEnvio'
import { ItemDeEnvio } from '@/features/upload/ItemDeEnvio'

export function PaginaEnvio() {
  const { itens, enviar, enviando, limpar } = useEnvio()

  const recusados = itens.filter((i) => i.situacao === 'recusado').length
  const duplicados = itens.filter((i) => i.situacao === 'duplicado').length
  const enviados = itens.filter((i) => i.situacao === 'enviado').length

  return (
    <>
      <h1>Enviar documentos</h1>
      <p className="subtitulo">
        Vários de uma vez. Cada arquivo é verificado aqui antes de subir — o que
        não passa não consome processamento.
      </p>

      <AreaDeEnvio onArquivos={enviar} ocupado={enviando} />

      {itens.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
            <strong style={{ fontSize: 14 }}>
              {enviados} recebido{enviados === 1 ? '' : 's'}
            </strong>
            {duplicados > 0 && (
              <span className="etiqueta atencao">
                {duplicados} duplicata{duplicados === 1 ? '' : 's'} descartada
                {duplicados === 1 ? '' : 's'}
              </span>
            )}
            {recusados > 0 && (
              <span className="etiqueta erro">
                {recusados} recusado{recusados === 1 ? '' : 's'}
              </span>
            )}
            <button type="button" className="botao" onClick={limpar} style={{ marginLeft: 'auto' }}>
              Limpar lista
            </button>
          </div>

          <ul className="lista-itens">
            {itens.map((item) => (
              <ItemDeEnvio key={item.chave} item={item} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
