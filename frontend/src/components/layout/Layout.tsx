import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, loading } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{ borderColor: '#3cdbc0', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#64748b' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div className="main-layout">
        {/* Header - apenas notificações e avatar */}
        <header className="main-header">
          <div className="header-right">
            {/* Notifications */}
            <div className="notification-bell">
              <Bell size={20} color="#64748b" />
            </div>

            {/* User Avatar */}
            <div className="avatar avatar-md avatar-placeholder">
              {profile?.nome_completo ? getInitials(profile.nome_completo) : 'U'}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
