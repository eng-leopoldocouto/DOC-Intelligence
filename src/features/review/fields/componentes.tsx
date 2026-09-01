/**
 * Componentes de campo, um por TIPO DE DADO — nunca por tipo de documento.
 *
 * São seis, contra N tipos de documento, e é essa razão que torna barata a
 * troca prevista no fato (f): tipos de dado mudam devagar, tipos de documento
 * mudam sempre.
 *
 * Ficam num arquivo só porque são variações de uma mesma coisa, de ~15 linhas
 * cada. Divergência do plano registrada em docs/spec/08-divergencias.md.
 */
import { formatarDocumento, mascararDocumento } from '@/shared/lib/mascara'
import type { PropsDeCampo } from './tipos'

function Envolucro({
  descritor, abaixoDoLimiar, campo, children,
}: PropsDeCampo & { children: React.ReactNode }) {
  return (
    <div className={`campo ${abaixoDoLimiar ? 'duvidoso' : ''}`}>
      <label htmlFor={`campo-${descritor.chave}`}>
        {descritor.rotulo}
        {descritor.obrigatorio && <span aria-hidden="true" className="obrigatorio"> *</span>}
      </label>
      {children}
      {/* Confiança POR CAMPO: um documento a 90% no geral pode ter um campo a
          30%, e é esse campo que precisa do olho humano. */}
      {abaixoDoLimiar && (
        <span className="aviso-campo">
          Confiança baixa
          {campo?.confianca != null && ` (${Math.round(campo.confianca * 100)}%)`}
          {' '}— confira contra o documento
        </span>
      )}
      {campo?.origem === 'HUMANO' && <span className="aviso-humano">corrigido por pessoa</span>}
    </div>
  )
}

const atributosComuns = (p: PropsDeCampo) => ({
  id: `campo-${p.descritor.chave}`,
  'aria-invalid': p.abaixoDoLimiar,
  required: p.descritor.obrigatorio,
  onChange: (e: { target: { value: string } }) => p.onChange(e.target.value),
})

export const CampoTexto = (p: PropsDeCampo) => (
  <Envolucro {...p}>
    <input type="text" {...atributosComuns(p)} value={p.valor} />
  </Envolucro>
)

export const CampoData = (p: PropsDeCampo) => (
  <Envolucro {...p}>
    <input type="date" {...atributosComuns(p)} value={p.valor} />
  </Envolucro>
)

export const CampoNumero = (p: PropsDeCampo) => (
  <Envolucro {...p}>
    <input type="text" inputMode="decimal" {...atributosComuns(p)} value={p.valor} />
  </Envolucro>
)

/**
 * CPF e CNPJ aparecem INTEIROS na conferência.
 *
 * Mascarar aqui inviabilizaria o trabalho: a pessoa precisa LER o número para
 * conferi-lo contra a imagem. O mascaramento é na listagem, onde o dado é
 * contexto e não objeto do trabalho (ADR-010).
 */
const CampoDocumento = (p: PropsDeCampo, tipo: 'CPF' | 'CNPJ') => (
  <Envolucro {...p}>
    <input
      type="text"
      inputMode="numeric"
      {...atributosComuns(p)}
      value={formatarDocumento(p.valor, tipo)}
      onChange={(e) => p.onChange(e.target.value.replace(/\D/g, ''))}
    />
    <span className="dica-campo">na listagem aparece como {mascararDocumento(p.valor, tipo)}</span>
  </Envolucro>
)

export const CampoCpf = (p: PropsDeCampo) => CampoDocumento(p, 'CPF')
export const CampoCnpj = (p: PropsDeCampo) => CampoDocumento(p, 'CNPJ')

export const CampoSelecao = (p: PropsDeCampo) => (
  <Envolucro {...p}>
    <select {...atributosComuns(p)} value={p.valor}>
      <option value="">—</option>
      {/* As opções VÊM DA API. O front-end não sabe quais são. */}
      {(p.descritor.opcoes ?? []).map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
      {/* O modelo pode devolver valor fora da lista; não podemos apagá-lo em
          silêncio — a pessoa precisa vê-lo para corrigir. */}
      {p.valor && !(p.descritor.opcoes ?? []).includes(p.valor) && (
        <option value={p.valor}>{p.valor} (fora da lista)</option>
      )}
    </select>
  </Envolucro>
)
