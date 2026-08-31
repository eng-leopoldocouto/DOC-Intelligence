/**
 * Implementação do contrato (docs/spec/openapi.yaml).
 *
 * UM conjunto de handlers, TRÊS consumidores (ADR-004):
 *   navegador (browser.ts) · testes (node.ts) · porta HTTP real (servidor.ts)
 *
 * Isso elimina a divergência clássica entre "dublê de teste" e "dublê de demo",
 * que é a origem do defeito "passa no teste, quebra na tela".
 */
import { http, HttpResponse, delay } from 'msw'
import type { CampoExtraido, Documento } from '@/entities/documento/tipos'
import {
  CATALOGO, config, criarDocumento, liberarReserva, obter, porContentHash, publico,
  quemAlterou, registrarAlteracao, reservaAtiva, reservar, salvar, todos,
} from './dados'

const BASE = '*/api/v1'

const problema = (status: number, title: string, detail?: string, extra: object = {}) =>
  HttpResponse.json(
    { type: 'about:blank', title, status, ...(detail ? { detail } : {}), ...extra },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )

/** Identidade injetada pelo host (ADR-011). Ausência é caminho VÁLIDO. */
const identidade = (req: Request) => ({
  id: req.headers.get('X-Usuario-Id') ?? 'anonimo',
  nome: req.headers.get('X-Usuario-Nome'),
})

/** Latência do modelo. Em teste, config zera e isto não custa nada. */
const latencia = () =>
  delay(config.latenciaMin + Math.random() * (config.latenciaMax - config.latenciaMin))

export const handlers = [
  // -------------------------------------------------------------------------
  // Catálogo — o endpoint que sustenta o fato (f)
  // -------------------------------------------------------------------------
  http.get(`${BASE}/tipos-documento`, () =>
    HttpResponse.json({ itens: CATALOGO, limiarConfiancaPadrao: config.limiarConfianca }),
  ),

  // -------------------------------------------------------------------------
  // Envio — 202, ou 200 se já existir (fatos a e c)
  // -------------------------------------------------------------------------
  http.post(`${BASE}/documentos`, async ({ request }) => {
    const form = await request.formData()
    const contentHash = String(form.get('contentHash') ?? '')
    const nomeOrigem = String(form.get('nomeOrigem') ?? '')
    const arquivo = form.get('arquivo')

    if (!(arquivo instanceof File)) return problema(400, 'Arquivo ausente')
    if (!/^[a-f0-9]{64}$/.test(contentHash)) return problema(400, 'contentHash inválido')

    const existente = porContentHash(contentHash)
    if (existente) {
      // Reenviar por precaução é comportamento razoável do atendimento, não
      // erro. Responder 409 empurraria a interface para o ramo de erro num
      // caso normal — e mensagem de erro em fluxo normal treina a pessoa a
      // ignorar mensagens. NENHUMA chamada ao modelo é disparada aqui.
      return HttpResponse.json({ documento: publico(existente), duplicado: true }, { status: 200 })
    }

    const doc = criarDocumento(contentHash, nomeOrigem)
    return HttpResponse.json({ documento: publico(doc), duplicado: false }, { status: 202 })
  }),

  // -------------------------------------------------------------------------
  // Status em lote — 1 requisição para N documentos (fato e)
  // -------------------------------------------------------------------------
  http.get(`${BASE}/documentos/status`, ({ request }) => {
    const ids = (new URL(request.url).searchParams.get('ids') ?? '').split(',').filter(Boolean)
    const itens = ids
      .map(obter)
      .filter((d): d is NonNullable<typeof d> => Boolean(d))
      .map((d) => ({ id: d.id, estado: d.estado, versao: d.versao, confianca: d.confianca }))
    return HttpResponse.json({ itens })
  }),

  // -------------------------------------------------------------------------
  // Listagem com cursor (fato e: a fila muda enquanto é paginada)
  // -------------------------------------------------------------------------
  http.get(`${BASE}/documentos`, ({ request }) => {
    const q = new URL(request.url).searchParams
    const estado = q.get('estado')
    const limite = Number(q.get('limite') ?? 50)
    const cursor = q.get('cursor')

    // Ordem de chegada, sem priorização (premissa P2, ADR-005).
    const todosOrdenados = todos()
      .filter((d) => (estado ? d.estado === estado : true))
      .sort((a, b) => a.recebidoEm.localeCompare(b.recebidoEm))

    const inicio = cursor ? todosOrdenados.findIndex((d) => d.id === cursor) + 1 : 0
    const pagina = todosOrdenados.slice(inicio, inicio + limite)
    const proximo = inicio + limite < todosOrdenados.length ? pagina.at(-1)?.id : null

    return HttpResponse.json({ itens: pagina.map(publico), proximoCursor: proximo ?? null })
  }),

  http.get(`${BASE}/documentos/:id`, ({ params }) => {
    const doc = obter(String(params['id']))
    if (!doc) return problema(404, 'Documento não encontrado')
    return HttpResponse.json(publico(doc), { headers: { ETag: String(doc.versao) } })
  }),

  // -------------------------------------------------------------------------
  // Arquivo — URL assinada e curta, nunca permanente (fato d)
  // -------------------------------------------------------------------------
  http.get(`${BASE}/documentos/:id/arquivo`, ({ params }) => {
    const doc = obter(String(params['id']))
    if (!doc) return problema(404, 'Documento não encontrado')
    const assinatura = Math.random().toString(36).slice(2)
    return HttpResponse.json({
      url: `/fixtures/${encodeURIComponent(doc.nomeOrigem)}?sig=${assinatura}`,
      expiraEm: new Date(Date.now() + 5 * 60_000).toISOString(),
    })
  }),

  // -------------------------------------------------------------------------
  // Reprocessamento — explícito e cobrado (fato a)
  // -------------------------------------------------------------------------
  http.post(`${BASE}/documentos/:id/reprocessar`, async ({ params }) => {
    const doc = obter(String(params['id']))
    if (!doc) return problema(404, 'Documento não encontrado')
    if (doc.estado !== 'FALHOU' && doc.estado !== 'EXPIRADO') {
      return problema(409, 'Estado não permite reprocessamento',
        `O documento está em ${doc.estado}.`)
    }
    await latencia()
    doc.estado = 'RECEBIDO'
    doc.recebidoEm = new Date().toISOString()
    doc.motivoFalha = null
    doc._destino = 'AGUARDANDO_CONFERENCIA'
    doc._latenciaMs = config.latenciaMin
    salvar(doc)
    return HttpResponse.json(publico(doc), { status: 202 })
  }),

  // -------------------------------------------------------------------------
  // Reserva (fato g, parte 1: contra o DESPERDÍCIO)
  // -------------------------------------------------------------------------
  http.post(`${BASE}/documentos/:id/conferencia/claim`, ({ params, request }) => {
    const id = String(params['id'])
    const doc = obter(id)
    if (!doc) return problema(404, 'Documento não encontrado')

    const quem = identidade(request)
    const atual = reservaAtiva(id)

    if (atual && atual.usuarioId !== quem.id) {
      return problema(409, 'Documento já está em conferência',
        `Reservado por ${atual.usuarioNome ?? 'outra sessão'}.`)
    }

    // Renovar a própria reserva é idempotente: a tela renova enquanto está ativa.
    const nova = reservar(id, quem.id, quem.nome)
    if (doc.estado === 'AGUARDANDO_CONFERENCIA') {
      doc.estado = 'EM_CONFERENCIA'
      salvar(doc)
    }
    return HttpResponse.json({
      usuarioId: nova.usuarioId,
      usuarioNome: nova.usuarioNome,
      expiraEm: new Date(nova.expiraEm).toISOString(),
    })
  }),

  http.delete(`${BASE}/documentos/:id/conferencia/claim`, ({ params }) => {
    const id = String(params['id'])
    const doc = obter(id)
    liberarReserva(id)
    // Devolve o documento à fila: quem sai sem gravar não deixa o item preso.
    if (doc && doc.estado === 'EM_CONFERENCIA') {
      doc.estado = 'AGUARDANDO_CONFERENCIA'
      salvar(doc)
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // -------------------------------------------------------------------------
  // Gravação com trava otimista (fato g, parte 2: contra a PERDA)
  // -------------------------------------------------------------------------
  http.patch(`${BASE}/documentos/:id/campos`, async ({ params, request }) => {
    const id = String(params['id'])
    const doc = obter(id)
    if (!doc) return problema(404, 'Documento não encontrado')

    const ifMatch = request.headers.get('If-Match')
    if (!ifMatch) return problema(428, 'If-Match é obrigatório')

    if (Number(ifMatch) !== doc.versao) {
      // O corpo traz o documento ATUAL e QUEM alterou, para que a interface
      // mostre o que mudou. A decisão volta para a pessoa — o cliente nunca
      // resolve conflito sozinho.
      return problema(409, 'Conflito de versão',
        'Outra pessoa alterou este documento enquanto você editava.',
        { documentoAtual: publico(doc), alteradoPor: quemAlterou(id) })
    }

    const corpo = (await request.json()) as {
      campos: { chave: string; valor: string | null }[]
      nomePadronizado?: string
    }

    const porChave = new Map(corpo.campos.map((c) => [c.chave, c.valor]))
    doc.campos = doc.campos.map((c): CampoExtraido =>
      porChave.has(c.chave) && porChave.get(c.chave) !== c.valor
        // Campo tocado por pessoa passa a origem HUMANO e confiança 1:
        // a incerteza do modelo deixou de ser relevante.
        ? { ...c, valor: porChave.get(c.chave) ?? null, confianca: 1, origem: 'HUMANO' }
        : c,
    )
    if (corpo.nomePadronizado) doc.nomePadronizado = corpo.nomePadronizado

    doc.versao += 1                       // invariante 3
    doc.estado = 'PRONTO'                 // conclui a conferência
    registrarAlteracao(id, identidade(request).nome ?? identidade(request).id)
    liberarReserva(id)
    salvar(doc)

    return HttpResponse.json(publico(doc), { headers: { ETag: String(doc.versao) } })
  }),

  // -------------------------------------------------------------------------
  // Rejeição (ADR-012) — derivada do fato (b)
  // -------------------------------------------------------------------------
  http.post(`${BASE}/documentos/:id/rejeitar`, async ({ params, request }) => {
    const id = String(params['id'])
    const doc = obter(id)
    if (!doc) return problema(404, 'Documento não encontrado')

    const { motivo, observacao } = (await request.json()) as {
      motivo: string
      observacao?: string
    }
    if (!motivo) return problema(400, 'Motivo é obrigatório')

    doc.estado = 'REJEITADO'              // invariante 5: terminal
    doc.motivoFalha = observacao ? `${motivo}: ${observacao}` : motivo
    doc.versao += 1
    registrarAlteracao(id, identidade(request).nome ?? identidade(request).id)
    liberarReserva(id)
    salvar(doc)

    // Rejeitar NÃO dispara reprocessamento: reprocessar uma foto ilegível
    // gasta dinheiro para chegar ao mesmo lugar (fato a).
    return HttpResponse.json(publico(doc))
  }),
]

/** Documento fabricado direto no estado desejado — usado por testes e pela demo. */
export type { Documento }
