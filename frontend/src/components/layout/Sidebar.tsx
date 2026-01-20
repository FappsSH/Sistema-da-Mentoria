import { NavLink } from 'react-router-dom'
import { Home, Calendar, FolderKanban, Route, Settings, Grid3X3 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const menuItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: FolderKanban, label: 'Projeto', path: '/projeto' },
  { icon: Route, label: 'Roadmap', path: '/roadmap' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
]

export function Sidebar() {
  const { profile } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Grid3X3 size={20} color="#ffffff" />
        </div>
        <span className="sidebar-logo-text">fapps</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {profile?.nome_completo ? getInitials(profile.nome_completo) : 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Sistema de Mentoria</div>
            <div className="sidebar-user-role">v1.0.0 - MVP</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
