/**
 * Diálogo modal — a primitiva que faz `aria-modal="true"` deixar de ser mentira.
 *
 * Os dois diálogos da conferência (conflito e rejeição) declaravam
 * `role="dialog"` e `aria-modal="true"` e não cumpriam nada do que essa
 * declaração promete a um leitor de tela. Isso é pior que não declarar: a
 * tecnologia assistiva confia no atributo e informa à pessoa que ela está num
 * contexto modal do qual, na prática, o foco pode escapar sem aviso.
 *
 * Quatro obrigações, todas aqui e em nenhum outro lugar:
 *
 * 1. **Foco inicial dentro do diálogo.** Sem isso o foco fica no botão que
 *    abriu, atrás da cortina — a pessoa tabula pelo conteúdo bloqueado.
 * 2. **Escape fecha.** É a saída que todo mundo tenta primeiro.
 * 3. **Foco volta para quem abriu.** Devolver o foco ao `<body>` faz a próxima
 *    tabulação recomeçar do topo da página, e quem depende de teclado perde o
 *    lugar em que estava.
 * 4. **Tab é contido.** Tabular para fora de um modal e continuar interagindo
 *    com o que está por baixo é exatamente o que `aria-modal` afirma que não
 *    acontece.
 *
 * Por que não `<dialog>` nativo: o jsdom não implementa `showModal()`, e a
 * conferência é a tela mais testada da entrega. Trocar cobertura de teste por
 * ~40 linhas de foco não compensa aqui. Registrado em D-11.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Não inclui `[tabindex="-1"]`: o próprio contêiner recebe `-1` para poder
 * receber o foco inicial quando não houver controle algum dentro, e ele não
 * deve entrar no ciclo do Tab.
 */
const FOCALIZAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),' +
  ' textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Dialogo({
  titulo, aoFechar, children, acoes,
}: {
  /** Vira o `aria-labelledby`. É o que o leitor de tela anuncia ao abrir. */
  titulo: ReactNode
  aoFechar: () => void
  children: ReactNode
  acoes: ReactNode
}) {
  const caixa = useRef<HTMLDivElement>(null)
  const idTitulo = useId()

  /**
   * `aoFechar` numa ref, e o efeito roda UMA vez.
   *
   * Não é preciosismo — é um defeito com sintoma. Quem chama passa
   * `onCancelar={() => setRejeitando(false)}`, uma closure nova a cada render
   * do pai. E o pai re-renderiza sozinho: `useClaim` renova a reserva por
   * `setInterval` enquanto a tela está aberta.
   *
   * Com `[aoFechar]` na lista de dependências, cada renovação desmontava e
   * remontava o efeito: o foco era devolvido a quem abriu e mandado de volta
   * para o primeiro campo. Na prática, a pessoa digitando a observação da
   * rejeição perdia o cursor de tempos em tempos, sem entender por quê.
   */
  const fechar = useRef(aoFechar)
  fechar.current = aoFechar

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null

    const dentro = caixa.current
    const primeiro = dentro?.querySelector<HTMLElement>(FOCALIZAVEIS)
    ;(primeiro ?? dentro)?.focus()

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        fechar.current()
        return
      }
      if (e.key !== 'Tab' || !caixa.current) return

      // Sem filtro de visibilidade de propósito: `offsetParent` é sempre nulo
      // no jsdom (não há layout), e um filtro que se comporta diferente no
      // teste e no navegador é pior que filtro nenhum. O conteúdo destes
      // diálogos é raso, e o seletor já exclui o que está desabilitado.
      const alvos = Array.from(caixa.current.querySelectorAll<HTMLElement>(FOCALIZAVEIS))
      if (alvos.length === 0) return

      const primeiroAlvo = alvos[0]!
      const ultimoAlvo = alvos[alvos.length - 1]!
      const ativo = document.activeElement

      // Contenção: dos extremos, o Tab dá a volta em vez de sair da cortina.
      if (e.shiftKey && (ativo === primeiroAlvo || ativo === caixa.current)) {
        e.preventDefault()
        ultimoAlvo.focus()
      } else if (!e.shiftKey && ativo === ultimoAlvo) {
        e.preventDefault()
        primeiroAlvo.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar, true)
    return () => {
      document.removeEventListener('keydown', aoTeclar, true)
      // Devolve o foco a QUEM ABRIU. `isConnected` porque o elemento pode ter
      // saído do DOM enquanto o diálogo estava aberto (a linha da fila que
      // sumiu, o botão que virou "Salvando…").
      if (anterior?.isConnected) anterior.focus()
    }
    // Sem dependências, de propósito: ver o comentário acima da ref `fechar`.
  }, [])

  return (
    <div
      className="dialogo-fundo"
      onMouseDown={(e) => { if (e.target === e.currentTarget) aoFechar() }}
    >
      <div
        className="dialogo"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        ref={caixa}
        tabIndex={-1}
      >
        <h2 id={idTitulo}>{titulo}</h2>
        {children}
        <div className="dialogo-acoes">{acoes}</div>
      </div>
    </div>
  )
}
