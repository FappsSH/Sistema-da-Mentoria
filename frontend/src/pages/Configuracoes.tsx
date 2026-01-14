import { useState, useEffect } from 'react'
import { Card, CardContent, Button, Input, Badge } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { Settings, User, Mail, Phone, Package, Clock, Camera } from 'lucide-react'

export function Configuracoes() {
  const { profile, updateProfile } = useAuth()
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

  const getPacoteLabel = (pacote: string | undefined) => {
    switch (pacote) {
      case 'basico':
        return { label: 'Básico', horas: 5 }
      case 'intermediario':
        return { label: 'Intermediário', horas: 10 }
      case 'avancado':
        return { label: 'Avançado', horas: profile?.horas_contratadas || 0 }
      default:
        return { label: 'Não definido', horas: 0 }
    }
  }

  const pacoteInfo = getPacoteLabel(profile?.pacote)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="text-primary" />
          Configurações
        </h1>
        <p className="text-text-secondary mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Perfil */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-text-primary mb-6">Informações do Perfil</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.foto_url ? (
                  <img
                    src={profile.foto_url}
                    alt={profile.nome_completo}
                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.nome_completo?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-light transition-colors"
                  title="Alterar foto (em breve)"
                >
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">{profile?.nome_completo}</h3>
                <p className="text-text-secondary">{profile?.email}</p>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm">
                Informações atualizadas com sucesso!
              </div>
            )}

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User size={18} className="absolute left-4 top-9 text-text-secondary" />
                <Input
                  label="Nome completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-9 text-text-secondary" />
                <Input
                  label="Email"
                  value={profile?.email || ''}
                  className="pl-11"
                  disabled
                  helperText="O email não pode ser alterado"
                />
              </div>

              <div className="relative md:col-span-2">
                <Phone size={18} className="absolute left-4 top-9 text-text-secondary" />
                <Input
                  label="Telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={loading}>
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informações do Pacote */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-text-primary mb-6">Seu Pacote</h2>

          <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package size={28} />
                </div>
                <div>
                  <Badge className="bg-white/20 text-white mb-1">
                    Pacote {pacoteInfo.label}
                  </Badge>
                  <h3 className="text-2xl font-bold">{pacoteInfo.horas}h de mentoria</h3>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80">Horas utilizadas</span>
                <span className="font-semibold">
                  {profile?.horas_utilizadas || 0}h / {profile?.horas_contratadas || 0}h
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{
                    width: profile?.horas_contratadas
                      ? `${Math.min((profile.horas_utilizadas / profile.horas_contratadas) * 100, 100)}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="text-white/80 text-sm mt-2">
                Você ainda tem {(profile?.horas_contratadas || 0) - (profile?.horas_utilizadas || 0)}h disponíveis
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-background rounded-lg">
            <div className="flex items-start gap-3">
              <Clock size={20} className="text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-text-primary">Precisa de mais horas?</h4>
                <p className="text-sm text-text-secondary mt-1">
                  Entre em contato conosco para fazer um upgrade do seu pacote ou contratar horas adicionais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Informações da Conta</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="font-medium text-text-primary">Conta criada em</p>
                <p className="text-sm text-text-secondary">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-text-primary">Última atualização</p>
                <p className="text-sm text-text-secondary">
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
