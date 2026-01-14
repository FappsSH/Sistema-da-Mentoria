import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, Button, Input, Modal, Badge } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Roadmap, Projeto, StatusRoadmap } from '../types'
import {
  Route,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  Filter,
  Calendar,
  Target,
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
  const [filter, setFilter] = useState<StatusRoadmap | 'todos'>('todos')
  const [selectedProjeto, setSelectedProjeto] = useState<string>('todos')
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    projeto_id: '',
    data_prazo: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!profile) return

    // Buscar projetos do usuário
    const { data: projetosData } = await supabase
      .from('projetos')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    if (projetosData) {
      setProjetos(projetosData)
    }

    // Buscar roadmaps
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

  // Verificar e atualizar roadmaps vencidos
  useEffect(() => {
    const checkVencidos = async () => {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const vencidos = roadmaps.filter(
        r => r.status === 'pendente' && r.data_prazo && new Date(r.data_prazo) < hoje
      )

      for (const roadmap of vencidos) {
        await supabase
          .from('roadmaps')
          .update({ status: 'vencido', updated_at: new Date().toISOString() })
          .eq('id', roadmap.id)

        // Criar notificação
        await supabase.from('notificacoes').insert({
          user_id: profile?.id,
          tipo: 'roadmap_vencido',
          titulo: 'Checkpoint vencido',
          mensagem: `O checkpoint "${roadmap.titulo}" passou do prazo.`,
          referencia_id: roadmap.id,
          referencia_tipo: 'roadmap',
        })
      }

      if (vencidos.length > 0) {
        fetchData()
      }
    }

    checkVencidos()
  }, [roadmaps, profile, fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSubmitting(true)

    if (editingRoadmap) {
      const { error } = await supabase
        .from('roadmaps')
        .update({
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          projeto_id: formData.projeto_id,
          data_prazo: formData.data_prazo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingRoadmap.id)

      if (!error) {
        await fetchData()
        closeModal()
      }
    } else {
      const maxOrdem = roadmaps
        .filter(r => r.projeto_id === formData.projeto_id)
        .reduce((max, r) => Math.max(max, r.ordem), 0)

      const { error } = await supabase.from('roadmaps').insert({
        projeto_id: formData.projeto_id,
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        status: 'pendente',
        data_prazo: formData.data_prazo || null,
        ordem: maxOrdem + 1,
      })

      if (!error) {
        await fetchData()
        closeModal()
      }
    }

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

    const { error } = await supabase
      .from('roadmaps')
      .update(updateData)
      .eq('id', roadmapId)

    if (!error) {
      await fetchData()
    }
  }

  const handleDelete = async (roadmapId: string) => {
    if (!confirm('Tem certeza que deseja excluir este checkpoint?')) return

    const { error } = await supabase.from('roadmaps').delete().eq('id', roadmapId)

    if (!error) {
      await fetchData()
    }
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

  const getStatusBadge = (status: StatusRoadmap) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="warning">Pendente</Badge>
      case 'concluido':
        return <Badge variant="success">Concluído</Badge>
      case 'vencido':
        return <Badge variant="danger">Vencido</Badge>
    }
  }

  const getDaysInfo = (dataPrazo: string | null, status: StatusRoadmap) => {
    if (!dataPrazo || status === 'concluido') return null

    const dias = differenceInDays(new Date(dataPrazo), new Date())

    if (dias < 0) {
      return <span className="text-danger text-sm">{Math.abs(dias)} dias atrasado</span>
    } else if (dias === 0) {
      return <span className="text-warning text-sm">Vence hoje</span>
    } else if (dias <= 3) {
      return <span className="text-warning text-sm">{dias} dias restantes</span>
    } else {
      return <span className="text-text-secondary text-sm">{dias} dias restantes</span>
    }
  }

  // Filtrar roadmaps
  const filteredRoadmaps = roadmaps.filter(r => {
    if (filter !== 'todos' && r.status !== filter) return false
    if (selectedProjeto !== 'todos' && r.projeto_id !== selectedProjeto) return false
    return true
  })

  // Métricas
  const metricas = {
    pendentes: roadmaps.filter(r => r.status === 'pendente').length,
    concluidos: roadmaps.filter(r => r.status === 'concluido').length,
    vencidos: roadmaps.filter(r => r.status === 'vencido').length,
    total: roadmaps.length,
  }

  // Estimativa de conclusão
  const calcularEstimativa = () => {
    if (metricas.total === 0) return null

    const percentualConcluido = (metricas.concluidos / metricas.total) * 100

    if (percentualConcluido === 100) return 'Projeto concluído!'

    const roadmapsComPrazo = roadmaps.filter(r => r.data_prazo && r.status !== 'concluido')
    if (roadmapsComPrazo.length === 0) return 'Sem prazo definido'

    const ultimoPrazo = roadmapsComPrazo.reduce((max, r) => {
      const data = new Date(r.data_prazo!)
      return data > max ? data : max
    }, new Date(0))

    return format(ultimoPrazo, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Route className="text-primary" />
            Roadmap
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie os checkpoints do seu projeto
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({ titulo: '', descricao: '', projeto_id: projetos[0]?.id || '', data_prazo: '' })
            setModalOpen(true)
          }}
          disabled={projetos.length === 0}
        >
          <Plus size={18} className="mr-2" />
          Novo Checkpoint
        </Button>
      </div>

      {/* Progresso Geral */}
      <Card className="bg-gradient-to-r from-primary to-primary-light text-white">
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Progresso Geral</h3>
              <p className="text-white/80 text-sm">
                {metricas.concluidos} de {metricas.total} checkpoints concluídos
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {metricas.total > 0 ? Math.round((metricas.concluidos / metricas.total) * 100) : 0}%
              </div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{
                width: metricas.total > 0 ? `${(metricas.concluidos / metricas.total) * 100}%` : '0%',
              }}
            />
          </div>
          {calcularEstimativa() && (
            <div className="mt-4 flex items-center gap-2 text-white/90">
              <Target size={16} />
              <span className="text-sm">Estimativa de conclusão: {calcularEstimativa()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          hover
          className={`cursor-pointer ${filter === 'pendente' ? 'ring-2 ring-warning' : ''}`}
          onClick={() => setFilter(filter === 'pendente' ? 'todos' : 'pendente')}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="text-warning" size={24} />
              <div>
                <p className="text-2xl font-bold text-text-primary">{metricas.pendentes}</p>
                <p className="text-sm text-text-secondary">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          hover
          className={`cursor-pointer ${filter === 'concluido' ? 'ring-2 ring-success' : ''}`}
          onClick={() => setFilter(filter === 'concluido' ? 'todos' : 'concluido')}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-success" size={24} />
              <div>
                <p className="text-2xl font-bold text-text-primary">{metricas.concluidos}</p>
                <p className="text-sm text-text-secondary">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          hover
          className={`cursor-pointer ${filter === 'vencido' ? 'ring-2 ring-danger' : ''}`}
          onClick={() => setFilter(filter === 'vencido' ? 'todos' : 'vencido')}
        >
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-danger" size={24} />
              <div>
                <p className="text-2xl font-bold text-text-primary">{metricas.vencidos}</p>
                <p className="text-sm text-text-secondary">Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      {projetos.length > 1 && (
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-text-secondary" />
          <select
            value={selectedProjeto}
            onChange={(e) => setSelectedProjeto(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="todos">Todos os projetos</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de Roadmaps */}
      {projetos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Route size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">Crie um projeto primeiro</h3>
            <p className="text-text-secondary mt-1">
              Você precisa ter um projeto para adicionar checkpoints
            </p>
          </CardContent>
        </Card>
      ) : filteredRoadmaps.length > 0 ? (
        <div className="space-y-3">
          {filteredRoadmaps.map((roadmap) => (
            <Card key={roadmap.id}>
              <CardContent>
                <div className="flex items-center gap-4">
                  {/* Checkbox de conclusão */}
                  <button
                    onClick={() =>
                      handleStatusChange(
                        roadmap.id,
                        roadmap.status === 'concluido' ? 'pendente' : 'concluido'
                      )
                    }
                    className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                      ${roadmap.status === 'concluido'
                        ? 'bg-success border-success text-white'
                        : 'border-border hover:border-primary'
                      }
                    `}
                  >
                    {roadmap.status === 'concluido' && <CheckCircle2 size={14} />}
                  </button>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`font-medium ${
                          roadmap.status === 'concluido'
                            ? 'text-text-secondary line-through'
                            : 'text-text-primary'
                        }`}
                      >
                        {roadmap.titulo}
                      </h3>
                      {getStatusBadge(roadmap.status)}
                      {roadmap.projeto && (
                        <Badge variant="default" size="sm">
                          {roadmap.projeto.nome}
                        </Badge>
                      )}
                    </div>
                    {roadmap.descricao && (
                      <p className="text-sm text-text-secondary mt-1">{roadmap.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {roadmap.data_prazo && (
                        <span className="text-sm text-text-secondary flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(roadmap.data_prazo), 'dd/MM/yyyy')}
                        </span>
                      )}
                      {getDaysInfo(roadmap.data_prazo, roadmap.status)}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(roadmap)}
                      className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-background transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(roadmap.id)}
                      className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/5 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Route size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">
              {filter !== 'todos' ? 'Nenhum checkpoint com esse status' : 'Nenhum checkpoint ainda'}
            </h3>
            <p className="text-text-secondary mt-1">
              {filter !== 'todos'
                ? 'Tente mudar o filtro'
                : 'Crie seu primeiro checkpoint para começar'}
            </p>
            {filter === 'todos' && (
              <Button onClick={() => setModalOpen(true)} className="mt-4">
                <Plus size={18} className="mr-2" />
                Criar Checkpoint
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Novo/Editar Roadmap */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingRoadmap ? 'Editar Checkpoint' : 'Novo Checkpoint'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            placeholder="Ex: Implementar autenticação"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Projeto
            </label>
            <select
              value={formData.projeto_id}
              onChange={(e) => setFormData({ ...formData, projeto_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Selecione um projeto</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <Input
            label="Prazo (opcional)"
            type="date"
            value={formData.data_prazo}
            onChange={(e) => setFormData({ ...formData, data_prazo: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Descreva o que precisa ser feito..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting} fullWidth>
              {editingRoadmap ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
