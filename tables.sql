-- Tabela para armazenar as listas de validação
CREATE TABLE validation_lists (
    id SERIAL PRIMARY KEY,
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

-- Índices para melhorar a performance
CREATE INDEX idx_validation_leads_list_id ON validation_leads(list_id);
CREATE INDEX idx_validation_leads_numero ON validation_leads(numero);
CREATE INDEX idx_validation_leads_exists ON validation_leads(exists);