import { useState, useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { useAuth } from '../hooks/useAuth'
import { User, CreditCard, Shield, Pencil, Star } from 'lucide-react'

type TabType = 'profile' | 'subscription' | 'security'

export function Configuracoes() {
  const { profile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        nome_completo: profile.nome_completo || '',
        telefone: profile.telefone || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const { error } = await updateProfile({
      nome_completo: formData.nome_completo,
      telefone: formData.telefone || null,
    })

    if (!error) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }

    setLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile Info', icon: User },
    { id: 'subscription' as TabType, label: 'Subscription', icon: CreditCard },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
  ]

  return (
    <Layout>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="header-title">Profile Hub</h1>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Left Tabs */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'profile' && (
            <>
              {/* Personal Information */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h2 className="card-title">Personal Information</h2>
                  <p className="card-subtitle">Update your personal details and how others see you.</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          backgroundColor: '#fce7d6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          fontWeight: '600',
                          color: '#1e293b'
                        }}>
                          {profile?.nome_completo ? getInitials(profile.nome_completo) : 'U'}
                        </div>
                        <button
                          type="button"
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#3cdbc0',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>

                      {/* Form Fields */}
                      <div style={{ flex: 1 }}>
                        {success && (
                          <div style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22c55e',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px'
                          }}>
                            Informações atualizadas com sucesso!
                          </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div className="form-group">
                            <label className="form-label">FULL NAME</label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.nome_completo}
                              onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">EMAIL ADDRESS</label>
                            <input
                              type="email"
                              className="form-input"
                              value={profile?.email || ''}
                              disabled
                              style={{ backgroundColor: '#f8fafc' }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">PHONE NUMBER</label>
                            <input
                              type="tel"
                              className="form-input"
                              placeholder="(00) 00000-0000"
                              value={formData.telefone}
                              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">LOCATION</label>
                            <select className="form-input">
                              <option>São Paulo, Brazil</option>
                              <option>Rio de Janeiro, Brazil</option>
                              <option>Other</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                          <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Salvando...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Membership Package */}
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Mentorship Package</h2>
                  <p className="card-subtitle">Overview of your current membership benefits.</p>
                </div>
                <div className="card-body">
                  <div className="membership-card">
                    <div className="membership-card-badge">PREMIUM MEMBER</div>
                    <div className="membership-card-name">{profile?.nome_completo}</div>

                    <div className="membership-card-hours">{profile?.horas_contratadas || 0}h Mentorship</div>
                    <div className="membership-card-label">Exclusive Access Included</div>

                    <div className="progress-bar" style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginTop: '16px' }}>
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: profile?.horas_contratadas
                            ? `${Math.min((profile.horas_utilizadas / profile.horas_contratadas) * 100, 100)}%`
                            : '0%',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    </div>

                    <div className="membership-card-id">
                      <div className="membership-card-id-label">MEMBER CARD</div>
                      <div className="membership-card-id-value">
                        #{new Date().getFullYear()}-{profile?.nome_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || 'XX'}
                      </div>
                      <div style={{ marginTop: '12px', opacity: 0.5 }}>
                        <Star size={40} />
                      </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '24px', right: '24px', fontSize: '13px' }}>
                      {profile?.horas_utilizadas || 0}h / {profile?.horas_contratadas || 0}h Used
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'subscription' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Subscription Details</h2>
                <p className="card-subtitle">Manage your subscription and billing information.</p>
              </div>
              <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <CreditCard size={48} color="#64748b" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#64748b' }}>Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Security Settings</h2>
                <p className="card-subtitle">Manage your account security and privacy.</p>
              </div>
              <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                <Shield size={48} color="#64748b" style={{ marginBottom: '16px' }} />
                <p style={{ color: '#64748b' }}>Funcionalidade em desenvolvimento</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
