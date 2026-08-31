/**
 * Estado em memória do mock e catálogo de tipos.
 *
 * FRONTEIRA (ADR-004): o mock SIMULA o serviço, não o implementa. Ele existe
 * para que os fatos do ambiente sejam alcançáveis na demonstração e nos testes.
 * Se este arquivo começar a conter regra que pertence à Trilha A, extrapolou.
 *
 * ATENÇÃO: os nomes de tipos de documento ("RG", "Contracheque"...) vivem
 * SOMENTE aqui. Eles nunca aparecem no código do front-end (G1, ADR-008) —
 * o teste de arquitetura em tests/arquitetura/ verifica isso.
 */
import type { CampoExtraido, Documento, EstadoDocumento } from '@/entities/documento/tipos'
import type { DescritorDeCampo, TipoDeDado, TipoDocumento } from '@/entities/tipo-documento/tipos'
import { comporNomePadronizado } from '@/entities/documento/nome'

export const config = {
  /** Fato (a): o modelo leva de 5 a 40 s. Testes sobrescrevem para 0. */
  latenciaMin: 5_000,
  latenciaMax: 40_000,
  /** Fato (a): "de vez em quando devolve erro ou simplesmente não responde". */
  taxaFalha: 0.08,
  /** Fato (f): o limiar mora no servidor, para ser calibrado sem deploy do front. */
  limiarConfianca: 0.85,
  /** Proporção dos processados que cai na fila de conferência. */
  taxaBaixaConfianca: 0.55,
}

export function configurarParaTeste(): void {
  config.latenciaMin = 0
  config.latenciaMax = 0
  config.taxaFalha = 0
  config.taxaBaixaConfianca = 1
}

// ---------------------------------------------------------------------------
// Catálogo — o schema que o front-end recebe e obedece
// ---------------------------------------------------------------------------

/**
 * Construtor de descritor.
 *
 * `sensivel` é obrigatório no tipo gerado porque o contrato lhe dá `default`,
 * o que significa que o servidor SEMPRE o envia. Foi o contrato-primeiro que
 * apontou isso: sem os tipos gerados, o mock teria omitido o campo e a
 * interface descobriria a ausência só em tempo de execução.
 */
const cd = (
  chave: string,
  rotulo: string,
  tipoDeDado: TipoDeDado,
  ordem: number,
  extra: Partial<DescritorDeCampo> = {},
): DescritorDeCampo => ({
  chave, rotulo, tipoDeDado, ordem, obrigatorio: false, sensivel: false, ...extra,
})

export const CATALOGO: TipoDocumento[] = [
  {
    id: 'rg',
    rotulo: 'Carteira de Identidade (RG)',
    padraoDeNome: '{tipo}_{nome}_{numero}',
    campos: [
      cd('nome', 'Nome completo', 'TEXTO', 1, { obrigatorio: true }),
      cd('filiacao', 'Filiação', 'TEXTO', 2),
      cd('nascimento', 'Data de nascimento', 'DATA', 3, { obrigatorio: true }),
      cd('numero', 'Número do RG', 'TEXTO', 4, { obrigatorio: true }),
      cd('cpf', 'CPF', 'CPF', 5, { sensivel: true }),
      cd('orgaoEmissor', 'Órgão emissor', 'SELECAO', 6, {
        obrigatorio: true, opcoes: ['SSP/RN', 'SSP/CE', 'SSP/PB', 'SSP/PE', 'DETRAN/RN'],
      }),
    ],
  },
  {
    id: 'comprovante-residencia',
    rotulo: 'Comprovante de Residência',
    limiarConfianca: 0.8,
    padraoDeNome: '{tipo}_{titular}_{competencia}',
    campos: [
      cd('titular', 'Titular', 'TEXTO', 1, { obrigatorio: true }),
      cd('logradouro', 'Logradouro', 'TEXTO', 2, { obrigatorio: true }),
      cd('municipio', 'Município', 'TEXTO', 3, { obrigatorio: true }),
      cd('uf', 'UF', 'SELECAO', 4, { obrigatorio: true, opcoes: ['RN', 'CE', 'PB', 'PE'] }),
      cd('cep', 'CEP', 'TEXTO', 5, { mascara: '00000-000' }),
      cd('competencia', 'Competência', 'DATA', 6, { obrigatorio: true }),
    ],
  },
  {
    id: 'contracheque',
    rotulo: 'Contracheque',
    // Contracheque amassado extrai pior que um RG bem fotografado — por isso o
    // limiar é POR TIPO, e não uma constante global do front-end.
    limiarConfianca: 0.9,
    padraoDeNome: '{tipo}_{nome}_{competencia}',
    campos: [
      cd('nome', 'Nome do empregado', 'TEXTO', 1, { obrigatorio: true }),
      cd('cpf', 'CPF', 'CPF', 2, { obrigatorio: true, sensivel: true }),
      cd('empregador', 'Empregador', 'TEXTO', 3, { obrigatorio: true }),
      cd('cnpjEmpregador', 'CNPJ do empregador', 'CNPJ', 4),
      cd('competencia', 'Competência', 'DATA', 5, { obrigatorio: true }),
      cd('liquido', 'Valor líquido', 'NUMERO', 6, { obrigatorio: true }),
    ],
  },
  {
    id: 'procuracao',
    rotulo: 'Procuração',
    padraoDeNome: '{tipo}_{outorgante}',
    campos: [
      cd('outorgante', 'Outorgante', 'TEXTO', 1, { obrigatorio: true }),
      cd('cpfOutorgante', 'CPF do outorgante', 'CPF', 2, { obrigatorio: true, sensivel: true }),
      cd('outorgado', 'Outorgado', 'TEXTO', 3, { obrigatorio: true }),
      cd('oabOutorgado', 'OAB do outorgado', 'TEXTO', 4),
      cd('dataOutorga', 'Data da outorga', 'DATA', 5, { obrigatorio: true }),
    ],
  },
]

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

/**
 * Documento interno: o público mais o "destino" sorteado no momento do envio.
 *
 * O processamento é PREGUIÇOSO — nada de `setTimeout`. Ao criar o documento
 * sorteamos quanto ele vai demorar e onde vai parar; a cada consulta,
 * comparamos o relógio. Assim o mock funciona igual com relógio real e com
 * relógio falso de teste, sem depender de temporizador pendente.
 */
export type DocumentoInterno = Documento & {
  _alteradoPor?: string | null
  _latenciaMs: number
  _destino: EstadoDocumento
  _camposFinais: CampoExtraido[]
  _confiancaFinal: number | null
}

const documentos = new Map<string, DocumentoInterno>()
/** Fato (c): o índice por hash é o que impede a segunda chamada paga. */
const porHash = new Map<string, string>()
let sequencia = 0

const entre = (min: number, max: number) => min + Math.random() * (max - min)

const campo = (chave: string, valor: string | null, confianca: number): CampoExtraido => ({
  chave, valor, confianca, origem: 'MODELO',
})

/**
 * Valores fictícios. Nenhum dado real de pessoa (regra do enunciado, G9).
 * CPF 000.000.000-00 é inválido pelo dígito verificador, de propósito.
 */
const VALORES: Record<string, () => CampoExtraido[]> = {
  rg: () => [
    campo('nome', 'FULANO DE TAL DA SILVA', entre(0.86, 0.98)),
    campo('filiacao', 'BELTRANA DE TAL E SICRANO DA SILVA', entre(0.55, 0.9)),
    campo('nascimento', '1987-03-14', entre(0.8, 0.97)),
    campo('numero', '12.345.678-9', entre(0.35, 0.95)),
    campo('cpf', '00000000000', entre(0.7, 0.96)),
    campo('orgaoEmissor', 'SSP/RN', entre(0.75, 0.99)),
  ],
  'comprovante-residencia': () => [
    campo('titular', 'FULANO DE TAL DA SILVA', entre(0.8, 0.97)),
    campo('logradouro', 'RUA EXEMPLO, 000, APTO 00', entre(0.6, 0.93)),
    campo('municipio', 'MOSSORO', entre(0.85, 0.99)),
    campo('uf', 'RN', entre(0.9, 0.99)),
    campo('cep', '59600-000', entre(0.7, 0.95)),
    campo('competencia', '2026-07-01', entre(0.65, 0.94)),
  ],
  contracheque: () => [
    campo('nome', 'FULANO DE TAL DA SILVA', entre(0.85, 0.98)),
    campo('cpf', '00000000000', entre(0.75, 0.96)),
    campo('empregador', 'EMPRESA FICTICIA LTDA', entre(0.7, 0.95)),
    campo('cnpjEmpregador', '00000000000000', entre(0.6, 0.92)),
    campo('competencia', '2026-07-01', entre(0.7, 0.95)),
    campo('liquido', '0000.00', entre(0.4, 0.9)),
  ],
  procuracao: () => [
    campo('outorgante', 'FULANO DE TAL DA SILVA', entre(0.8, 0.97)),
    campo('cpfOutorgante', '00000000000', entre(0.7, 0.95)),
    campo('outorgado', 'ADVOGADO FICTICIO DE EXEMPLO', entre(0.75, 0.96)),
    campo('oabOutorgado', 'OAB/RN 00.000', entre(0.5, 0.9)),
    campo('dataOutorga', '2026-08-01', entre(0.8, 0.97)),
  ],
}

const tipoAoAcaso = () => CATALOGO[Math.floor(Math.random() * CATALOGO.length)]!

export function criarDocumento(contentHash: string, nomeOrigem: string): DocumentoInterno {
  const tipo = tipoAoAcaso()
  const campos = VALORES[tipo.id]!()

  // Fato (a): os dois modos de falha são distintos. Erro tem resposta;
  // não responder tem silêncio, e a ação humana cabível é diferente.
  const falhou = Math.random() < config.taxaFalha
  const destino: EstadoDocumento = falhou
    ? Math.random() < 0.5 ? 'FALHOU' : 'EXPIRADO'
    : Math.random() < config.taxaBaixaConfianca
      ? 'AGUARDANDO_CONFERENCIA'
      : 'PRONTO'

  const limiar = tipo.limiarConfianca ?? config.limiarConfianca
  const confianca = destino === 'AGUARDANDO_CONFERENCIA'
    ? entre(0.45, limiar - 0.01)
    : destino === 'PRONTO' ? entre(limiar, 0.99) : null

  const doc: DocumentoInterno = {
    id: `doc-${++sequencia}`,
    contentHash,
    nomeOrigem,
    nomePadronizado: null,
    tipoDocumentoId: null,
    estado: 'RECEBIDO',
    confianca: null,
    campos: [],
    versao: 1,
    recebidoEm: new Date().toISOString(),
    motivoFalha: null,
    _latenciaMs: entre(config.latenciaMin, config.latenciaMax),
    _destino: destino,
    _camposFinais: campos,
    _confiancaFinal: confianca,
    ...(destino === 'FALHOU' || destino === 'EXPIRADO' ? {} : { tipoDocumentoId: tipo.id }),
  }

  documentos.set(doc.id, doc)
  porHash.set(contentHash, doc.id)
  return doc
}

/** Aplica a passagem do tempo. Chamado em toda leitura. */
export function materializar(doc: DocumentoInterno): DocumentoInterno {
  if (doc.estado !== 'RECEBIDO' && doc.estado !== 'EM_PROCESSAMENTO') return doc

  const decorrido = Date.now() - new Date(doc.recebidoEm).getTime()
  if (decorrido < doc._latenciaMs) {
    doc.estado = decorrido > 300 ? 'EM_PROCESSAMENTO' : 'RECEBIDO'
    return doc
  }

  doc.estado = doc._destino
  doc.tipoDocumentoId = doc._destino === 'FALHOU' || doc._destino === 'EXPIRADO'
    ? null
    : (doc.tipoDocumentoId ?? tipoAoAcaso().id)
  doc.campos = doc._destino === 'FALHOU' || doc._destino === 'EXPIRADO' ? [] : doc._camposFinais
  doc.confianca = doc._confiancaFinal
  doc.motivoFalha =
    doc._destino === 'FALHOU' ? 'O modelo devolveu erro ao processar este documento.'
    : doc._destino === 'EXPIRADO' ? 'O modelo não respondeu dentro do prazo.'
    : null
  doc.procedencia = {
    modelo: 'fornecedor-vision-2.1',
    versaoPrompt: `${doc.tipoDocumentoId ?? 'geral'}-v4`,
    processadoEm: new Date().toISOString(),
  }

  // O nome padronizado é PROPOSTO pelo servidor a partir dos campos extraídos
  // (ADR-013). O front-end o recebe editável — ele herda a incerteza dos campos
  // que o compõem.
  const tipo = CATALOGO.find((t) => t.id === doc.tipoDocumentoId)
  doc.nomePadronizado = tipo
    ? comporNomePadronizado(tipo.padraoDeNome, doc.campos, tipo.rotulo)
    : null

  return doc
}

export const obter = (id: string) => {
  const d = documentos.get(id)
  return d ? materializar(d) : undefined
}
export const porContentHash = (hash: string) => {
  const id = porHash.get(hash)
  return id ? obter(id) : undefined
}
export const todos = () => Array.from(documentos.values()).map(materializar)
export const salvar = (doc: DocumentoInterno) => documentos.set(doc.id, doc)

export function limpar(): void {
  documentos.clear()
  porHash.clear()
  sequencia = 0
}

// ---------------------------------------------------------------------------
// Reservas de conferência (fato g, parte 1: contra o desperdício)
// ---------------------------------------------------------------------------

export const TTL_RESERVA_MS = 5 * 60 * 1000

type ReservaInterna = { usuarioId: string; usuarioNome: string | null; expiraEm: number }
const reservas = new Map<string, ReservaInterna>()

/**
 * Reserva expirada é reserva inexistente.
 *
 * O TTL é o que evita o pior modo de falha do locking: a pessoa abriu o
 * documento, foi almoçar e travou o item para sempre. A aba fechada sem aviso
 * é o caso NORMAL, não a exceção.
 */
export function reservaAtiva(id: string): ReservaInterna | undefined {
  const r = reservas.get(id)
  if (!r) return undefined
  if (r.expiraEm <= Date.now()) {
    reservas.delete(id)
    return undefined
  }
  return r
}

export function reservar(id: string, usuarioId: string, usuarioNome: string | null): ReservaInterna {
  const nova = { usuarioId, usuarioNome, expiraEm: Date.now() + TTL_RESERVA_MS }
  reservas.set(id, nova)
  return nova
}

export const liberarReserva = (id: string) => reservas.delete(id)
export const limparReservas = () => reservas.clear()

/** Remove os campos internos do mock antes de responder. */
export function publico(doc: DocumentoInterno): Documento {
  const { _latenciaMs, _destino, _camposFinais, _confiancaFinal, _alteradoPor, ...resto } = doc
  void _latenciaMs; void _destino; void _camposFinais; void _confiancaFinal; void _alteradoPor
  const r = reservaAtiva(doc.id)
  return {
    ...resto,
    reserva: r ? { usuarioId: r.usuarioId, usuarioNome: r.usuarioNome, expiraEm: new Date(r.expiraEm).toISOString() } : undefined,
  }
}

export const quemAlterou = (id: string) => documentos.get(id)?._alteradoPor ?? null
export const registrarAlteracao = (id: string, quem: string | null) => {
  const d = documentos.get(id)
  if (d) d._alteradoPor = quem
}
