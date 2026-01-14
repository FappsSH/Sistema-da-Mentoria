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
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface border-r border-border z-30 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="text-xs text-text-secondary text-center">
          <p>Sistema de Mentoria</p>
          <p className="mt-1">v1.0.0 - MVP</p>
        </div>
      </div>
    </aside>
  )
}
