import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, Badge, Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Roadmap, Reuniao } from '../types'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Route,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function Home() {
  const { profile } = useAuth()
  const [metrics, setMetrics] = useState({
    pendentes: 0,
    concluidos: 0,
    vencidos: 0,
  })
  const [proximaReuniao, setProximaReuniao] = useState<Reuniao | null>(null)
  const [ultimosRoadmaps, setUltimosRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!profile) return

      // Buscar métricas dos roadmaps
      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('*, projetos!inner(user_id)')
        .eq('projetos.user_id', profile.id)

      if (roadmaps) {
        setMetrics({
          pendentes: roadmaps.filter(r => r.status === 'pendente').length,
          concluidos: roadmaps.filter(r => r.status === 'concluido').length,
          vencidos: roadmaps.filter(r => r.status === 'vencido').length,
        })
        setUltimosRoadmaps(
          roadmaps
            .filter(r => r.status === 'pendente')
            .sort((a, b) => new Date(a.data_prazo || '').getTime() - new Date(b.data_prazo || '').getTime())
            .slice(0, 5)
        )
      }

      // Buscar próxima reunião
      const { data: reunioes } = await supabase
        .from('reunioes')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'agendada')
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)

      if (reunioes && reunioes.length > 0) {
        setProximaReuniao(reunioes[0])
      }

      setLoading(false)
    }

    fetchData()
  }, [profile])

  const horasPercentual = profile
    ? Math.min((profile.horas_utilizadas / profile.horas_contratadas) * 100, 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>
          Olá, {profile?.nome_completo?.split(' ')[0] || 'Mentorado'}!
        </h1>
        <p className="mt-1" style={{ color: '#64748b' }}>
          Acompanhe seu progresso e gerencie suas tarefas
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Checkpoints Pendentes */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#64748b' }}>Pendentes</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1e293b' }}>{metrics.pendentes}</p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <Clock style={{ color: '#f59e0b' }} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkpoints Concluídos */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#64748b' }}>Concluídos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1e293b' }}>{metrics.concluidos}</p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
              >
                <CheckCircle2 style={{ color: '#22c55e' }} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkpoints Vencidos */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#64748b' }}>Vencidos</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#1e293b' }}>{metrics.vencidos}</p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertTriangle style={{ color: '#ef4444' }} size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horas */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm" style={{ color: '#64748b' }}>Horas Utilizadas</p>
                <p className="text-xl font-bold mt-1" style={{ color: '#1e293b' }}>
                  {profile?.horas_utilizadas || 0}h / {profile?.horas_contratadas || 0}h
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
              >
                <TrendingUp style={{ color: '#6366f1' }} size={24} />
              </div>
            </div>
            <div className="w-full rounded-full h-2 mt-3" style={{ backgroundColor: '#f1f5f9' }}>
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${horasPercentual}%`, backgroundColor: '#6366f1' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próxima Reunião */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1e293b' }}>
                <Calendar size={20} style={{ color: '#1a1a4e' }} />
                Próxima Reunião
              </h2>
              <Link to="/agenda">
                <Button variant="ghost" size="sm">
                  Ver agenda <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            {proximaReuniao ? (
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'rgba(26, 26, 78, 0.05)', border: '1px solid rgba(26, 26, 78, 0.1)' }}
              >
                <h3 className="font-semibold" style={{ color: '#1e293b' }}>{proximaReuniao.titulo}</h3>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                  {format(new Date(proximaReuniao.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
                <Badge variant="info" className="mt-3">
                  {proximaReuniao.duracao_minutos} minutos
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto mb-3" style={{ color: 'rgba(100, 116, 139, 0.3)' }} />
                <p style={{ color: '#64748b' }}>Nenhuma reunião agendada</p>
                <Link to="/agenda">
                  <Button variant="primary" size="sm" className="mt-4">
                    Agendar reunião
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Roadmaps Pendentes */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#1e293b' }}>
                <Route size={20} style={{ color: '#1a1a4e' }} />
                Checkpoints Pendentes
              </h2>
              <Link to="/roadmap">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            {ultimosRoadmaps.length > 0 ? (
              <div className="space-y-3">
                {ultimosRoadmaps.map((roadmap) => (
                  <div
                    key={roadmap.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: '#f8fafc' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: '#1e293b' }}>{roadmap.titulo}</p>
                      {roadmap.data_prazo && (
                        <p className="text-sm" style={{ color: '#64748b' }}>
                          Prazo: {format(new Date(roadmap.data_prazo), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        roadmap.status === 'vencido'
                          ? 'danger'
                          : roadmap.status === 'concluido'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {roadmap.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Route size={48} className="mx-auto mb-3" style={{ color: 'rgba(100, 116, 139, 0.3)' }} />
                <p style={{ color: '#64748b' }}>Nenhum checkpoint pendente</p>
                <Link to="/roadmap">
                  <Button variant="primary" size="sm" className="mt-4">
                    Criar checkpoint
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pacote Info */}
      <Card
        className="text-white"
        style={{
          background: 'linear-gradient(135deg, #1a1a4e 0%, #2d2d7a 100%)',
          border: 'none'
        }}
      >
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                Pacote {profile?.pacote?.charAt(0).toUpperCase()}{profile?.pacote?.slice(1)}
              </span>
              <h3 className="text-xl font-bold text-white">
                {profile?.horas_contratadas}h de mentoria contratadas
              </h3>
              <p className="mt-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Você ainda tem {(profile?.horas_contratadas || 0) - (profile?.horas_utilizadas || 0)}h disponíveis
              </p>
            </div>
            <Link to="/agenda">
              <button
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid white',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.color = '#1a1a4e'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'white'
                }}
              >
                Agendar reunião
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
