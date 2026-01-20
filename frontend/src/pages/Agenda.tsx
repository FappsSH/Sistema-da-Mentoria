import { useEffect, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, startOfDay, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Reuniao } from '../types'
import { Plus, Video, X } from 'lucide-react'

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
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

  // Generate week days starting from Monday
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }

  const weekDays = getWeekDays()

  // Get events for selected date
  const eventsForSelectedDate = reunioes.filter(r =>
    isSameDay(new Date(r.data_hora), selectedDate)
  )

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 className="header-title">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(new Date())}>
              Hoje
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
              Anterior
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
              Próximo
            </button>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({
              titulo: '',
              data: format(selectedDate, 'yyyy-MM-dd'),
              hora: '10:00',
              notas: '',
            })
            setModalOpen(true)
          }}
        >
          <Plus size={18} />
          Nova Reunião
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left - Week Calendar */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="card">
            <div className="card-header" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: '#1e293b', textTransform: 'uppercase', fontSize: '13px' }}>
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR }).toUpperCase()}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentMonth(addDays(currentMonth, -7))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addDays(currentMonth, 7))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body" style={{ padding: '8px' }}>
              {weekDays.map((day) => {
                const hasEvents = reunioes.some(r => isSameDay(new Date(r.data_hora), day))
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`calendar-day ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      marginBottom: '4px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#ccfbf1' : 'transparent',
                      border: isSelected ? '2px solid #14b8a6' : '2px solid transparent'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>
                        {format(day, 'EEE', { locale: ptBR })}
                      </p>
                      <p style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: isToday ? '#14b8a6' : '#1e293b'
                      }}>
                        {format(day, 'd')}
                      </p>
                    </div>
                    {hasEvents && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#14b8a6' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#14b8a6' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right - Day Events */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
            {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {eventsForSelectedDate.length > 0 ? (
              eventsForSelectedDate.map((reuniao) => (
                <div key={reuniao.id} className="event-card">
                  <div className="event-card-icon">
                    <Video size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="event-card-time">
                      {format(new Date(reuniao.data_hora), 'HH:mm')} - {format(new Date(new Date(reuniao.data_hora).getTime() + reuniao.duracao_minutos * 60000), 'HH:mm')} • CALLS
                    </p>
                    <p className="event-card-title">{reuniao.titulo}</p>
                  </div>
                  {reuniao.status === 'agendada' && (
                    <span className="badge badge-primary">Prioritário</span>
                  )}
                </div>
              ))
            ) : (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                  <Video size={48} color="#64748b" style={{ marginBottom: '16px', opacity: 0.3 }} />
                  <p style={{ color: '#64748b' }}>Nenhuma reunião neste dia</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '16px' }}
                    onClick={() => {
                      setFormData({
                        titulo: '',
                        data: format(selectedDate, 'yyyy-MM-dd'),
                        hora: '10:00',
                        notas: '',
                      })
                      setModalOpen(true)
                    }}
                  >
                    <Plus size={18} />
                    Agendar reunião
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              <h2 className="card-title">Agendar Nova Reunião</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Título da reunião</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Revisão do projeto"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Horário</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notas (opcional)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Adicione notas sobre a reunião..."
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1 }}>
                    {submitting ? 'Salvando...' : 'Agendar'}
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
