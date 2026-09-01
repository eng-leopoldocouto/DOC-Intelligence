/**
 * Anúncio das transições de estado para leitor de tela (fatos a e e).
 *
 * O estado desta tela muda SOZINHO, por consulta em lote a cada 2–15 s, com o
 * processamento levando de 5 a 40 s. Quem não vê a tela não tem como saber que
 * algo mudou: as etiquetas trocam em silêncio.
 *
 * Duas restrições moldam o formato do anúncio:
 *
 * 1. **Nenhum dado pessoal** (regra 4 do CLAUDE.md). O nome padronizado do
 *    documento contém o nome da pessoa — é literalmente o que o padrão
 *    `{tipo}_{nome}_{numero}` compõe. Anunciar "Fulano de Tal passou a Pronto"
 *    seria ler dado pessoal em voz alta numa sala de atendimento. Por isso o
 *    anúncio é AGREGADO: conta quantos mudaram e para onde, sem identificar
 *    nenhum.
 * 2. **Só quando MUDA.** Anunciar a cada consulta transformaria o leitor de
 *    tela num alarme constante, e a pessoa desligaria o recurso — que é o
 *    mesmo que não ter acessibilidade nenhuma.
 *
 * A primeira leitura apenas SEMEIA o mapa anterior. Sem isso, abrir a tela com
 * dez documentos anunciaria dez "transições" que não aconteceram.
 */
import { useEffect, useRef, useState } from 'react'
import type { EstadoDocumento } from '@/entities/documento/tipos'

export function useAnuncioDeTransicoes(
  estadoPorId: Record<string, EstadoDocumento>,
  rotuloDoEstado: (estado: EstadoDocumento) => string,
): string {
  const anterior = useRef<Record<string, EstadoDocumento> | null>(null)
  const [anuncio, setAnuncio] = useState('')

  // O rótulo é função nova a cada render; guardá-la numa ref evita que o efeito
  // dispare por causa da identidade dela em vez de por mudança de estado.
  const rotulo = useRef(rotuloDoEstado)
  rotulo.current = rotuloDoEstado

  // A chave é o que decide se houve mudança. Comparar objetos por referência
  // reanunciaria a cada render; comparar por conteúdo serializado, não.
  const chave = Object.entries(estadoPorId)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, estado]) => `${id}:${estado}`)
    .join('|')

  useEffect(() => {
    const atual = Object.fromEntries(
      chave ? chave.split('|').map((par) => par.split(':') as [string, EstadoDocumento]) : [],
    )

    if (anterior.current === null) {
      anterior.current = atual
      return
    }

    const porDestino = new Map<EstadoDocumento, number>()
    for (const [id, estado] of Object.entries(atual)) {
      const antes = anterior.current[id]
      // Documento novo na lista não é transição — ninguém mudou de estado.
      if (antes && antes !== estado) {
        porDestino.set(estado, (porDestino.get(estado) ?? 0) + 1)
      }
    }
    anterior.current = atual

    if (porDestino.size === 0) return

    const partes = [...porDestino.entries()].map(
      ([estado, n]) =>
        `${n} documento${n === 1 ? '' : 's'} ${n === 1 ? 'passou' : 'passaram'} para ${rotulo.current(estado)}`,
    )
    setAnuncio(`${partes.join('; ')}.`)
  }, [chave])

  return anuncio
}
