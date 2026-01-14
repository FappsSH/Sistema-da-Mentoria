# Sistema de Mentoria - Fapps

Sistema de gerenciamento e acompanhamento de mentorados para o programa de mentoria prática em IA da Fapps.

## Fase 1 - Área do Mentorado (MVP)

### Funcionalidades

- **Login/Cadastro** - Autenticação simples com email e senha
- **Dashboard (Home)** - Visão geral com métricas, horas e próximas reuniões
- **Agenda** - Calendário para agendar e visualizar reuniões de mentoria
- **Projetos** - Gerenciamento de projetos do mentorado
- **Roadmap** - Checkpoints com status, prazos e estimativa de conclusão
- **Configurações** - Edição do perfil do usuário
- **Notificações** - Alertas de roadmaps vencidos e reuniões

### Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **Calendário**: React Big Calendar
- **Ícones**: Lucide React

---

## Instalação

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/FappsSH/Sistema-da-Mentoria.git
cd Sistema-da-Mentoria
```

### 2. Configure o Supabase

1. Crie um novo projeto no Supabase
2. Vá em **SQL Editor** e execute o conteúdo do arquivo `supabase/schema.sql`
3. Copie a **URL** e **anon key** do seu projeto (Settings > API)

### 3. Configure as variáveis de ambiente

```bash
cd frontend
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Execute o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

---

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes reutilizáveis (Button, Card, etc)
│   │   ├── layout/      # Layout (Header, Sidebar)
│   │   └── shared/      # Componentes compartilhados
│   ├── pages/           # Páginas da aplicação
│   ├── hooks/           # Hooks customizados (useAuth, useNotificacoes)
│   ├── services/        # Serviços (Supabase)
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilitários
├── .env                 # Variáveis de ambiente
└── package.json
```

---

## Próximas Fases

- **Fase 2**: Área do Mentor
- **Fase 3**: Área do Admin

---

## Licença

Projeto privado da Fapps.
