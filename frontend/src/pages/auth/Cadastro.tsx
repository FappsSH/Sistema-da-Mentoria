import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react'

export function Cadastro() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await register(
      formData.email,
      formData.password,
      formData.nome,
      formData.telefone || undefined
    )

    if (error) {
      setError(error.message || 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Comece sua jornada</h2>
          <p className="text-lg opacity-90">
            Crie sua conta e tenha acesso a mentorias personalizadas para desenvolver seus projetos com IA.
          </p>
          <div className="mt-8 space-y-4 text-left">
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span>Crie sua conta gratuitamente</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span>Escolha seu pacote de mentoria</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span>Agende reuniões com seu mentor</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <span>Desenvolva seu projeto com suporte</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="80" height="80" rx="8" transform="rotate(45 50 50)" fill="#1a1a4e"/>
              <line x1="25" y1="55" x2="50" y2="30" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="25" y1="70" x2="60" y2="35" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="35" y1="80" x2="70" y2="45" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
            <span className="ml-3 text-3xl font-bold text-primary">fapps</span>
          </div>

          <div className="bg-surface rounded-2xl shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text-primary">Criar conta</h1>
              <p className="text-text-secondary mt-2">Preencha os dados para começar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  name="nome"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  className="pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Seu email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  name="telefone"
                  type="tel"
                  placeholder="Telefone (opcional)"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="pl-11"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Criar senha"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-11"
                  required
                />
              </div>

              <Button type="submit" fullWidth isLoading={loading} size="lg">
                Criar conta
              </Button>
            </form>

            <p className="text-center mt-6 text-text-secondary">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
