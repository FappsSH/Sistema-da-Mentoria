-- Schema do banco de dados para o Sistema de Mentoria
-- Execute este SQL no Editor SQL do Supabase

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para tipo de pacote
CREATE TYPE pacote_type AS ENUM ('basico', 'intermediario', 'avancado');

-- Enum para status do projeto
CREATE TYPE status_projeto AS ENUM ('ativo', 'concluido', 'pausado');

-- Enum para status do roadmap
CREATE TYPE status_roadmap AS ENUM ('pendente', 'concluido', 'vencido');

-- Enum para status da reunião
CREATE TYPE status_reuniao AS ENUM ('agendada', 'realizada', 'cancelada');

-- Enum para tipo de notificação
CREATE TYPE tipo_notificacao AS ENUM ('roadmap_vencido', 'reuniao_hoje', 'lembrete');

-- Tabela de perfis (extende auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    foto_url TEXT,
    pacote pacote_type DEFAULT 'basico',
    horas_contratadas INTEGER DEFAULT 5,
    horas_utilizadas DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE projetos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    status status_projeto DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de roadmaps (checkpoints)
CREATE TABLE roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status status_roadmap DEFAULT 'pendente',
    data_prazo DATE,
    data_conclusao DATE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de reuniões
CREATE TABLE reunioes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracao_minutos INTEGER DEFAULT 60,
    status status_reuniao DEFAULT 'agendada',
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tipo tipo_notificacao NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    referencia_id UUID,
    referencia_tipo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_projetos_user_id ON projetos(user_id);
CREATE INDEX idx_roadmaps_projeto_id ON roadmaps(projeto_id);
CREATE INDEX idx_roadmaps_status ON roadmaps(status);
CREATE INDEX idx_reunioes_user_id ON reunioes(user_id);
CREATE INDEX idx_reunioes_data_hora ON reunioes(data_hora);
CREATE INDEX idx_notificacoes_user_id ON notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);

-- RLS (Row Level Security) - Políticas de segurança

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunioes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para projetos
CREATE POLICY "Users can view own projects" ON projetos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projetos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projetos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projetos
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para roadmaps
CREATE POLICY "Users can view own roadmaps" ON roadmaps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projetos
            WHERE projetos.id = roadmaps.projeto_id
            AND projetos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own roadmaps" ON roadmaps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projetos
            WHERE projetos.id = roadmaps.projeto_id
            AND projetos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own roadmaps" ON roadmaps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projetos
            WHERE projetos.id = roadmaps.projeto_id
            AND projetos.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own roadmaps" ON roadmaps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projetos
            WHERE projetos.id = roadmaps.projeto_id
            AND projetos.user_id = auth.uid()
        )
    );

-- Políticas para reuniões
CREATE POLICY "Users can view own meetings" ON reunioes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON reunioes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON reunioes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON reunioes
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notificações
CREATE POLICY "Users can view own notifications" ON notificacoes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notificacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notificacoes
    FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
    BEFORE UPDATE ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
    BEFORE UPDATE ON roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar e atualizar roadmaps vencidos (pode ser chamada por um cron job)
CREATE OR REPLACE FUNCTION check_overdue_roadmaps()
RETURNS void AS $$
DECLARE
    roadmap_record RECORD;
BEGIN
    FOR roadmap_record IN
        SELECT r.id, r.titulo, p.user_id
        FROM roadmaps r
        JOIN projetos p ON r.projeto_id = p.id
        WHERE r.status = 'pendente'
        AND r.data_prazo < CURRENT_DATE
    LOOP
        -- Atualizar status para vencido
        UPDATE roadmaps SET status = 'vencido' WHERE id = roadmap_record.id;

        -- Criar notificação
        INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, referencia_id, referencia_tipo)
        VALUES (
            roadmap_record.user_id,
            'roadmap_vencido',
            'Checkpoint vencido',
            'O checkpoint "' || roadmap_record.titulo || '" passou do prazo.',
            roadmap_record.id,
            'roadmap'
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
