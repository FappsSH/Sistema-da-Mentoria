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
        <h1 className="text-2xl font-bold text-text-primary">
          Olá, {profile?.nome_completo?.split(' ')[0] || 'Mentorado'}!
        </h1>
        <p className="text-text-secondary mt-1">
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
                <p className="text-sm text-text-secondary">Pendentes</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{metrics.pendentes}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="text-warning" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkpoints Concluídos */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Concluídos</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{metrics.concluidos}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-success" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkpoints Vencidos */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Vencidos</p>
                <p className="text-3xl font-bold text-text-primary mt-1">{metrics.vencidos}</p>
              </div>
              <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-danger" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horas */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-text-secondary">Horas Utilizadas</p>
                <p className="text-xl font-bold text-text-primary mt-1">
                  {profile?.horas_utilizadas || 0}h / {profile?.horas_contratadas || 0}h
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-secondary" size={24} />
              </div>
            </div>
            <div className="w-full bg-background rounded-full h-2 mt-3">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${horasPercentual}%` }}
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
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Próxima Reunião
              </h2>
              <Link to="/agenda">
                <Button variant="ghost" size="sm">
                  Ver agenda <ArrowRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>

            {proximaReuniao ? (
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <h3 className="font-semibold text-text-primary">{proximaReuniao.titulo}</h3>
                <p className="text-text-secondary text-sm mt-1">
                  {format(new Date(proximaReuniao.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
                <Badge variant="info" className="mt-3">
                  {proximaReuniao.duracao_minutos} minutos
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-text-secondary/30 mb-3" />
                <p className="text-text-secondary">Nenhuma reunião agendada</p>
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
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Route size={20} className="text-primary" />
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
                    className="flex items-center justify-between p-3 bg-background rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{roadmap.titulo}</p>
                      {roadmap.data_prazo && (
                        <p className="text-sm text-text-secondary">
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
                <Route size={48} className="mx-auto text-text-secondary/30 mb-3" />
                <p className="text-text-secondary">Nenhum checkpoint pendente</p>
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
      <Card className="bg-gradient-to-r from-primary to-primary-light text-white">
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white mb-2">
                Pacote {profile?.pacote?.charAt(0).toUpperCase()}{profile?.pacote?.slice(1)}
              </Badge>
              <h3 className="text-xl font-bold">
                {profile?.horas_contratadas}h de mentoria contratadas
              </h3>
              <p className="opacity-90 mt-1">
                Você ainda tem {(profile?.horas_contratadas || 0) - (profile?.horas_utilizadas || 0)}h disponíveis
              </p>
            </div>
            <Link to="/agenda">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Agendar reunião
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
