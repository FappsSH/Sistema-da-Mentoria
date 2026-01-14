import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from '../services/supabase'
import { Notificacao } from '../types'
import { useAuth } from './useAuth'

interface NotificacoesContextType {
  notificacoes: Notificacao[]
  naoLidas: number
  loading: boolean
  marcarComoLida: (id: string) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  refetch: () => Promise<void>
}

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined)

export function NotificacoesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotificacoes = useCallback(async () => {
    if (!user) {
      setNotificacoes([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      setNotificacoes(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchNotificacoes()

    // Realtime subscription para novas notificações
    if (user) {
      const channel = supabase
        .channel('notificacoes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificacoes',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchNotificacoes()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user, fetchNotificacoes])

  const naoLidas = notificacoes.filter(n => !n.lida).length

  const marcarComoLida = async (id: string) => {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)

    if (!error) {
      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      )
    }
  }

  const marcarTodasComoLidas = async () => {
    if (!user) return

    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', user.id)
      .eq('lida', false)

    if (!error) {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    }
  }

  return (
    <NotificacoesContext.Provider value={{
      notificacoes,
      naoLidas,
      loading,
      marcarComoLida,
      marcarTodasComoLidas,
      refetch: fetchNotificacoes,
    }}>
      {children}
    </NotificacoesContext.Provider>
  )
}

export function useNotificacoes() {
  const context = useContext(NotificacoesContext)
  if (context === undefined) {
    throw new Error('useNotificacoes must be used within a NotificacoesProvider')
  }
  return context
}
