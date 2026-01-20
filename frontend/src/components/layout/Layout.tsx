import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { NotificationBell } from '../shared/NotificationBell'
import { UserAvatar } from '../shared/UserAvatar'
import { useAuth } from '../../hooks/useAuth'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: '#1a1a4e', borderTopColor: 'transparent' }} />
          <p style={{ color: '#64748b' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />

      {/* Top header bar */}
      <header
        className="fixed top-0 right-0 h-16 flex items-center justify-end px-6 z-30"
        style={{
          left: '256px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div className="flex items-center gap-4">
          <NotificationBell />
          <UserAvatar />
        </div>
      </header>

      <main style={{ marginLeft: '256px', minHeight: '100vh', paddingTop: '64px' }}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
