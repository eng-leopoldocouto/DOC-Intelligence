/**
 * A metade visível do segundo portão (ADR-015).
 *
 * A regra pura já está coberta em `tests/entities/validacao-de-campo.test.ts`.
 * O que falta provar é que a pessoa VÊ o motivo: um campo destacado sem
 * explicação faz conferir o campo errado, e os dois portões pedem ações
 * diferentes.
 *
 * O painel é renderizado direto, sem rede: o tipo de documento vem de um schema
 * inventado no próprio teste — o que também mantém a verificação alinhada com a
 * ADR-008, já que nem o teste sabe de antemão que tipos existem.
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PainelDeCampos } from '@/features/review/PainelDeCampos'
import type { TipoDocumento } from '@/entities/tipo-documento/tipos'
import type { CampoExtraido } from '@/entities/documento/tipos'

const CPF_VALIDO = '11144477735'
const CPF_INVALIDO = '11144477736'

const TIPO: TipoDocumento = {
  id: 'tipo-inventado',
  rotulo: 'Tipo inventado pelo teste',
  padraoDeNome: '{tipo}',
  campos: [
    { chave: 'documento', rotulo: 'Documento da pessoa', tipoDeDado: 'CPF', obrigatorio: true, ordem: 1, sensivel: true },
    { chave: 'observacao', rotulo: 'Observação', tipoDeDado: 'TEXTO', obrigatorio: false, ordem: 2, sensivel: false },
  ],
}

const painel = (campos: CampoExtraido[]) =>
  render(
    <PainelDeCampos
      tipo={TIPO}
      campos={campos}
      valores={Object.fromEntries(campos.map((c) => [c.chave, c.valor ?? '']))}
      limiar={0.85}
      onChange={() => {}}
    />,
  )

describe('o painel diz POR QUE o campo está ali', () => {
  it('alta confiança + formato inválido: "o modelo confia, o formato não fecha"', () => {
    painel([{ chave: 'documento', valor: CPF_INVALIDO, confianca: 0.97, origem: 'MODELO' }])

    expect(screen.getByText(/o formato não fecha/i)).toBeInTheDocument()
    expect(screen.getByText(/97%/)).toBeInTheDocument()
    // Só o formato reprovado vira aria-invalid: confiança baixa é "não tenho
    // certeza", e não "está errado".
    expect(screen.getByLabelText(/Documento da pessoa/)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText(/confiança baixa/i)).not.toBeInTheDocument()
  })

  it('baixa confiança + formato válido: continua sendo o aviso antigo', () => {
    painel([{ chave: 'documento', valor: CPF_VALIDO, confianca: 0.4, origem: 'MODELO' }])

    expect(screen.getByText(/confiança baixa/i)).toBeInTheDocument()
    expect(screen.queryByText(/o formato não fecha/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Documento da pessoa/)).toHaveAttribute('aria-invalid', 'false')
  })

  it('formato inválido COM confiança baixa não mente dizendo que o modelo confia', () => {
    // O motivo do formato tem precedência, e o texto precisa continuar
    // verdadeiro quando os dois portões acusam. A primeira versão dizia
    // "O modelo confia (60%)" — a própria contradição. Achado ao rodar a tela.
    painel([{ chave: 'documento', valor: CPF_INVALIDO, confianca: 0.6, origem: 'MODELO' }])

    expect(screen.getByText(/Confiança baixa \(60%\) e o formato não fecha/i)).toBeInTheDocument()
    expect(screen.queryByText(/o modelo confia/i)).not.toBeInTheDocument()
  })

  it('campo em ordem: nada é destacado quando os dois portões passam', () => {
    painel([{ chave: 'documento', valor: CPF_VALIDO, confianca: 0.97, origem: 'MODELO' }])

    expect(screen.queryByText(/o formato não fecha/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/confiança baixa/i)).not.toBeInTheDocument()
  })
})
