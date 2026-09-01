/**
 * A ÚNICA costura de rede do projeto (G2, ADR-002).
 *
 * Nada fora deste diretório chama `fetch`. Aqui moram, num lugar só:
 * transporte, cabeçalhos de identidade, If-Match, política de retry,
 * normalização de erro (RFC 9457) e sanitização de dado pessoal.
 *
 * A sanitização mora aqui porque este é o ÚLTIMO ponto por onde todo erro
 * passa. Espalhada pelos componentes, seria esquecida no primeiro catch novo.
 */
import type { Problema } from '@/entities/documento/tipos'
import { cabecalhosDeIdentidade } from './identidade'

export const BASE = (import.meta.env['VITE_API_BASE'] as string | undefined) ?? '/api/v1'

/** Erros de infraestrutura, seguros para repetir. 4xx nunca é retentável. */
const RETENTAVEIS = new Set([502, 503, 504])

export class ErroDeApi extends Error {
  constructor(
    readonly status: number,
    readonly problema: Problema,
    readonly corpo?: unknown,
  ) {
    super(problema.title || `Erro ${status}`)
    this.name = 'ErroDeApi'
  }
}

export type OpcoesHttp = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  corpo?: BodyInit | null
  ifMatch?: string
  json?: unknown
  /**
   * Mantém a requisição viva depois de a página começar a ser descarregada.
   *
   * Necessário para liberar a reserva de conferência no `beforeunload`: um
   * `fetch` comum é cancelado nesse momento, e a reserva só se soltaria pelo
   * TTL — cinco minutos de espera a cada aba fechada (fato g).
   */
  keepalive?: boolean
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Remove qualquer coisa com aparência de dado pessoal antes de o erro sair
 * daqui (G4, fato d). Um relatório de erro com CPF dentro é vazamento por
 * outro nome.
 */
const PADROES_PII = [
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, // CPF
  /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, // CNPJ
  /\b\d{1,2}\.?\d{3}\.?\d{3}-?[0-9X]\b/gi, // RG
]

export function sanitizarTexto(texto: string): string {
  return PADROES_PII.reduce((acc, p) => acc.replace(p, '[REDIGIDO]'), texto)
}

function sanitizarErro(erro: unknown): unknown {
  if (erro instanceof ErroDeApi) {
    return new ErroDeApi(
      erro.status,
      { ...erro.problema, detail: erro.problema.detail ? sanitizarTexto(erro.problema.detail) : undefined },
      erro.corpo,
    )
  }
  if (erro instanceof Error) {
    erro.message = sanitizarTexto(erro.message)
  }
  return erro
}

async function construirErro(r: Response): Promise<ErroDeApi> {
  let corpo: unknown
  let problema: Problema = { type: 'about:blank', title: r.statusText, status: r.status }
  try {
    corpo = await r.json()
    if (corpo && typeof corpo === 'object' && 'title' in corpo) {
      problema = corpo as Problema
    }
  } catch {
    // Resposta sem corpo JSON: o problema genérico acima já serve.
  }
  return new ErroDeApi(r.status, problema, corpo)
}

export async function http<T>(caminho: string, opcoes: OpcoesHttp = {}): Promise<T> {
  const metodo = opcoes.metodo ?? 'GET'

  // G5: retry SÓ em GET idempotente. Nada que dispare o modelo é repetido
  // automaticamente — cada execução é cobrada por documento (fato a).
  const tentativas = metodo === 'GET' ? 3 : 1

  let ultimoErro: unknown
  for (let n = 1; n <= tentativas; n++) {
    try {
      const cabecalhos: Record<string, string> = {
        ...cabecalhosDeIdentidade(),
        ...(opcoes.ifMatch ? { 'If-Match': opcoes.ifMatch } : {}),
        ...(opcoes.json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      }

      const resposta = await fetch(BASE + caminho, {
        method: metodo,
        headers: cabecalhos,
        body: opcoes.json !== undefined ? JSON.stringify(opcoes.json) : opcoes.corpo,
        ...(opcoes.keepalive ? { keepalive: true } : {}),
      })

      if (!resposta.ok) throw await construirErro(resposta)
      if (resposta.status === 204) return undefined as T
      return (await resposta.json()) as T
    } catch (erro) {
      ultimoErro = erro
      const ehUltima = n === tentativas
      const retentavel = erro instanceof ErroDeApi ? RETENTAVEIS.has(erro.status) : true
      if (ehUltima || !retentavel) throw sanitizarErro(erro)
      await esperar(2 ** n * 250)
    }
  }
  throw sanitizarErro(ultimoErro)
}
