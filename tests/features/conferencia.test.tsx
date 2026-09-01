import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { servidorDeTeste } from '@/mocks/node'
import { configurarParaTeste, criarDocumento, limpar, limparReservas, materializar } from '@/mocks/dados'
import { client } from '@/shared/api/client'
import { PaginaConferencia } from '@/pages/PaginaConferencia'
import { renderizarEmRota } from './apoio'

beforeAll(() => servidorDeTeste.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => servidorDeTeste.close())
beforeEach(() => { limpar(); limparReservas(); configurarParaTeste() })

/**
 * Sem isto, o tipo de documento INVENTADO pelo teste T-03 vaza para os testes
 * seguintes: eles carregam um catálogo que não contém o tipo do seu próprio
 * documento, o painel de campos não renderiza e a falha aparece longe da causa.
 *
 * Os ouvintes de evento também precisam sair — acumulados entre casos, passam
 * a contar requisições de testes anteriores.
 */
afterEach(() => {
  servidorDeTeste.resetHandlers()
  servidorDeTeste.events.removeAllListeners()
})

const abrir = (id: string) =>
  renderizarEmRota(<PaginaConferencia />, `/conferencia/${id}`, '/conferencia/:id')

/**
 * Primeiro campo do PAINEL, sem saber como ele se chama.
 *
 * O mock sorteia o tipo do documento, então o teste não pode assumir que
 * existe um campo "nome" — e não deveria assumir nem que existe, porque saber
 * de antemão o que a API devolve é exatamente o que a ADR-008 proíbe. Esta
 * consulta é a versão de teste do mesmo princípio.
 */
async function primeiroCampoDoPainel(container: HTMLElement): Promise<HTMLInputElement> {
  await screen.findByRole('button', { name: /salvar e concluir/i })
  const painel = await waitFor(() => {
    const p = container.querySelector('.painel-campos')
    if (!p) throw new Error('painel de campos ainda não renderizou')
    return p
  })
  const input = painel.querySelector<HTMLInputElement>('input[type=text]')
  if (!input) throw new Error('nenhum campo de texto no painel')
  return input
}

/**
 * Cria o documento direto no mock, sem passar pelo envio.
 *
 * O envio usa multipart/form-data, que o jsdom não serializa corretamente
 * (ver tests/mocks/contrato.test.ts). Mas a conferência não depende do envio:
 * fazer o teste atravessar uma tela que ele não está testando só acrescentaria
 * um motivo de falha alheio ao que se quer verificar.
 */
function documentoNaFila(nomeOrigem = 'scan0001.pdf'): string {
  const doc = criarDocumento('a'.repeat(64), nomeOrigem)
  materializar(doc)
  return doc.id
}

describe('T-03 — o front-end renderiza um tipo de documento que NUNCA viu', () => {
  it('campos inéditos aparecem corretamente, sem uma linha de código nova', async () => {
    const id = documentoNaFila()
    const tipoId = (await client.obterDocumento(id)).tipoDocumentoId

    // Tipo inventado, com campos que o front-end desconhece por completo.
    servidorDeTeste.use(
      http.get('*/api/v1/tipos-documento', () =>
        HttpResponse.json({
          limiarConfiancaPadrao: 0.85,
          itens: [{
            id: tipoId,
            rotulo: 'Certidão de Nascimento',
            padraoDeNome: '{tipo}_{nomeRegistrado}',
            campos: [
              { chave: 'nomeRegistrado', rotulo: 'Nome registrado', tipoDeDado: 'TEXTO', obrigatorio: true, ordem: 1, sensivel: false },
              { chave: 'dataRegistro', rotulo: 'Data do registro', tipoDeDado: 'DATA', obrigatorio: true, ordem: 2, sensivel: false },
              { chave: 'livro', rotulo: 'Livro', tipoDeDado: 'NUMERO', obrigatorio: false, ordem: 3, sensivel: false },
              { chave: 'cartorio', rotulo: 'Cartório', tipoDeDado: 'SELECAO', obrigatorio: true, ordem: 4, sensivel: false, opcoes: ['1º Ofício', '2º Ofício'] },
            ],
          }],
        }),
      ),
    )

    abrir(id)

    expect(await screen.findByLabelText(/Nome registrado/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Data do registro/)).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText(/Livro/)).toBeInTheDocument()
    const cartorio = screen.getByLabelText(/Cartório/)
    expect(cartorio.tagName).toBe('SELECT')
    expect(within(cartorio).getByRole('option', { name: '1º Ofício' })).toBeInTheDocument()
  })
})

describe('T-01 — ninguém sobrescreve o trabalho de ninguém (fato g)', () => {
  it('conflito nomeia quem alterou, mostra a divergência e não descarta nem sobrescreve', async () => {
    const usuario = userEvent.setup()
    const id = documentoNaFila()

    const { container } = abrir(id)
    const primeiroCampo = await primeiroCampoDoPainel(container)
    const chaveDaAna = primeiroCampo.id.replace('campo-', '')

    // Bruno, noutra sessão, grava primeiro. A versão avança.
    const carregado = await client.obterDocumento(id)
    // Bruno mexe num campo DIFERENTE do da Ana, para que a divergência seja
    // real e a tabela do conflito tenha duas linhas.
    const chaveDele = carregado.campos.find((c) => c.chave !== chaveDaAna)!.chave
    await fetch(`http://doc-intelligence.local/api/v1/documentos/${id}/campos`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'If-Match': String(carregado.versao),
        'X-Usuario-Id': 'bruno.lima',
        'X-Usuario-Nome': 'Bruno Lima',
      },
      body: JSON.stringify({ campos: [{ chave: chaveDele, valor: 'VALOR DO BRUNO' }] }),
    })

    // Ana edita e tenta salvar com a versão que carregou antes.
    await usuario.clear(primeiroCampo)
    await usuario.type(primeiroCampo, 'VALOR DA ANA')
    await usuario.click(screen.getByRole('button', { name: /salvar e concluir/i }))

    // 1. avisa, NOMEANDO quem alterou
    expect(await screen.findByText(/Bruno Lima alterou este documento/i)).toBeInTheDocument()
    // 2. mostra o que está salvo do outro lado
    expect(screen.getByText('VALOR DO BRUNO')).toBeInTheDocument()
    // 3. NÃO descarta a edição da Ana
    expect(primeiroCampo).toHaveValue('VALOR DA ANA')
    // 4. NÃO sobrescreve o Bruno no servidor
    const noServidor = await client.obterDocumento(id)
    expect(noServidor.versao).toBe(carregado.versao + 1)
    expect(noServidor.campos.find((c) => c.chave === chaveDele)?.valor).toBe('VALOR DO BRUNO')
  })

  it('envia If-Match com a versão que foi carregada', async () => {
    const usuario = userEvent.setup()
    const id = documentoNaFila()
    const carregado = await client.obterDocumento(id)

    let ifMatch: string | null = null
    servidorDeTeste.events.on('request:start', ({ request }) => {
      if (request.method === 'PATCH') ifMatch = request.headers.get('If-Match')
    })

    const { container } = abrir(id)
    await primeiroCampoDoPainel(container)
    await usuario.click(screen.getByRole('button', { name: /salvar e concluir/i }))

    await waitFor(() => expect(ifMatch).toBe(String(carregado.versao)))
  })
})

describe('RF-12 — rejeição (ADR-012)', () => {
  it('exige motivo e NÃO dispara reprocessamento', async () => {
    const usuario = userEvent.setup()
    const id = documentoNaFila()

    let reprocessamentos = 0
    servidorDeTeste.events.on('request:start', ({ request }) => {
      if (request.url.includes('/reprocessar')) reprocessamentos++
    })

    abrir(id)
    await usuario.click(await screen.findByRole('button', { name: /rejeitar/i }))

    const confirmar = screen.getByRole('button', { name: /confirmar rejeição/i })
    expect(confirmar).toBeDisabled() // sem motivo, não deixa

    await usuario.selectOptions(screen.getByLabelText(/motivo/i), 'ILEGIVEL')
    expect(confirmar).toBeEnabled()
    await usuario.click(confirmar)

    await waitFor(async () =>
      expect((await client.obterDocumento(id)).estado).toBe('REJEITADO'))
    // Reprocessar foto ilegível gasta dinheiro para chegar ao mesmo lugar (fato a)
    expect(reprocessamentos).toBe(0)
  })
})
