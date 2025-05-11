-- Tabela para armazenar as empresas
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar os usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin' ou 'user'
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as listas de validação
CREATE TABLE validation_lists (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_leads INTEGER NOT NULL,
    valid_leads INTEGER NOT NULL,
    invalid_leads INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar os leads
CREATE TABLE validation_leads (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES validation_lists(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    exists BOOLEAN NOT NULL DEFAULT false,
    jid VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar os templates de mensagem
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_message TEXT NOT NULL,
    template_connection VARCHAR(100) NOT NULL,
    template_list_id INTEGER REFERENCES validation_lists(id),
    template_list_name VARCHAR(255),
    ai_responses TEXT[],
    custom_fields JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as conexões de WhatsApp
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'disconnected',
    profile_name VARCHAR(255),
    profile_pic_url TEXT,
    owner_jid VARCHAR(100),
    integration VARCHAR(50),
    client_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar a performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_validation_lists_company_id ON validation_lists(company_id);
CREATE INDEX idx_templates_company_id ON templates(company_id);
CREATE INDEX idx_connections_company_id ON connections(company_id);
CREATE INDEX idx_validation_leads_list_id ON validation_leads(list_id);
CREATE INDEX idx_validation_leads_numero ON validation_leads(numero);
CREATE INDEX idx_validation_leads_exists ON validation_leads(exists);
CREATE INDEX idx_templates_list_id ON templates(template_list_id);
CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_connection ON templates(template_connection);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_lists_updated_at
    BEFORE UPDATE ON validation_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_leads_updated_at
    BEFORE UPDATE ON validation_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();