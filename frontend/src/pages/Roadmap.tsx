import { useEffect, useState, useCallback } from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Roadmap, Projeto, StatusRoadmap } from '../types'
import {
  Plus,
  CheckCircle2,
  Pencil,
  Trash2,
  Download,
  Calendar,
  MessageSquare,
  X,
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RoadmapComProjeto extends Roadmap {
  projeto?: Projeto
}

export function RoadmapPage() {
  const { profile } = useAuth()
  const [roadmaps, setRoadmaps] = useState<RoadmapComProjeto[]>([])
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    projeto_id: '',
    data_prazo: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!profile) return

    const { data: projetosData } = await supabase
      .from('projetos')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (projetosData) {
      setProjetos(projetosData)
    }

    const { data: roadmapsData } = await supabase
      .from('roadmaps')
      .select('*, projetos(*)')
      .in('projeto_id', projetosData?.map(p => p.id) || [])
      .order('ordem', { ascending: true })

    if (roadmapsData) {
      const roadmapsFormatted = roadmapsData.map(r => ({
        ...r,
        projeto: r.projetos,
      }))
      setRoadmaps(roadmapsFormatted)
    }

    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSubmitting(true)

    if (editingRoadmap) {
      await supabase
        .from('roadmaps')
        .update({
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          projeto_id: formData.projeto_id,
          data_prazo: formData.data_prazo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingRoadmap.id)
    } else {
      const maxOrdem = roadmaps
        .filter(r => r.projeto_id === formData.projeto_id)
        .reduce((max, r) => Math.max(max, r.ordem), 0)

      await supabase.from('roadmaps').insert({
        projeto_id: formData.projeto_id,
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        status: 'pendente',
        data_prazo: formData.data_prazo || null,
        ordem: maxOrdem + 1,
      })
    }

    await fetchData()
    closeModal()
    setSubmitting(false)
  }

  const handleStatusChange = async (roadmapId: string, newStatus: StatusRoadmap) => {
    const updateData: Partial<Roadmap> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'concluido') {
      updateData.data_conclusao = new Date().toISOString()
    }

    await supabase
      .from('roadmaps')
      .update(updateData)
      .eq('id', roadmapId)

    await fetchData()
  }

  const handleDelete = async (roadmapId: string) => {
    if (!confirm('Tem certeza que deseja excluir este checkpoint?')) return
    await supabase.from('roadmaps').delete().eq('id', roadmapId)
    await fetchData()
  }

  const openEditModal = (roadmap: Roadmap) => {
    setEditingRoadmap(roadmap)
    setFormData({
      titulo: roadmap.titulo,
      descricao: roadmap.descricao || '',
      projeto_id: roadmap.projeto_id,
      data_prazo: roadmap.data_prazo ? format(new Date(roadmap.data_prazo), 'yyyy-MM-dd') : '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRoadmap(null)
    setFormData({ titulo: '', descricao: '', projeto_id: projetos[0]?.id || '', data_prazo: '' })
  }

  const metricas = {
    concluidos: roadmaps.filter(r => r.status === 'concluido').length,
    total: roadmaps.length,
  }

  const calcularEstimativa = () => {
    const roadmapsComPrazo = roadmaps.filter(r => r.data_prazo && r.status !== 'concluido')
    if (roadmapsComPrazo.length === 0) return null
    const ultimoPrazo = roadmapsComPrazo.reduce((max, r) => {
      const data = new Date(r.data_prazo!)
      return data > max ? data : max
    }, new Date(0))
    return format(ultimoPrazo, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getMarkerClass = (status: StatusRoadmap, index: number) => {
    if (status === 'concluido') return 'timeline-marker completed'
    if (status === 'pendente' && index === roadmaps.findIndex(r => r.status === 'pendente')) return 'timeline-marker active'
    return 'timeline-marker pending'
  }

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

  const progressPercent = metricas.total > 0 ? (metricas.concluidos / metricas.total) * 100 : 0

  return (
    <Layout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="header-title">Brand Aligned Journey Roadmap</h1>
          {calcularEstimativa() && (
            <p style={{ fontSize: '14px', color: '#3cdbc0', marginTop: '4px' }}>
              Estimativa de conclusão: {calcularEstimativa()}
            </p>
          )}
          {/* Progress bar */}
          <div style={{ marginTop: '16px', width: '400px' }}>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary">
            <Download size={18} />
            Export
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData({ titulo: '', descricao: '', projeto_id: projetos[0]?.id || '', data_prazo: '' })
              setModalOpen(true)
            }}
            disabled={projetos.length === 0}
          >
            <Plus size={18} />
            Novo Passo
          </button>
        </div>
      </div>

      {/* Timeline */}
      {projetos.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#64748b' }}>Crie um projeto primeiro para adicionar checkpoints</p>
          </div>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Nenhum checkpoint ainda</p>
            <button
              className="btn btn-primary"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={18} />
              Criar primeiro checkpoint
            </button>
          </div>
        </div>
      ) : (
        <div className="timeline">
          {roadmaps.map((roadmap, index) => (
            <div key={roadmap.id} className="timeline-item">
              {/* Line */}
              {index < roadmaps.length - 1 && <div className="timeline-line" />}

              {/* Marker */}
              <div className={getMarkerClass(roadmap.status, index)}>
                {roadmap.status === 'concluido' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={`timeline-content ${roadmap.status === 'pendente' && index === roadmaps.findIndex(r => r.status === 'pendente') ? 'active' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="timeline-phase">FASE {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="timeline-title">{roadmap.titulo}</h3>
                    {roadmap.descricao && (
                      <p className="timeline-description">{roadmap.descricao}</p>
                    )}
                    <div className="timeline-meta">
                      {roadmap.data_prazo && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          Prazo: {format(new Date(roadmap.data_prazo), 'dd/MM/yyyy')}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={14} />
                        0 comentários
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${
                      roadmap.status === 'concluido' ? 'badge-success' :
                      roadmap.status === 'vencido' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {roadmap.status === 'concluido' ? 'CONCLUÍDO' :
                       roadmap.status === 'vencido' ? 'VENCIDO' : 'EM ANDAMENTO'}
                    </span>
                    <button
                      onClick={() => openEditModal(roadmap)}
                      style={{ padding: '8px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(roadmap.id)}
                      style={{ padding: '8px', borderRadius: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick status toggle */}
                {roadmap.status !== 'concluido' && (
                  <button
                    onClick={() => handleStatusChange(roadmap.id, 'concluido')}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #3cdbc0',
                      background: 'transparent',
                      color: '#3cdbc0',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Marcar como concluído
                  </button>
                )}
              </div>
            </div>
          ))}
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
              <h2 className="card-title">{editingRoadmap ? 'Editar Checkpoint' : 'Novo Checkpoint'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Implementar autenticação"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Projeto</label>
                  <select
                    className="form-input"
                    value={formData.projeto_id}
                    onChange={(e) => setFormData({ ...formData, projeto_id: e.target.value })}
                    required
                  >
                    <option value="">Selecione um projeto</option>
                    {projetos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Prazo (opcional)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.data_prazo}
                    onChange={(e) => setFormData({ ...formData, data_prazo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição (opcional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Descreva o que precisa ser feito..."
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
                    {submitting ? 'Salvando...' : (editingRoadmap ? 'Salvar' : 'Criar')}
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
