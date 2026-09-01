/**
 * Resolução HUMANA de conflito (RF-10, fato g).
 *
 * Três saídas, nenhuma automática. O cliente não sabe qual das duas versões
 * está certa — quem sabe é a pessoa que tem o documento na tela.
 */
import type { CampoExtraido } from '@/entities/documento/tipos'
import type { TipoDocumento } from '@/entities/tipo-documento/tipos'
import type { Conflito } from './useGravarCampos'

export function ConflitoDialog({
  conflito, tipo, meusValores, onRecarregar, onSobrescrever, onCancelar,
}: {
  conflito: Conflito
  tipo: TipoDocumento | undefined
  meusValores: Record<string, string>
  onRecarregar: () => void
  onSobrescrever: () => void
  onCancelar: () => void
}) {
  const rotulo = (chave: string) =>
    tipo?.campos.find((c) => c.chave === chave)?.rotulo ?? chave

  const valorDele = (c: CampoExtraido) => c.valor ?? ''

  // Só mostra o que efetivamente diverge: uma lista com tudo esconde o que importa.
  const divergentes = conflito.atual.campos.filter(
    (c) => (meusValores[c.chave] ?? '') !== valorDele(c),
  )

  return (
    <div className="dialogo-fundo" role="dialog" aria-modal="true" aria-labelledby="titulo-conflito">
      <div className="dialogo">
        <h2 id="titulo-conflito">
          {conflito.alteradoPor ?? 'Outra pessoa'} alterou este documento enquanto você editava
        </h2>
        <p className="subtitulo">
          Sua edição não foi perdida e nada foi sobrescrito. Escolha o que fazer.
        </p>

        {divergentes.length === 0 ? (
          <p className="subtitulo">Nenhum campo em que vocês discordem — só a versão avançou.</p>
        ) : (
          <table className="tabela-conflito">
            <thead>
              <tr>
                <th>Campo</th>
                <th>O que você digitou</th>
                <th>O que está salvo</th>
              </tr>
            </thead>
            <tbody>
              {divergentes.map((c) => (
                <tr key={c.chave}>
                  <td>{rotulo(c.chave)}</td>
                  <td className="meu">{meusValores[c.chave] || <em>vazio</em>}</td>
                  <td className="dele">{valorDele(c) || <em>vazio</em>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="dialogo-acoes">
          <button type="button" className="botao" onClick={onCancelar}>
            Continuar editando
          </button>
          <button type="button" className="botao" onClick={onRecarregar}>
            Descartar a minha e usar a versão salva
          </button>
          <button type="button" className="botao primario" onClick={onSobrescrever}>
            Manter a minha e sobrescrever
          </button>
        </div>
      </div>
    </div>
  )
}
