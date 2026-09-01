/**
 * O segundo portão: validação de FORMATO, independente do modelo (fato a).
 *
 * Domínio puro (G6): sem React, sem fetch, sem window.
 *
 * ## Por que existe
 *
 * Até aqui o único portão desta interface era a confiança que o próprio modelo
 * declara sobre si mesmo. Isso tem um buraco de tamanho conhecido: um CPF
 * **inválido pelo dígito verificador** com confiança **0,97** entra como
 * `PRONTO`, vai para a planilha e só aparece semanas depois, quando alguém
 * tenta usar o número num sistema que o rejeita.
 *
 * A confiança do fornecedor é **autodeclarada**. É uma pontuação que o próprio
 * produtor do resultado atribui ao próprio resultado, e o fato (f) diz que esse
 * fornecedor será trocado e que os prompts vão mudar mais de uma vez no primeiro
 * ano — ou seja, a escala dessa pontuação vai mudar debaixo de nós sem aviso.
 * Um portão só, calibrado nessa escala, é um portão apoiado em areia.
 *
 * O dígito verificador do CPF, não. Ele é aritmética fechada, definida em norma,
 * e continua valendo com qualquer fornecedor.
 *
 * ## O que este arquivo NÃO faz
 *
 * Não muda o estado do documento. **Reprovar o formato não move um documento de
 * `PRONTO` para `AGUARDANDO_CONFERENCIA`** — essa transição é do servidor, e
 * inventá-la no cliente criaria duas máquinas de estado divergentes (o oposto
 * da ADR-005). O que o cliente faz é **marcar o campo** e **dizer por quê**, em
 * todo lugar onde o campo aparece. O limite está declarado na ADR-015.
 *
 * ## A regra dirigida por tipo de dado, e não por tipo de documento
 *
 * A validação é escolhida pelo `tipoDeDado` que o `DescritorDeCampo` já carrega
 * — o mesmo eixo do registry de componentes (ADR-008). Nenhum tipo de documento
 * aparece aqui, e nenhum precisa: quando o fornecedor introduzir "Certidão de
 * Nascimento", a data do registro será validada pela mesma regra de DATA.
 */
import type { CampoExtraido } from './tipos'
import type { TipoDeDado } from '@/entities/tipo-documento/tipos'
import { campoAbaixoDoLimiar } from './estado'

export type MotivoDeConferencia = 'CONFIANCA_BAIXA' | 'FORMATO_INVALIDO'

const digitos = (valor: string): string => valor.replace(/\D/g, '')

/** Todos os dígitos iguais passam na conta e não são documento de ninguém. */
const repetido = (d: string): boolean => /^(\d)\1+$/.test(d)

const digitoVerificador = (base: string, pesoInicial: number): number => {
  let soma = 0
  for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i)
  const resto = (soma * 10) % 11
  return resto === 10 ? 0 : resto
}

export function cpfValido(valor: string): boolean {
  const d = digitos(valor)
  if (d.length !== 11 || repetido(d)) return false
  return (
    digitoVerificador(d.slice(0, 9), 10) === Number(d[9]) &&
    digitoVerificador(d.slice(0, 10), 11) === Number(d[10])
  )
}

/** O CNPJ usa pesos cíclicos de 2 a 9, e não a contagem regressiva do CPF. */
const digitoCnpj = (base: string): number => {
  let soma = 0
  let peso = 2
  for (let i = base.length - 1; i >= 0; i--) {
    soma += Number(base[i]) * peso
    peso = peso === 9 ? 2 : peso + 1
  }
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

export function cnpjValido(valor: string): boolean {
  const d = digitos(valor)
  if (d.length !== 14 || repetido(d)) return false
  return digitoCnpj(d.slice(0, 12)) === Number(d[12]) && digitoCnpj(d.slice(0, 13)) === Number(d[13])
}

/**
 * Plausibilidade de data, e não só formato.
 *
 * O erro real de leitura de foto torta não é "31 de fevereiro" — é a troca de um
 * dígito no ano: `1987` vira `1087`, `2026` vira `2926`. Ambos são datas de
 * calendário perfeitamente válidas e ambos são impossíveis num documento.
 *
 * A janela é generosa de propósito: 1900 pega nascimento de qualquer pessoa
 * viva, e vinte anos à frente pega validade e vencimento sem acusar documento
 * bom. Uma janela apertada geraria alarme falso, e alarme falso ensina a
 * ignorar o alarme.
 */
export function dataPlausivel(valor: string, agora: Date = new Date()): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim())
  if (!m) return false

  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const d = new Date(Date.UTC(ano, mes - 1, dia))
  // Rejeita 31/02: o Date normaliza para 03/03 e a volta não confere.
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    return false
  }

  return ano >= 1900 && ano <= agora.getUTCFullYear() + 20
}

/**
 * Formato fecha? Tipo de dado sem regra conhecida responde SIM — o desconhecido
 * nunca reprova. É a mesma escolha do registry: o fornecedor vai introduzir
 * tipos que ainda não conhecemos (fato f), e travar o trabalho do atendimento
 * por causa disso seria a pior resposta possível.
 *
 * Valor vazio também responde SIM: ausência é assunto de `obrigatorio`, não de
 * formato. Confundir os dois faria todo campo opcional em branco parecer erro.
 */
export function formatoFecha(
  valor: string | null | undefined,
  tipoDeDado: TipoDeDado,
  agora: Date = new Date(),
): boolean {
  const v = (valor ?? '').trim()
  if (v === '') return true

  switch (tipoDeDado) {
    case 'CPF': return cpfValido(v)
    case 'CNPJ': return cnpjValido(v)
    case 'DATA': return dataPlausivel(v, agora)
    default: return true
  }
}

/**
 * O portão completo: por que este campo precisa de olho humano.
 *
 * Ordem deliberada — **formato antes de confiança**. Quando o campo falha nos
 * dois, o motivo útil é o formato: ele é verificável, aponta o que fazer e não
 * depende de uma escala que o fornecedor pode mudar amanhã.
 *
 * Repare na assimetria com `campoAbaixoDoLimiar`: um campo **corrigido por
 * pessoa** deixa de ser duvidoso por confiança (a opinião do modelo perdeu a
 * relevância no instante em que alguém conferiu), mas **não** deixa de ser
 * inválido por formato. Quem digitou o CPF errado agora foi a pessoa, e é
 * justamente esse o erro que nenhum outro mecanismo pega.
 */
export function motivoDeConferencia(
  campo: CampoExtraido | undefined,
  tipoDeDado: TipoDeDado,
  limiar: number,
  agora: Date = new Date(),
): MotivoDeConferencia | null {
  if (campo && !formatoFecha(campo.valor, tipoDeDado, agora)) return 'FORMATO_INVALIDO'
  if (campo && campoAbaixoDoLimiar(campo, limiar)) return 'CONFIANCA_BAIXA'
  return null
}
