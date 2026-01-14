import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNotificacoes } from '../../hooks/useNotificacoes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function NotificationBell() {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas } = useNotificacoes()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case 'roadmap_vencido':
        return 'text-danger'
      case 'reuniao_hoje':
        return 'text-success'
      default:
        return 'text-secondary'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
      >
        <Bell size={22} />
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-lg border border-border overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
            <h3 className="font-semibold text-text-primary">Notificações</h3>
            {naoLidas > 0 && (
              <button
                onClick={marcarTodasComoLidas}
                className="text-xs text-secondary hover:text-primary flex items-center gap-1 transition-colors"
              >
                <CheckCheck size={14} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="px-4 py-8 text-center text-text-secondary">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`
                    px-4 py-3 border-b border-border last:border-b-0 cursor-pointer
                    hover:bg-background transition-colors
                    ${!notificacao.lida ? 'bg-secondary/5' : ''}
                  `}
                  onClick={() => marcarComoLida(notificacao.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${getIconColor(notificacao.tipo)}`}>
                      <Bell size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notificacao.lida ? 'font-semibold' : ''} text-text-primary`}>
                        {notificacao.titulo}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {notificacao.mensagem}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {format(new Date(notificacao.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
