/**
 * Fronteira de erro do aplicativo (CLAUDE.md §4).
 *
 * Quem vê esta tela está no meio de uma conferência, com um documento de outra
 * pessoa aberto ao lado. A pior resposta possível é a tela branca: ela não diz
 * se a gravação foi feita, não diz o que fazer, e a pessoa recomeça do zero sem
 * saber se recomeçou em cima de trabalho perdido.
 *
 * Duas decisões que parecem detalhe e não são:
 *
 * 1. **A mensagem do erro NÃO vai para a tela.** `erro.message` pode carregar
 *    valor de campo — um CPF, uma filiação, o corpo de uma resposta da API.
 *    Mostrá-lo transformaria a tela de falha num vazamento, e o screenshot que
 *    alguém tira para pedir ajuda espalharia o dado (fato d, regra 4).
 * 2. **Nada é enviado a lugar nenhum.** Sem telemetria, sem log com o objeto de
 *    erro. Um relatório de erro com o CPF dentro é vazamento — é a mesma linha
 *    da tabela em `05-fatos-do-ambiente.md` sob o fato (d).
 *
 * O React já imprime o erro no console do navegador em desenvolvimento, que é
 * onde quem programa precisa dele. Não acrescentamos um segundo canal.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

type Props = {
  children: ReactNode
  /** Muda quando a rota muda: uma navegação bem-sucedida rearma a fronteira. */
  chaveDeReinicio: string
  aoVoltarParaFila: () => void
}

type Estado = { quebrou: boolean; chaveQueQuebrou: string }

class LimiteDeErro extends Component<Props, Estado> {
  override state: Estado = { quebrou: false, chaveQueQuebrou: '' }

  static getDerivedStateFromError(): Partial<Estado> {
    return { quebrou: true }
  }

  /**
   * Rearma ao trocar de rota.
   *
   * Sem isto, o botão "voltar para a fila" navegaria e a pessoa continuaria
   * vendo a tela de falha — a fronteira não sabe que o problema ficou na rota
   * anterior.
   */
  static getDerivedStateFromProps(props: Props, estado: Estado): Partial<Estado> | null {
    if (estado.quebrou && estado.chaveQueQuebrou && estado.chaveQueQuebrou !== props.chaveDeReinicio) {
      return { quebrou: false, chaveQueQuebrou: '' }
    }
    return null
  }

  override componentDidCatch(erro: Error, info: ErrorInfo): void {
    // Deliberadamente vazio quanto a REGISTRO: ver o cabeçalho deste arquivo.
    // Só guardamos em QUAL ROTA a falha ocorreu, para saber quando rearmar.
    void erro
    void info
    this.setState({ chaveQueQuebrou: this.props.chaveDeReinicio })
  }

  override render(): ReactNode {
    if (!this.state.quebrou) return this.props.children

    return (
      <div className="cartao falha-de-tela" role="alert">
        <h2>Esta tela parou de funcionar</h2>
        <p>
          O problema é do sistema, não do que você digitou.{' '}
          <strong>Nada foi gravado agora</strong> — a última gravação bem-sucedida
          continua salva, e o documento volta sozinho para a fila em até cinco
          minutos.
        </p>
        <p className="subtitulo">
          Se você acabou de corrigir campos sem salvar, o que estava na tela se
          perdeu. Abra o documento de novo pela fila e confira antes de gravar.
        </p>
        <div className="dialogo-acoes falha-de-tela-acoes">
          <button type="button" className="botao" onClick={() => window.location.reload()}>
            Recarregar a página
          </button>
          <button type="button" className="botao primario" onClick={this.props.aoVoltarParaFila}>
            Voltar para a fila
          </button>
        </div>
      </div>
    )
  }
}

/**
 * Envoltório de função só para ter acesso ao roteador: fronteira de erro
 * precisa ser classe (o React não expõe `componentDidCatch` como hook), e
 * classe não usa hook.
 */
export function FronteiraDeErro({ children }: { children: ReactNode }) {
  const localizacao = useLocation()
  const navegar = useNavigate()

  return (
    <LimiteDeErro
      chaveDeReinicio={localizacao.pathname}
      aoVoltarParaFila={() => navegar('/conferencia')}
    >
      {children}
    </LimiteDeErro>
  )
}
