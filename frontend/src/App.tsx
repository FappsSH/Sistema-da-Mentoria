import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { NotificacoesProvider } from './hooks/useNotificacoes'
import { Layout } from './components/layout'

// Pages
import { Login } from './pages/auth/Login'
import { Cadastro } from './pages/auth/Cadastro'
import { Home } from './pages/Home'
import { Agenda } from './pages/Agenda'
import { ProjetoPage } from './pages/Projeto'
import { RoadmapPage } from './pages/Roadmap'
import { Configuracoes } from './pages/Configuracoes'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificacoesProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path="/agenda"
              element={
                <Layout>
                  <Agenda />
                </Layout>
              }
            />
            <Route
              path="/projeto"
              element={
                <Layout>
                  <ProjetoPage />
                </Layout>
              }
            />
            <Route
              path="/roadmap"
              element={
                <Layout>
                  <RoadmapPage />
                </Layout>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <Layout>
                  <Configuracoes />
                </Layout>
              }
            />

            {/* Redirect root to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </NotificacoesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
