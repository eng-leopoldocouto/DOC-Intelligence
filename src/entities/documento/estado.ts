/**
 * Máquina de estados e portão de confiança.
 *
 * Domínio puro (G6): sem React, sem fetch, sem window.
 * Espelha `docs/spec/03-modelo-de-dominio.md`.
 */
import type { CampoExtraido, EstadoDocumento } from './tipos'

/**
 * Transições válidas. A tabela É a especificação — não há regra escondida
 * em condicional espalhada pelos componentes.
 */
const TRANSICOES: Record<EstadoDocumento, readonly EstadoDocumento[]> = {
  RECEBIDO: ['EM_PROCESSAMENTO'],
  EM_PROCESSAMENTO: ['PRONTO', 'AGUARDANDO_CONFERENCIA', 'FALHOU', 'EXPIRADO'],
  // Invariante 1: de AGUARDANDO só se sai pela conferência humana.
  // NÃO existe caminho direto para PRONTO.
  AGUARDANDO_CONFERENCIA: ['EM_CONFERENCIA'],
  // Volta para a fila quando a reserva expira (fato g: aba fechada sem aviso).
  EM_CONFERENCIA: ['PRONTO', 'REJEITADO', 'AGUARDANDO_CONFERENCIA'],
  // Invariante 4: só por ação humana explícita — cada volta custa dinheiro (fato a).
  FALHOU: ['EM_PROCESSAMENTO', 'REJEITADO'],
  EXPIRADO: ['EM_PROCESSAMENTO', 'REJEITADO'],
  // Invariante 5: terminais.
  PRONTO: [],
  REJEITADO: [],
}

export const transicaoValida = (de: EstadoDocumento, para: EstadoDocumento): boolean =>
  TRANSICOES[de].includes(para)

export const ehTerminal = (estado: EstadoDocumento): boolean =>
  TRANSICOES[estado].length === 0

/** Estados em que o documento ainda está sendo trabalhado pela máquina. */
export const emProcessamento = (estado: EstadoDocumento): boolean =>
  estado === 'RECEBIDO' || estado === 'EM_PROCESSAMENTO'

/** Estados em que a máquina desistiu e cabe decisão humana. */
export const falhou = (estado: EstadoDocumento): boolean =>
  estado === 'FALHOU' || estado === 'EXPIRADO'

/**
 * Portão de confiança (invariante 1, comportamento 4 do produto).
 *
 * Confiança AUSENTE conta como insuficiente. Tratar ausência como confiança
 * alta deixaria documento não processado passar por pronto — o modo de falha
 * mais caro deste sistema, porque é silencioso.
 *
 * O limiar VEM DA API (fato f). Esta função só compara.
 */
export const precisaConferencia = (
  confianca: number | null | undefined,
  limiar: number,
): boolean => confianca === null || confianca === undefined || confianca < limiar

/**
 * Confiança por campo, não só do documento: um documento a 90% no geral pode
 * ter um campo a 30%, e é esse campo que precisa do olho humano.
 *
 * Campo já corrigido por pessoa nunca aparece como duvidoso — a confiança do
 * modelo deixou de ser relevante no momento em que alguém o conferiu.
 */
export const campoAbaixoDoLimiar = (campo: CampoExtraido, limiar: number): boolean =>
  campo.origem !== 'HUMANO' && precisaConferencia(campo.confianca, limiar)
