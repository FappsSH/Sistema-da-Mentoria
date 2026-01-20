import { NavLink } from 'react-router-dom'
import { Home, Calendar, FolderKanban, Route, Settings } from 'lucide-react'

const menuItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: FolderKanban, label: 'Projeto', path: '/projeto' },
  { icon: Route, label: 'Roadmap', path: '/roadmap' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
]

export function Sidebar() {
  return (
    <aside className="sidebar-container">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/logo-fapps.svg" alt="Fapps" style={{ height: '32px' }} />
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer info */}
      <div className="sidebar-footer">
        <p>Sistema de Mentoria</p>
        <p className="mt-1">v1.0.0 - MVP</p>
      </div>
    </aside>
  )
}
