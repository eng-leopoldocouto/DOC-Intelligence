import type { CampoExtraido } from '@/entities/documento/tipos'
import type { MotivoDeConferencia } from '@/entities/documento/validacao-de-campo'
import type { DescritorDeCampo } from '@/entities/tipo-documento/tipos'

export type PropsDeCampo = {
  /** Vem da API. É ele que manda no rótulo, na ordem e na obrigatoriedade. */
  descritor: DescritorDeCampo
  /** Pode não existir: o modelo nem sempre devolve todos os campos do schema. */
  campo: CampoExtraido | undefined
  valor: string
  /**
   * POR QUE este campo pede olho humano — `null` quando não pede.
   *
   * Era um booleano `abaixoDoLimiar`. Virou motivo porque passaram a existir
   * dois portões independentes, e "está destacado" sem "por quê" faz a pessoa
   * conferir o campo errado (ADR-015).
   */
  motivo: MotivoDeConferencia | null
  onChange: (valor: string) => void
}

export type ComponenteDeCampo = (props: PropsDeCampo) => React.JSX.Element
