import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Roadmap, Reuniao } from '../types'
import {
  Users,
  CheckCircle2,
  BarChart3,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function Home() {
  const { profile } = useAuth()
  const [metrics, setMetrics] = useState({
    pendentes: 0,
    concluidos: 0,
  })
  const [proximaReuniao, setProximaReuniao] = useState<Reuniao | null>(null)
  const [ultimosRoadmaps, setUltimosRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!profile) return

      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('*, projetos!inner(user_id)')
        .eq('projetos.user_id', profile.id)

      if (roadmaps) {
        setMetrics({
          pendentes: roadmaps.filter(r => r.status === 'pendente').length,
          concluidos: roadmaps.filter(r => r.status === 'concluido').length,
        })
        setUltimosRoadmaps(
          roadmaps
            .slice(0, 5)
        )
      }

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: '#14b8a6', borderTopColor: 'transparent' }}
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Main Content - Left */}
        <div style={{ flex: 1 }}>
          {/* Greeting */}
          <div style={{ marginBottom: '24px' }}>
            <p className="breadcrumb">PÁGINAS &gt; DASHBOARD</p>
            <h1 className="header-title">Olá, {profile?.nome_completo?.split(' ')[0] || 'Mentorado'}!</h1>
          </div>

          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {/* Pendentes */}
            <div className="metric-card">
              <div className="metric-card-icon warning">
                <Users size={24} />
              </div>
              <p className="metric-card-label">Pendentes</p>
              <p className="metric-card-value">{metrics.pendentes}</p>
            </div>

            {/* Concluídos */}
            <div className="metric-card">
              <div className="metric-card-icon success">
                <CheckCircle2 size={24} />
              </div>
              <p className="metric-card-label">Concluídos</p>
              <p className="metric-card-value">{metrics.concluidos}</p>
            </div>

            {/* Horas Utilizadas */}
            <div className="metric-card">
              <div className="metric-card-icon info">
                <BarChart3 size={24} />
              </div>
              <p className="metric-card-label">Horas Utilizadas</p>
              <p className="metric-card-value">{profile?.horas_utilizadas || 0}h / {profile?.horas_contratadas || 0}h</p>
            </div>
          </div>

          {/* Seu Plano Atual */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">Seu Plano Atual</h2>
              <Link to="/configuracoes" className="table-link" style={{ fontSize: '14px' }}>
                Fazer Upgrade
              </Link>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                    Pacote {profile?.pacote?.charAt(0).toUpperCase()}{profile?.pacote?.slice(1)}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                    {profile?.horas_contratadas}h de mentoria contratadas. Você ainda tem o total de horas disponíveis para agendamento.
                  </p>
                  <div style={{ marginBottom: '8px' }}>
                    <div className="progress-bar" style={{ height: '8px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${((profile?.horas_utilizadas || 0) / (profile?.horas_contratadas || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>{profile?.horas_utilizadas || 0}H UTILIZADAS</span>
                    <span>{profile?.horas_contratadas || 0}H TOTAL</span>
                  </div>
                </div>
                <div style={{
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: '140px'
                }}>
                  <CheckCircle2 size={32} color="#22c55e" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Conta Ativa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">Atividades Recentes</h2>
              <button className="btn btn-ghost btn-sm">•••</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>TAREFA</th>
                    <th>DATA</th>
                    <th>STATUS</th>
                    <th>AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosRoadmaps.length > 0 ? (
                    ultimosRoadmaps.map((roadmap) => (
                      <tr key={roadmap.id}>
                        <td>{roadmap.titulo}</td>
                        <td>{roadmap.data_prazo ? format(new Date(roadmap.data_prazo), 'dd MMM yyyy', { locale: ptBR }) : '-'}</td>
                        <td>
                          <span className={`badge ${
                            roadmap.status === 'concluido' ? 'badge-success' :
                            roadmap.status === 'vencido' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {roadmap.status === 'concluido' ? 'Concluído' :
                             roadmap.status === 'vencido' ? 'Vencido' : 'Pendente'}
                          </span>
                        </td>
                        <td>
                          <Link to="/roadmap" className="table-link">
                            {roadmap.status === 'concluido' ? 'Ver detalhes' : 'Editar'}
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                        Nenhuma atividade registrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar - Right */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          {/* Próxima Reunião */}
          <div className="highlight-card" style={{ marginBottom: '24px' }}>
            <h3 className="highlight-card-title">
              <Calendar size={20} />
              Próxima Reunião
            </h3>

            {proximaReuniao ? (
              <>
                <div className="highlight-card-content">
                  <p className="highlight-card-event-title">{proximaReuniao.titulo}</p>
                  <p className="highlight-card-event-info">
                    <Calendar size={14} />
                    {format(new Date(proximaReuniao.data_hora), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="highlight-card-event-info">
                    às {format(new Date(proximaReuniao.data_hora), 'HH:mm')}
                  </p>
                  <p className="highlight-card-event-info">
                    <Clock size={14} />
                    {proximaReuniao.duracao_minutos} minutos
                  </p>
                </div>
              </>
            ) : (
              <div className="highlight-card-content" style={{ textAlign: 'center' }}>
                <Calendar size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                <p style={{ opacity: 0.9 }}>Nenhuma reunião agendada</p>
              </div>
            )}

            <Link to="/agenda">
              <button className="highlight-card-btn">Agendar reunião</button>
            </Link>
          </div>

          {/* Checkpoint Pendente */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Checkpoint Pendente</h3>
              <span className="badge-urgent">URGENTE</span>
            </div>
            <div className="card-body">
              {ultimosRoadmaps.filter(r => r.status === 'pendente').slice(0, 1).map((roadmap) => (
                <div key={roadmap.id}>
                  <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                    {roadmap.titulo}
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                    Prazo: {roadmap.data_prazo ? format(new Date(roadmap.data_prazo), 'dd/MM/yyyy') : 'Não definido'}
                  </p>
                  <span className="badge badge-warning">pendente</span>
                </div>
              ))}
              {ultimosRoadmaps.filter(r => r.status === 'pendente').length === 0 && (
                <p style={{ color: '#64748b', textAlign: 'center' }}>Nenhum checkpoint pendente</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ações Rápidas</h3>
            </div>
            <div className="card-body">
              <Link to="/agenda" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={20} color="#14b8a6" />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>Ver Agenda</span>
                  </div>
                  <ChevronRight size={16} color="#64748b" />
                </div>
              </Link>
              <Link to="/roadmap" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={20} color="#14b8a6" />
                    <span style={{ fontSize: '14px', color: '#1e293b' }}>Ver Roadmap</span>
                  </div>
                  <ChevronRight size={16} color="#64748b" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
