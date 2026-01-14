import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await login(email, password)

    if (error) {
      setError('Email ou senha incorretos')
      setLoading(false)
      return
    }

    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
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
              <h1 className="text-2xl font-bold text-text-primary">Bem-vindo de volta!</h1>
              <p className="text-text-secondary mt-2">Entre na sua conta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <Button type="submit" fullWidth isLoading={loading} size="lg">
                Entrar
              </Button>
            </form>

            <p className="text-center mt-6 text-text-secondary">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="text-primary font-semibold hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-8">
        <div className="max-w-md text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Sistema de Mentoria</h2>
          <p className="text-lg opacity-90">
            Acompanhe seu progresso, gerencie seus projetos e evolua com a ajuda dos nossos mentores especializados em IA.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="bg-white/10 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">5h+</div>
              <div className="text-sm opacity-80">Pacote Básico</div>
            </div>
            <div className="bg-white/10 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">10h+</div>
              <div className="text-sm opacity-80">Pacote Intermediário</div>
            </div>
            <div className="bg-white/10 rounded-lg px-6 py-4">
              <div className="text-3xl font-bold">+</div>
              <div className="text-sm opacity-80">Personalizado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
