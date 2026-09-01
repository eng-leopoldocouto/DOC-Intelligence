import { NavLink, Outlet } from 'react-router-dom'
import { identidadeAtual } from '@/shared/api/identidade'

export function App() {
  const identidade = identidadeAtual()

  return (
    <div className="casca">
      <header className="barra">
        <div className="marca">
          DOC Intelligence <span>· Atendimento</span>
        </div>

        <nav>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'ativo' : '')} end>
            Enviar
          </NavLink>
          <NavLink to="/acompanhamento" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Acompanhamento
          </NavLink>
          <NavLink to="/conferencia" className={({ isActive }) => (isActive ? 'ativo' : '')}>
            Conferência
          </NavLink>
        </nav>

        {/* A identidade VEM do sistema hospedeiro; não há login aqui (ADR-011).
            Sem identidade, a aplicação continua funcionando de forma anônima. */}
        <div className="usuario">
          {identidade ? (identidade.nome ?? identidade.id) : 'sessão sem identidade'}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
