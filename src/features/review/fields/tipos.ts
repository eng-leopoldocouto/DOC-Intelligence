import type { CampoExtraido } from '@/entities/documento/tipos'
import type { DescritorDeCampo } from '@/entities/tipo-documento/tipos'

export type PropsDeCampo = {
  /** Vem da API. É ele que manda no rótulo, na ordem e na obrigatoriedade. */
  descritor: DescritorDeCampo
  /** Pode não existir: o modelo nem sempre devolve todos os campos do schema. */
  campo: CampoExtraido | undefined
  valor: string
  abaixoDoLimiar: boolean
  onChange: (valor: string) => void
}

export type ComponenteDeCampo = (props: PropsDeCampo) => React.JSX.Element
