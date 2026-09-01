/**
 * Renderiza os campos percorrendo o SCHEMA vindo da API (RF-09, ADR-008).
 *
 * Não há uma única condicional por tipo de documento aqui. Se houvesse, toda
 * mudança de prompt viraria um ciclo de desenvolvimento — para um sistema cuja
 * premissa declarada é mudar de prompt várias vezes por ano (fato f).
 */
import { motivoDeConferencia } from '@/entities/documento/validacao-de-campo'
import type { CampoExtraido } from '@/entities/documento/tipos'
import type { TipoDocumento } from '@/entities/tipo-documento/tipos'
import { resolverComponente } from './fields/registry'

export function PainelDeCampos({
  tipo, campos, valores, limiar, onChange,
}: {
  tipo: TipoDocumento
  campos: CampoExtraido[]
  valores: Record<string, string>
  limiar: number
  onChange: (chave: string, valor: string) => void
}) {
  const porChave = new Map(campos.map((c) => [c.chave, c]))

  return (
    <div className="painel-campos">
      {[...tipo.campos]
        // A ORDEM vem da API. O front-end não decide o que aparece primeiro.
        .sort((a, b) => a.ordem - b.ordem)
        .map((descritor) => {
          const Componente = resolverComponente(descritor.tipoDeDado)
          const campo = porChave.get(descritor.chave)
          return (
            <Componente
              key={descritor.chave}
              descritor={descritor}
              campo={campo}
              valor={valores[descritor.chave] ?? ''}
              motivo={
                campo
                  ? motivoDeConferencia(campo, descritor.tipoDeDado, limiar)
                  : descritor.obrigatorio
                    ? 'CONFIANCA_BAIXA'
                    : null
              }
              limiar={limiar}
              onChange={(v) => onChange(descritor.chave, v)}
            />
          )
        })}
    </div>
  )
}
