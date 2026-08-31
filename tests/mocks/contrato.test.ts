/**
 * @vitest-environment node
 *
 * Teste de CONTRATO: exercita a API, não o DOM. Roda em ambiente Node porque
 * o jsdom traz Blob/File/FormData próprios que o fetch do Node não reconhece
 * ao serializar multipart/form-data — em navegador real os três vêm do mesmo
 * motor e o problema não existe.
 *
 * Rodar aqui em Node é mais fiel ao navegador do que rodar em jsdom.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { servidorDeTeste } from '@/mocks/node'
import { configurarParaTeste, limpar, limparReservas } from '@/mocks/dados'
import { client } from '@/shared/api/client'
import { ErroDeApi } from '@/shared/api/http'
import { sha256 } from '@/shared/lib/hash'

beforeAll(() => servidorDeTeste.listen({ onUnhandledRequest: 'error' }))
afterAll(() => servidorDeTeste.close())
beforeEach(() => { limpar(); limparReservas(); configurarParaTeste() })

const arquivo = (conteudo: string, nome: string) =>
  new File([conteudo], nome, { type: 'application/pdf' })

async function enviar(conteudo: string, nome: string) {
  const f = arquivo(conteudo, nome)
  return client.enviarDocumento(f, await sha256(f), nome)
}

describe('T-02 — duplicata não vira segunda chamada paga (fatos a e c)', () => {
  it('mesmo conteúdo com nomes diferentes é duplicata', async () => {
    const a = await enviar('conteudo do rg', 'scan0001.pdf')
    const b = await enviar('conteudo do rg', 'WhatsApp Image 2026-08-11 at 09.12.33.jpeg')

    expect(a.duplicado).toBe(false)
    expect(b.duplicado).toBe(true)
    expect(b.documento.id).toBe(a.documento.id)
  })

  it('mesmo NOME com conteúdos diferentes NÃO é duplicata', async () => {
    // scan0001.pdf é nome de scanner e chega repetido para documentos
    // distintos. Deduplicar por nome apagaria documento legítimo (ADR-007).
    const a = await enviar('comprovante de residencia', 'scan0001.pdf')
    const b = await enviar('contracheque', 'scan0001.pdf')
    expect(b.duplicado).toBe(false)
    expect(b.documento.id).not.toBe(a.documento.id)
  })
})

describe('T-04 — nada chega a PRONTO sem passar pelo portão de confiança', () => {
  it('confiança abaixo do limiar vai para a fila, não para PRONTO', async () => {
    const { documento } = await enviar('documento borrado', 'IMG_20260811_091247.jpg')
    const doc = await client.obterDocumento(documento.id)
    expect(doc.estado).toBe('AGUARDANDO_CONFERENCIA')
    expect(doc.confianca).toBeLessThan(0.85)
  })
})

describe('fato (f) — o catálogo é a fonte dos campos', () => {
  it('devolve schema com rótulo, tipo de dado, ordem e sensibilidade', async () => {
    const { itens, limiarConfiancaPadrao } = await client.tiposDocumento()
    expect(itens.length).toBeGreaterThan(0)
    expect(limiarConfiancaPadrao).toBeGreaterThan(0)
    for (const campo of itens[0]!.campos) {
      expect(campo).toMatchObject({
        chave: expect.any(String),
        rotulo: expect.any(String),
        tipoDeDado: expect.any(String),
        ordem: expect.any(Number),
        sensivel: expect.any(Boolean),
      })
    }
  })
})

describe('T-01 — trava otimista (fato g, parte 2)', () => {
  it('If-Match desatualizado responde 409 com o documento atual e quem alterou', async () => {
    const { documento } = await enviar('rg do fulano', 'scan0001.pdf')
    const id = documento.id
    await client.reservar(id)
    const carregado = await client.obterDocumento(id)

    // O teste NÃO conhece nome de campo — pega o primeiro do schema recebido.
    // Assumir 'nome' seria cometer no teste o mesmo pecado que a ADR-008
    // proíbe no front-end: saber de antemão o que a API vai devolver.
    const chave = carregado.campos[0]!.chave

    // Bruno grava primeiro; a versão avança.
    await client.gravarCampos(id, carregado.versao, [{ chave, valor: 'BRUNO GRAVOU' }])

    // Ana grava com a versão que carregou antes.
    const erro = await client
      .gravarCampos(id, carregado.versao, [{ chave, valor: 'ANA GRAVOU' }])
      .catch((e) => e)

    expect(erro).toBeInstanceOf(ErroDeApi)
    expect((erro as ErroDeApi).status).toBe(409)
    const corpo = (erro as ErroDeApi).corpo as { documentoAtual: { versao: number } }
    expect(corpo.documentoAtual.versao).toBe(carregado.versao + 1)
  })

  it('gravação bem-sucedida leva a PRONTO e marca o campo como HUMANO', async () => {
    const { documento } = await enviar('rg do fulano', 'a.pdf')
    await client.reservar(documento.id)
    const carregado = await client.obterDocumento(documento.id)
    const chave = carregado.campos[0]!.chave
    const salvo = await client.gravarCampos(documento.id, carregado.versao, [
      { chave, valor: 'CORRIGIDO PELA PESSOA' },
    ])

    expect(salvo.estado).toBe('PRONTO')
    expect(salvo.versao).toBe(carregado.versao + 1)
    expect(salvo.campos.find((c) => c.chave === chave)).toMatchObject({
      valor: 'CORRIGIDO PELA PESSOA', origem: 'HUMANO', confianca: 1,
    })
  })
})

describe('T-05 — reprocessamento nunca é automático (fato a)', () => {
  it('reprocessar documento que não falhou responde 409', async () => {
    const { documento } = await enviar('rg', 'a.pdf')
    const erro = await client.reprocessar(documento.id).catch((e) => e)
    expect((erro as ErroDeApi).status).toBe(409)
  })
})

describe('rejeição (ADR-012)', () => {
  it('rejeitar leva a REJEITADO, que é terminal, e registra o motivo', async () => {
    const { documento } = await enviar('foto ilegivel', 'IMG_20260811_091247.jpg')
    await client.reservar(documento.id)
    const rejeitado = await client.rejeitar(documento.id, 'ILEGIVEL', 'Foto sem foco')

    expect(rejeitado.estado).toBe('REJEITADO')
    expect(rejeitado.motivoFalha).toContain('ILEGIVEL')
  })
})
