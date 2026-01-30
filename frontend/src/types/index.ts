export type PacoteType = 'basico' | 'intermediario' | 'avancado'

export type StatusProjeto = 'ativo' | 'concluido' | 'pausado'

export type StatusRoadmap = 'pendente' | 'concluido' | 'vencido'

export type StatusReuniao = 'agendada' | 'realizada' | 'cancelada'

export type TipoNotificacao = 'roadmap_vencido' | 'reuniao_hoje' | 'lembrete'

export interface Profile {
  id: string
  nome_completo: string
  email: string
  telefone: string | null
  foto_url: string | null
  pacote: PacoteType
  horas_contratadas: number
  horas_utilizadas: number
  created_at: string
  updated_at: string
}

export interface Projeto {
  id: string
  user_id: string
  nome: string
  descricao: string | null
  status: StatusProjeto
  created_at: string
  updated_at: string
}

export interface Roadmap {
  id: string
  projeto_id: string
  titulo: string
  descricao: string | null
  status: StatusRoadmap
  data_prazo: string | null
  data_conclusao: string | null
  ordem: number
  created_at: string
  updated_at: string
}

export interface Reuniao {
  id: string
  user_id: string
  titulo: string
  data_hora: string
  duracao_minutos: number
  status: StatusReuniao
  notas: string | null
  created_at: string
}

export interface Notificacao {
  id: string
  user_id: string
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  lida: boolean
  referencia_id: string | null
  referencia_tipo: string | null
  created_at: string
}

export interface DashboardMetrics {
  checkpointsPendentes: number
  checkpointsConcluidos: number
  checkpointsVencidos: number
  horasUtilizadas: number
  horasContratadas: number
  proximaReuniao: Reuniao | null
}
