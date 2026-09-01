/**
 * Uma função por endpoint do contrato. Nenhuma regra de negócio aqui:
 * só tradução de chamada, tipada pelos tipos GERADOS de openapi.yaml (G3).
 */
import type {
  Documento,
  PaginaDeDocumentos,
  RespostaEnvio,
  Reserva,
  StatusResumido,
  EstadoDocumento,
} from '@/entities/documento/tipos'
import type { CatalogoDeTipos } from '@/entities/tipo-documento/tipos'
import type { paths } from './types.gen'
import { http } from './http'

/**
 * Derivado do contrato, não escrito à mão (G3, ADR-003).
 *
 * A primeira versão listava os cinco motivos literalmente aqui — o que violava
 * a regra 1 do CLAUDE.md e criaria uma segunda fonte de verdade, capaz de
 * divergir do OpenAPI em silêncio. Apontado pelo agente auditor.
 */
export type MotivoRejeicao = NonNullable<
  paths['/documentos/{id}/rejeitar']['post']['requestBody']
>['content']['application/json']['motivo']

export const client = {
  /**
   * Envia um documento. Responde 202 (novo) ou 200 com `duplicado: true`.
   * O `contentHash` é obrigatório: é ele que evita a chamada paga em duplicata
   * (fatos a e c).
   */
  async enviarDocumento(
    arquivo: File,
    contentHash: string,
    nomeOrigem: string,
  ): Promise<RespostaEnvio> {
    const form = new FormData()
    form.append('arquivo', arquivo)
    form.append('contentHash', contentHash)
    form.append('nomeOrigem', nomeOrigem)
    return http<RespostaEnvio>('/documentos', { metodo: 'POST', corpo: form })
  },

  /**
   * Estado de N documentos numa ÚNICA requisição (fato e).
   * Com 800 em acompanhamento, um GET por documento derrubaria o navegador
   * antes de derrubar o servidor.
   */
  async statusEmLote(ids: string[]): Promise<StatusResumido[]> {
    if (ids.length === 0) return []
    const r = await http<{ itens: StatusResumido[] }>(
      `/documentos/status?ids=${encodeURIComponent(ids.join(','))}`,
    )
    return r.itens
  },

  obterDocumento: (id: string) => http<Documento>(`/documentos/${id}`),

  listarDocumentos: (params: { estado?: EstadoDocumento; cursor?: string; limite?: number } = {}) => {
    const q = new URLSearchParams()
    if (params.estado) q.set('estado', params.estado)
    if (params.cursor) q.set('cursor', params.cursor)
    if (params.limite) q.set('limite', String(params.limite))
    const sufixo = q.toString() ? `?${q}` : ''
    return http<PaginaDeDocumentos>(`/documentos${sufixo}`)
  },

  /** Reserva para conferência, com TTL. Contra o DESPERDÍCIO do fato (g). */
  reservar: (id: string) =>
    http<Reserva>(`/documentos/${id}/conferencia/claim`, { metodo: 'POST' }),

  /**
   * `keepalive` para que a liberação sobreviva ao fechamento da aba. Sem isso,
   * a reserva só se soltaria pelo TTL, e o próximo conferente esperaria cinco
   * minutos por um documento que ninguém está mais olhando.
   */
  liberar: (id: string, keepalive = false) =>
    http<void>(`/documentos/${id}/conferencia/claim`, { metodo: 'DELETE', keepalive }),

  /**
   * Grava correções e conclui a conferência.
   * `If-Match` é obrigatório: contra a PERDA do fato (g). Versão desatualizada
   * responde 409 com o documento atual, e a decisão volta para a pessoa.
   */
  gravarCampos: (
    id: string,
    versao: number,
    campos: { chave: string; valor: string | null }[],
    nomePadronizado?: string,
  ) =>
    http<Documento>(`/documentos/${id}/campos`, {
      metodo: 'PATCH',
      ifMatch: String(versao),
      json: { campos, ...(nomePadronizado ? { nomePadronizado } : {}) },
    }),

  /** Saída para documento ilegível (ADR-012). NÃO dispara reprocessamento. */
  rejeitar: (id: string, motivo: MotivoRejeicao, observacao?: string) =>
    http<Documento>(`/documentos/${id}/rejeitar`, {
      metodo: 'POST',
      json: { motivo, ...(observacao ? { observacao } : {}) },
    }),

  /**
   * Ação EXPLÍCITA e cobrada (fato a). Nunca chamada automaticamente:
   * a interface exige confirmação humana que informa o custo.
   */
  reprocessar: (id: string) =>
    http<Documento>(`/documentos/${id}/reprocessar`, { metodo: 'POST' }),

  /** Catálogo com o schema de campos. O front-end não conhece tipo algum (fato f). */
  tiposDocumento: () => http<CatalogoDeTipos>('/tipos-documento'),

  /** URL assinada e curta. Nunca cacheada, nunca permanente (fato d). */
  urlDoArquivo: (id: string) =>
    http<{ url: string; expiraEm: string }>(`/documentos/${id}/arquivo`),
}
