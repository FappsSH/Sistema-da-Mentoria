import { useEffect, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card, CardContent, Button, Input, Modal } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Reuniao } from '../types'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
})

interface CalendarEvent extends Event {
  id: string
  resource?: Reuniao
}

export function Agenda() {
  const { profile } = useAuth()
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    data: '',
    hora: '',
    notas: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchReunioes = useCallback(async () => {
    if (!profile) return

    const { data, error } = await supabase
      .from('reunioes')
      .select('*')
      .eq('user_id', profile.id)
      .order('data_hora', { ascending: true })

    if (!error && data) {
      setReunioes(data)
      setEvents(
        data.map((reuniao) => ({
          id: reuniao.id,
          title: reuniao.titulo,
          start: new Date(reuniao.data_hora),
          end: new Date(new Date(reuniao.data_hora).getTime() + reuniao.duracao_minutos * 60000),
          resource: reuniao,
        }))
      )
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    fetchReunioes()
  }, [fetchReunioes])

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start)
    setFormData({
      titulo: '',
      data: format(start, 'yyyy-MM-dd'),
      hora: '10:00',
      notas: '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSubmitting(true)

    const dataHora = new Date(`${formData.data}T${formData.hora}`)

    const { error } = await supabase.from('reunioes').insert({
      user_id: profile.id,
      titulo: formData.titulo,
      data_hora: dataHora.toISOString(),
      duracao_minutos: 60,
      status: 'agendada',
      notas: formData.notas || null,
    })

    if (!error) {
      await fetchReunioes()
      setModalOpen(false)
      setFormData({ titulo: '', data: '', hora: '', notas: '' })
    }

    setSubmitting(false)
  }

  const messages = {
    today: 'Hoje',
    previous: 'Anterior',
    next: 'Próximo',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há reuniões neste período.',
    showMore: (total: number) => `+${total} mais`,
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
            <CalendarIcon className="text-primary" />
            Agenda
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie suas reuniões de mentoria
          </p>
        </div>
        <Button onClick={() => {
          setFormData({
            titulo: '',
            data: format(new Date(), 'yyyy-MM-dd'),
            hora: '10:00',
            notas: '',
          })
          setModalOpen(true)
        }}>
          <Plus size={18} className="mr-2" />
          Nova Reunião
        </Button>
      </div>

      {/* Calendar */}
      <Card padding="none">
        <CardContent className="p-4">
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              messages={messages}
              culture="pt-BR"
              views={['month', 'week', 'day']}
              defaultView="month"
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.resource?.status === 'cancelada' ? '#ef4444' : '#1a1a4e',
                  borderRadius: '4px',
                },
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upcoming meetings list */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Próximas Reuniões</h2>
          {reunioes.filter(r => r.status === 'agendada' && new Date(r.data_hora) >= new Date()).length > 0 ? (
            <div className="space-y-3">
              {reunioes
                .filter(r => r.status === 'agendada' && new Date(r.data_hora) >= new Date())
                .slice(0, 5)
                .map((reuniao) => (
                  <div
                    key={reuniao.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-text-primary">{reuniao.titulo}</h3>
                      <p className="text-sm text-text-secondary">
                        {format(new Date(reuniao.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {reuniao.duracao_minutos} min
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-4">Nenhuma reunião agendada</p>
          )}
        </CardContent>
      </Card>

      {/* Modal Nova Reunião */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Agendar Nova Reunião">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da reunião"
            placeholder="Ex: Revisão do projeto"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
            <Input
              label="Horário"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Adicione notas sobre a reunião..."
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" isLoading={submitting} fullWidth>
              Agendar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
