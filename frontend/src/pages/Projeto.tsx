import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, Button, Input, Modal, Badge } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Projeto, Roadmap, StatusProjeto } from '../types'
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
      // Buscar roadmaps para cada projeto
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

    // Excluir roadmaps primeiro
    await supabase.from('roadmaps').delete().eq('projeto_id', projetoId)

    // Excluir projeto
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
        return <Badge variant="success">Ativo</Badge>
      case 'concluido':
        return <Badge variant="info">Concluído</Badge>
      case 'pausado':
        return <Badge variant="warning">Pausado</Badge>
    }
  }

  // Métricas gerais
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
            <FolderKanban className="text-primary" />
            Projetos
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie seus projetos de mentoria
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="text-warning" size={24} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Em Aberto</p>
                <p className="text-2xl font-bold text-text-primary">{metricasGerais.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="text-success" size={24} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Concluídos</p>
                <p className="text-2xl font-bold text-text-primary">{metricasGerais.concluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="text-danger" size={24} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Atrasados</p>
                <p className="text-2xl font-bold text-text-primary">{metricasGerais.vencidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Projetos */}
      {projetos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.map((projeto) => (
            <Card key={projeto.id} hover>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{projeto.nome}</h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {projeto.descricao || 'Sem descrição'}
                    </p>
                  </div>
                  <div className="relative ml-2">
                    <button
                      onClick={() => setMenuOpen(menuOpen === projeto.id ? null : projeto.id)}
                      className="p-1 rounded hover:bg-background transition-colors"
                    >
                      <MoreVertical size={18} className="text-text-secondary" />
                    </button>
                    {menuOpen === projeto.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-surface rounded-lg shadow-lg border border-border z-10">
                        <button
                          onClick={() => openEditModal(projeto)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
                        >
                          <Pencil size={16} />
                          Editar
                        </button>
                        {projeto.status !== 'ativo' && (
                          <button
                            onClick={() => handleStatusChange(projeto.id, 'ativo')}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-success hover:bg-background transition-colors"
                          >
                            <PlayCircle size={16} />
                            Ativar
                          </button>
                        )}
                        {projeto.status === 'ativo' && (
                          <button
                            onClick={() => handleStatusChange(projeto.id, 'pausado')}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-warning hover:bg-background transition-colors"
                          >
                            <PauseCircle size={16} />
                            Pausar
                          </button>
                        )}
                        {projeto.status !== 'concluido' && (
                          <button
                            onClick={() => handleStatusChange(projeto.id, 'concluido')}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:bg-background transition-colors"
                          >
                            <CheckCircle2 size={16} />
                            Concluir
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(projeto.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-background transition-colors"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {getStatusBadge(projeto.status)}
                  <span className="text-xs text-text-secondary">
                    Criado em {format(new Date(projeto.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Progresso</span>
                    <span>
                      {projeto.metricas.concluidos}/{projeto.metricas.total} checkpoints
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all duration-500"
                      style={{
                        width: projeto.metricas.total > 0
                          ? `${(projeto.metricas.concluidos / projeto.metricas.total) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>

                {/* Mini métricas */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={14} className="text-warning" />
                    <span className="text-text-secondary">{projeto.metricas.pendentes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <CheckCircle2 size={14} className="text-success" />
                    <span className="text-text-secondary">{projeto.metricas.concluidos}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <AlertTriangle size={14} className="text-danger" />
                    <span className="text-text-secondary">{projeto.metricas.vencidos}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FolderKanban size={48} className="mx-auto text-text-secondary/30 mb-4" />
            <h3 className="text-lg font-semibold text-text-primary">Nenhum projeto ainda</h3>
            <p className="text-text-secondary mt-1 mb-4">
              Crie seu primeiro projeto para começar a organizar seus checkpoints
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Criar Projeto
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal Novo/Editar Projeto */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do projeto"
            placeholder="Ex: App de delivery"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Descreva brevemente o projeto..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting} fullWidth>
              {editingProjeto ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
