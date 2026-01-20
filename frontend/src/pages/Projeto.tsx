import { useEffect, useState, useCallback } from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Projeto, StatusProjeto } from '../types'
import {
  FolderKanban,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  PauseCircle,
  PlayCircle,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ProjetoComMetricas extends Projeto {
  metricas: {
    pendentes: number
    concluidos: number
    vencidos: number
    total: number
  }
}

export function ProjetoPage() {
  const { profile } = useAuth()
  const [projetos, setProjetos] = useState<ProjetoComMetricas[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProjetos = useCallback(async () => {
    if (!profile) return

    const { data: projetosData, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (!error && projetosData) {
      const projetosComMetricas = await Promise.all(
        projetosData.map(async (projeto) => {
          const { data: roadmaps } = await supabase
            .from('roadmaps')
            .select('status')
            .eq('projeto_id', projeto.id)

          const metricas = {
            pendentes: roadmaps?.filter(r => r.status === 'pendente').length || 0,
            concluidos: roadmaps?.filter(r => r.status === 'concluido').length || 0,
            vencidos: roadmaps?.filter(r => r.status === 'vencido').length || 0,
            total: roadmaps?.length || 0,
          }

          return { ...projeto, metricas }
        })
      )

      setProjetos(projetosComMetricas)
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchProjetos()
  }, [fetchProjetos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSubmitting(true)

    if (editingProjeto) {
      const { error } = await supabase
        .from('projetos')
        .update({
          nome: formData.nome,
          descricao: formData.descricao || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProjeto.id)

      if (!error) {
        await fetchProjetos()
        closeModal()
      }
    } else {
      const { error } = await supabase.from('projetos').insert({
        user_id: profile.id,
        nome: formData.nome,
        descricao: formData.descricao || null,
        status: 'ativo',
      })

      if (!error) {
        await fetchProjetos()
        closeModal()
      }
    }

    setSubmitting(false)
  }

  const handleStatusChange = async (projetoId: string, newStatus: StatusProjeto) => {
    const { error } = await supabase
      .from('projetos')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', projetoId)

    if (!error) {
      await fetchProjetos()
    }
    setMenuOpen(null)
  }

  const handleDelete = async (projetoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto? Todos os checkpoints serão excluídos.')) {
      return
    }

    await supabase.from('roadmaps').delete().eq('projeto_id', projetoId)
    const { error } = await supabase.from('projetos').delete().eq('id', projetoId)

    if (!error) {
      await fetchProjetos()
    }
    setMenuOpen(null)
  }

  const openEditModal = (projeto: Projeto) => {
    setEditingProjeto(projeto)
    setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao || '',
    })
    setModalOpen(true)
    setMenuOpen(null)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProjeto(null)
    setFormData({ nome: '', descricao: '' })
  }

  const getStatusBadge = (status: StatusProjeto) => {
    switch (status) {
      case 'ativo':
        return <span className="badge badge-success">Ativo</span>
      case 'concluido':
        return <span className="badge badge-primary">Concluído</span>
      case 'pausado':
        return <span className="badge badge-warning">Pausado</span>
    }
  }

  const metricasGerais = projetos.reduce(
    (acc, p) => ({
      pendentes: acc.pendentes + p.metricas.pendentes,
      concluidos: acc.concluidos + p.metricas.concluidos,
      vencidos: acc.vencidos + p.metricas.vencidos,
    }),
    { pendentes: 0, concluidos: 0, vencidos: 0 }
  )

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center" style={{ height: '400px' }}>
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: '#3cdbc0', borderTopColor: 'transparent' }}
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderKanban size={28} color="#3cdbc0" />
            Projetos
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Gerencie seus projetos de mentoria
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      {/* Métricas Gerais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-card-icon warning">
            <Clock size={24} />
          </div>
          <p className="metric-card-label">Em Aberto</p>
          <p className="metric-card-value">{metricasGerais.pendentes}</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon success">
            <CheckCircle2 size={24} />
          </div>
          <p className="metric-card-label">Concluídos</p>
          <p className="metric-card-value">{metricasGerais.concluidos}</p>
        </div>

        <div className="metric-card">
          <div className="metric-card-icon danger">
            <AlertTriangle size={24} />
          </div>
          <p className="metric-card-label">Atrasados</p>
          <p className="metric-card-value">{metricasGerais.vencidos}</p>
        </div>
      </div>

      {/* Lista de Projetos */}
      {projetos.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {projetos.map((projeto) => {
            const progressPercent = projeto.metricas.total > 0
              ? (projeto.metricas.concluidos / projeto.metricas.total) * 100
              : 0

            return (
              <div key={projeto.id} className="card" style={{ position: 'relative' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                        {projeto.nome}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {projeto.descricao || 'Sem descrição'}
                      </p>
                    </div>
                    <div style={{ position: 'relative', marginLeft: '12px' }}>
                      <button
                        onClick={() => setMenuOpen(menuOpen === projeto.id ? null : projeto.id)}
                        style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {menuOpen === projeto.id && (
                        <div style={{
                          position: 'absolute',
                          right: 0,
                          marginTop: '4px',
                          width: '180px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          border: '1px solid #e2e8f0',
                          zIndex: 10
                        }}>
                          <button
                            onClick={() => openEditModal(projeto)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px', color: '#1e293b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                          >
                            <Pencil size={16} />
                            Editar
                          </button>
                          {projeto.status !== 'ativo' && (
                            <button
                              onClick={() => handleStatusChange(projeto.id, 'ativo')}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px', color: '#22c55e', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                            >
                              <PlayCircle size={16} />
                              Ativar
                            </button>
                          )}
                          {projeto.status === 'ativo' && (
                            <button
                              onClick={() => handleStatusChange(projeto.id, 'pausado')}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px', color: '#f59e0b', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                            >
                              <PauseCircle size={16} />
                              Pausar
                            </button>
                          )}
                          {projeto.status !== 'concluido' && (
                            <button
                              onClick={() => handleStatusChange(projeto.id, 'concluido')}
                              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px', color: '#3cdbc0', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                            >
                              <CheckCircle2 size={16} />
                              Concluir
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(projeto.id)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '14px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    {getStatusBadge(projeto.status)}
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      Criado em {format(new Date(projeto.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                      <span>Progresso</span>
                      <span>{projeto.metricas.concluidos}/{projeto.metricas.total} checkpoints</span>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  {/* Mini métricas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Clock size={14} color="#f59e0b" />
                      <span style={{ color: '#64748b' }}>{projeto.metricas.pendentes}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <CheckCircle2 size={14} color="#22c55e" />
                      <span style={{ color: '#64748b' }}>{projeto.metricas.concluidos}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <AlertTriangle size={14} color="#ef4444" />
                      <span style={{ color: '#64748b' }}>{projeto.metricas.vencidos}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <FolderKanban size={48} color="#64748b" style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              Nenhum projeto ainda
            </h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>
              Crie seu primeiro projeto para começar a organizar seus checkpoints
            </p>
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              <Plus size={18} />
              Criar Projeto
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '16px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">{editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nome do projeto</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: App de delivery"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição (opcional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Descreva brevemente o projeto..."
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal} style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? 'Salvando...' : (editingProjeto ? 'Salvar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
