/**
 * `aria-modal="true"` só é verdade se o foco se comportar como modal.
 *
 * Os dois diálogos da conferência declaravam o atributo e não cumpriam nada do
 * que ele promete. Declarar e não cumprir é pior que não declarar: a tecnologia
 * assistiva confia no atributo e informa à pessoa que ela está num contexto do
 * qual, na prática, o foco escapa sem aviso.
 *
 * O teste vale-se do caminho REAL — abrir o diálogo de rejeição a partir da
 * tela de conferência —, e não de um harness sintético, porque o defeito
 * original estava justamente na montagem, não na ideia.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { servidorDeTeste } from '@/mocks/node'
import { configurarParaTeste, criarDocumento, limpar, limparReservas, materializar } from '@/mocks/dados'
import { PaginaConferencia } from '@/pages/PaginaConferencia'
import { Dialogo } from '@/shared/ui/Dialogo'
import { renderizarEmRota } from './apoio'

beforeAll(() => servidorDeTeste.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => servidorDeTeste.close())
beforeEach(() => { limpar(); limparReservas(); configurarParaTeste() })
afterEach(() => {
  servidorDeTeste.resetHandlers()
  servidorDeTeste.events.removeAllListeners()
})

function documentoNaFila(): string {
  const doc = criarDocumento('b'.repeat(64), 'scan0001.pdf')
  materializar(doc)
  return doc.id
}

const abrirTela = (id: string) =>
  renderizarEmRota(<PaginaConferencia />, `/conferencia/${id}`, '/conferencia/:id')

describe('Dialogo — as quatro obrigações de um modal', () => {
  it('ao abrir, o foco entra no diálogo; Escape fecha; ao fechar, o foco volta a quem abriu', async () => {
    const usuario = userEvent.setup()
    abrirTela(documentoNaFila())

    const botaoQueAbre = await screen.findByRole('button', { name: /^rejeitar$/i })
    await usuario.click(botaoQueAbre)

    const dialogo = await screen.findByRole('dialog')
    expect(dialogo).toHaveAttribute('aria-modal', 'true')

    // 1. o foco foi para DENTRO. Sem isto, a pessoa tabula pelo conteúdo que
    //    está atrás da cortina, achando que o modal a protege.
    expect(dialogo.contains(document.activeElement)).toBe(true)

    // 2. o título é o que o leitor de tela anuncia ao abrir
    const idTitulo = dialogo.getAttribute('aria-labelledby')
    expect(idTitulo).toBeTruthy()
    expect(document.getElementById(idTitulo!)).toHaveTextContent(/rejeitar documento/i)

    // 3. Escape fecha — é a saída que todo mundo tenta primeiro
    await usuario.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // 4. o foco voltou para o botão que abriu. Devolvê-lo ao <body> faria a
    //    próxima tabulação recomeçar do topo da página.
    expect(document.activeElement).toBe(botaoQueAbre)
  })

  it('o foco NÃO pula quando a tela de trás re-renderiza sozinha', () => {
    // A conferência re-renderiza sozinha: `useClaim` renova a reserva por
    // `setInterval` enquanto a tela está aberta, e quem monta o diálogo passa
    // `aoFechar={() => setRejeitando(false)}` — uma closure NOVA a cada render.
    //
    // Se o efeito do diálogo depender dela, cada renovação desmonta e remonta o
    // efeito: o foco volta para quem abriu e é mandado de novo para o primeiro
    // campo. Quem estivesse digitando a observação perderia o cursor de tempos
    // em tempos, sem entender por quê.
    //
    // O teste ataca o mecanismo direto, e não pelo caminho da tela: o que
    // precisa ficar provado é que uma IDENTIDADE nova de `aoFechar` não mexe no
    // foco. Testar pela tela dependeria de o temporizador disparar, e um teste
    // que passa com e sem o defeito não vale nada — este passou, na primeira
    // versão, exatamente assim.
    // O conteúdo espelha o diálogo de rejeição: o PRIMEIRO focável é o seletor
    // de motivo, e a pessoa está digitando no campo de observação, mais abaixo.
    // É essa distância que torna o salto visível — um harness em que o campo
    // digitado já é o primeiro focável passaria com e sem o defeito.
    const conteudo = (
      <Dialogo titulo="Título" aoFechar={() => {}} acoes={<button type="button">Fechar</button>}>
        <label htmlFor="motivo">Motivo</label>
        <select id="motivo" defaultValue="">
          <option value="">Escolha</option>
        </select>
        <label htmlFor="obs">Observação</label>
        <textarea id="obs" defaultValue="" />
      </Dialogo>
    )

    const { rerender } = render(conteudo)

    const area = screen.getByLabelText('Observação')
    area.focus()
    expect(document.activeElement).toBe(area)

    // Exatamente o que um render do pai produz: outra função, mesmo efeito.
    // `cloneElement` daria a MESMA identidade de `aoFechar`; o elemento é
    // remontado para que a closure seja de fato outra.
    rerender(
      <Dialogo titulo="Título" aoFechar={() => {}} acoes={<button type="button">Fechar</button>}>
        <label htmlFor="motivo">Motivo</label>
        <select id="motivo" defaultValue="">
          <option value="">Escolha</option>
        </select>
        <label htmlFor="obs">Observação</label>
        <textarea id="obs" defaultValue="" />
      </Dialogo>,
    )

    expect(document.activeElement).toBe(area)
  })

  it('Tab não escapa do diálogo: dos extremos, ele dá a volta', async () => {
    const usuario = userEvent.setup()
    abrirTela(documentoNaFila())

    await usuario.click(await screen.findByRole('button', { name: /^rejeitar$/i }))
    const dialogo = await screen.findByRole('dialog')

    const focalizaveis = Array.from(
      dialogo.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      ),
    )
    expect(focalizaveis.length).toBeGreaterThan(1)

    // Do último, Tab volta para o primeiro em vez de sair para a tela de trás.
    focalizaveis[focalizaveis.length - 1]!.focus()
    await usuario.tab()
    expect(document.activeElement).toBe(focalizaveis[0])

    // E o caminho inverso, que é o que se usa para voltar ao título.
    await usuario.tab({ shift: true })
    expect(dialogo.contains(document.activeElement)).toBe(true)
  })
})
