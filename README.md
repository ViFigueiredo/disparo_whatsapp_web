# Sistema de Disparo WhatsApp Web

Sistema para gerenciamento de disparos de mensagens via WhatsApp, com suporte a múltiplas conexões, templates e validação de números.

## 🏗️ Arquitetura

O projeto é construído em Vue.js 3 com as seguintes tecnologias principais:

- **Vue 3**: Framework frontend principal
- **Vite**: Build tool e servidor de desenvolvimento
- **Tailwind CSS**: Framework CSS para estilização
- **PostgreSQL**: Banco de dados relacional
- **n8n**: Plataforma de automação para webhooks

### Estrutura de Diretórios

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes Vue reutilizáveis
│   ├── common/      # Componentes base (Button, Modal, etc)
│   ├── connections/ # Componentes de conexões WhatsApp
│   ├── templates/   # Componentes de templates
│   └── validation/  # Componentes de validação
├── composables/     # Composables Vue (lógica reutilizável)
├── config/         # Configurações (webhooks, etc)
├── views/          # Componentes de página
└── App.vue         # Componente raiz
```

## 🔗 Conexões e Integrações

### Banco de Dados

O sistema utiliza PostgreSQL com as seguintes tabelas principais:

- `companies`: Empresas (modelo SaaS)
- `users`: Usuários do sistema
- `templates`: Templates de mensagem
- `validation_lists`: Listas de validação
- `validation_leads`: Leads para validação
- `company_connections`: Conexões WhatsApp por empresa

### Webhooks (n8n)

As integrações são gerenciadas via n8n, com endpoints definidos em `.env`:

#### Conexões WhatsApp
- Lista de conexões: `/webhook/instancias`
- Criar conexão: `/webhook/instancias/create`
- QR Code: `/webhook/instancias/qrcode`
- Estado: `/webhook/instancias/state`
- Deletar: `/webhook/instancias/delete`

#### Templates
- Templates Web: `/webhook/templates/list`
- Templates Cloud: `/webhook/templates/cloud`
- Operações CRUD: `/webhook/templates/{create|update|delete}`
- Disparo: `/webhook/disparo`

#### Validação
- Listas: `/webhook/listas`
- Validador: `/webhook/validador`
- Operações: `/webhook/listas/{create|delete}`

#### Empresas (SaaS)
- CRUD: `/webhook/empresas/{list|create|update|delete}`
- Conexões: `/webhook/empresas/conexoes/{create|list|update|delete}`

## 🔐 Autenticação e Autorização

O sistema implementa um modelo de autenticação baseado em roles:

- **Admin**: Acesso total ao sistema
- **User**: Acesso limitado aos recursos da própria empresa

### Fluxo de Autenticação
1. Login via endpoint `/webhook/auth/login`
2. Armazenamento de token e dados do usuário no localStorage
3. Verificação de permissões via `useAuth` composable

## 💼 Modelo SaaS

O sistema é multi-tenant, onde:

1. Cada empresa tem:
   - Seus próprios usuários
   - Suas próprias conexões WhatsApp
   - Seus próprios templates
   - Suas próprias listas de validação

2. Isolamento de dados:
   - Queries filtradas por `company_id`
   - Validações de acesso em cada operação
   - Templates vinculados à empresa

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências:
   ```bash
   yarn install
   ```

3. Configure o arquivo `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   # Configure os demais webhooks conforme necessário
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   yarn dev
   ```

## 📦 Build e Deploy

Para build de produção:
```bash
yarn build
```

Os arquivos serão gerados na pasta `dist/`.

## 🔧 Configuração

### Variáveis de Ambiente

Principais variáveis que precisam ser configuradas:

- `VITE_API_BASE_URL`: URL base da API
- `VITE_ADMIN_EMAIL`: Email do admin padrão
- `VITE_ADMIN_PASSWORD`: Senha do admin padrão
- Webhooks do n8n (ver arquivo `.env.example`)

### Banco de Dados

Execute as migrations do arquivo `tables.sql` para criar a estrutura do banco.

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Notas

- O sistema usa o n8n como middleware para todas as operações
- Templates podem ser do WhatsApp Web ou WhatsApp Business API
- Validação de números é feita em lote
- Sistema preparado para múltiplas conexões por empresa
