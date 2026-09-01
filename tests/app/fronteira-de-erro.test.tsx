/**
 * A fronteira de erro (CLAUDE.md §4).
 *
 * Três coisas importam aqui, e a terceira é a que quase ninguém testa:
 *   1. a fronteira segura a queda em vez de deixar a tela branca;
 *   2. o resto do aplicativo continua vivo — a navegação não some junto;
 *   3. a mensagem do erro NÃO chega à tela, porque ela pode carregar dado
 *      pessoal (regra 4 do CLAUDE.md).
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { FronteiraDeErro } from '@/app/FronteiraDeErro'

/**
 * O React imprime o erro capturado com `console.error`, por projeto. Silenciar
 * aqui é só para a saída do teste ficar legível — não estamos escondendo falha:
 * o que o teste verifica é o comportamento da tela, não o console.
 */
const silenciarConsole = () => vi.spyOn(console, 'error').mockImplementation(() => {})
afterEach(() => vi.restoreAllMocks())

/** O texto do erro imita o pior caso real: um valor de campo dentro da mensagem. */
const VALOR_SENSIVEL = '000.000.000-00'

function TelaQueQuebra(): never {
  throw new Error(`falha ao renderizar o campo cpf=${VALOR_SENSIVEL}`)
}

function montar() {
  return render(
    <MemoryRouter initialEntries={['/conferencia/doc-1']}>
      {/* Fica FORA da fronteira, como a barra de navegação em App.tsx. */}
      <nav>navegação do aplicativo</nav>
      <FronteiraDeErro>
        <Routes>
          <Route path="/conferencia" element={<div>fila de conferência</div>} />
          <Route path="/conferencia/:id" element={<TelaQueQuebra />} />
        </Routes>
      </FronteiraDeErro>
    </MemoryRouter>,
  )
}

describe('FronteiraDeErro — a tela que quebra no meio de uma conferência', () => {
  it('segura a queda, explica em linguagem de atendimento e mantém o resto do app vivo', () => {
    silenciarConsole()
    montar()

    // 1. segurou: há um alerta, e não uma tela em branco
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/Esta tela parou de funcionar/i)).toBeInTheDocument()

    // 2. o resto do aplicativo continua vivo
    expect(screen.getByText('navegação do aplicativo')).toBeInTheDocument()

    // 3. as duas saídas que quem está no meio da conferência precisa
    expect(screen.getByRole('button', { name: /recarregar a página/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voltar para a fila/i })).toBeInTheDocument()
  })

  it('NÃO mostra a mensagem do erro — ela pode carregar dado pessoal (regra 4)', () => {
    silenciarConsole()
    montar()

    expect(screen.queryByText(new RegExp(VALOR_SENSIVEL))).not.toBeInTheDocument()
    expect(screen.queryByText(/falha ao renderizar/i)).not.toBeInTheDocument()
  })

  it('"voltar para a fila" navega E rearma a fronteira — a fila aparece de verdade', async () => {
    silenciarConsole()
    const usuario = userEvent.setup()
    montar()

    await usuario.click(screen.getByRole('button', { name: /voltar para a fila/i }))

    // Se a fronteira não rearmasse, a rota mudaria e a pessoa continuaria
    // olhando a mesma tela de falha — que é o defeito mais fácil de deixar
    // passar num error boundary.
    expect(await screen.findByText('fila de conferência')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
