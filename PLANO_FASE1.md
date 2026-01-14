# Plano Técnico - Fase 1: Área do Mentorado

## Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Frontend | React 18 + TypeScript | Componentização, tipagem forte |
| Build Tool | Vite | Rápido, moderno, HMR eficiente |
| Estilização | Tailwind CSS | Produtividade, design system consistente |
| Roteamento | React Router v6 | SPA navigation |
| Backend/DB | Supabase | PostgreSQL + Auth + Realtime integrados |
| Ícones | Lucide React | Leve, consistente |
| Calendário | React Big Calendar | Componente de agenda robusto |
| Datas | date-fns | Manipulação de datas |

---

## Estrutura do Banco de Dados (Supabase)

### Tabelas

#### `users` (gerenciada pelo Supabase Auth)
- Campos adicionais via tabela `profiles`

#### `profiles`
```sql
- id (uuid, FK -> auth.users)
- nome_completo (text)
- telefone (text)
- foto_url (text)
- pacote (enum: 'basico', 'intermediario', 'avancado')
- horas_contratadas (integer)
- horas_utilizadas (decimal)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `projetos`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- nome (text)
- descricao (text)
- status (enum: 'ativo', 'concluido', 'pausado')
- created_at (timestamp)
- updated_at (timestamp)
```

#### `roadmaps` (checkpoints)
```sql
- id (uuid, PK)
- projeto_id (uuid, FK -> projetos)
- titulo (text)
- descricao (text)
- status (enum: 'pendente', 'concluido', 'vencido')
- data_prazo (date)
- data_conclusao (date, nullable)
- ordem (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `reunioes`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- titulo (text)
- data_hora (timestamp)
- duracao_minutos (integer, default: 60)
- status (enum: 'agendada', 'realizada', 'cancelada')
- notas (text)
- created_at (timestamp)
```

#### `notificacoes`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- tipo (enum: 'roadmap_vencido', 'reuniao_hoje', 'lembrete')
- titulo (text)
- mensagem (text)
- lida (boolean, default: false)
- referencia_id (uuid, nullable)
- referencia_tipo (text, nullable)
- created_at (timestamp)
```

---

## Estrutura de Pastas do Projeto

```
src/
├── assets/
│   └── logo-fapps.png
├── components/
│   ├── ui/                    # Componentes reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── shared/
│       ├── NotificationBell.tsx
│       └── UserAvatar.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Cadastro.tsx
│   ├── Home.tsx
│   ├── Agenda.tsx
│   ├── Projeto.tsx
│   ├── Roadmap.tsx
│   └── Configuracoes.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useNotificacoes.ts
│   └── useSupabase.ts
├── services/
│   └── supabase.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Fluxo de Telas

### 1. Login/Cadastro
- **Campos Login**: Email, Senha
- **Campos Cadastro**: Nome completo, Email, Telefone, Senha, Confirmar senha
- **Ação**: Após login → redireciona para `/home`

### 2. Layout Global
- **Header**: Logo Fapps (esquerda), Sininho notificações + Foto perfil (direita)
- **Sidebar**: Menu com ícones e labels (Home, Agenda, Projeto, Roadmap, Configurações)

### 3. Home (Dashboard)
- Card: Checkpoints pendentes (número)
- Card: Checkpoints concluídos (número)
- Card: Horas utilizadas / Horas contratadas
- Card: Próxima reunião ou botão "Agendar"
- Lista: Últimos roadmaps pendentes

### 4. Agenda
- Calendário mensal com reuniões marcadas
- Botão "Nova Reunião" → abre modal
- Modal: Data, Hora, Título, Descrição

### 5. Projeto
- Cards com métricas:
  - Total de tarefas em aberto
  - Total concluídas
  - Total atrasadas
- Lista de projetos do usuário
- Botão "Novo Projeto" → modal de criação

### 6. Roadmap
- Filtros: Todos, Pendentes, Concluídos, Vencidos
- Lista de checkpoints com:
  - Título
  - Prazo
  - Status (badge colorido)
  - Ações (editar, marcar concluído)
- Barra de progresso geral
- Estimativa de conclusão
- Botão "Novo Checkpoint" → modal

### 7. Configurações
- Formulário com dados do perfil
- Upload de foto
- Botão salvar

---

## Cores do Design (baseado na logo Fapps)

```css
--primary: #1a1a4e (azul escuro/roxo da logo)
--primary-light: #2d2d7a
--secondary: #6366f1 (indigo)
--success: #22c55e (verde)
--warning: #f59e0b (amarelo)
--danger: #ef4444 (vermelho)
--background: #f8fafc
--surface: #ffffff
--text-primary: #1e293b
--text-secondary: #64748b
```

---

## Automações a Implementar

1. **Roadmap vencido**: Cron job ou trigger que verifica `data_prazo < hoje` e `status = 'pendente'` → atualiza para `'vencido'` e cria notificação

2. **Notificação de reunião**: Verifica reuniões do dia e cria notificação

---

## Próximos Passos

1. ✅ Aprovar este plano
2. Inicializar projeto React + Vite + TypeScript
3. Configurar Tailwind CSS
4. Criar componentes base (UI + Layout)
5. Implementar autenticação
6. Desenvolver cada tela
7. Conectar com Supabase
8. Testar fluxos

---

**Aguardando aprovação para iniciar o desenvolvimento!**
