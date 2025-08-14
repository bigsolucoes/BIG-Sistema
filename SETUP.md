# BIG Gestor - Setup Guide

Este guia irá ajudá-lo a configurar o BIG Gestor com Supabase e AI gratuita.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Editor de código (VS Code recomendado)

## 🚀 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta ou faça login
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `big-gestor`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
7. Clique em "Create new project"

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor SQL
5. Clique em "Run" para executar o script
6. Verifique se todas as tabelas foram criadas em **Table Editor**

### 3. Configurar Autenticação

1. Vá para **Authentication** > **Settings**
2. Em **Site URL**, adicione: `http://localhost:5173`
3. Em **Redirect URLs**, adicione: `http://localhost:5173/**`
4. Salve as configurações

### 4. Obter Credenciais

1. Vá para **Settings** > **API**
2. Copie:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon public** key (chave pública)

## 🔧 Configuração do Projeto

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### 3. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🤖 Configuração da IA (Opcional)

O sistema já vem com IA básica gratuita. Para melhorar as respostas:

### Opção 1: OpenRouter (Recomendado)
1. Acesse [openrouter.ai](https://openrouter.ai)
2. Crie uma conta gratuita
3. Obtenha sua API key
4. Adicione no `.env`:
```env
OPENROUTER_API_KEY=sua-chave-openrouter
```

### Opção 2: Google Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma API key gratuita
3. Adicione no `.env`:
```env
API_KEY=sua-chave-gemini
```

## 👤 Primeiro Acesso

### Login de Administrador (Desenvolvimento)
- **Usuário**: `admin`
- **Senha**: `admin`

### Criar Nova Conta
1. Clique em "Registrar-se"
2. Preencha:
   - Nome de usuário (mínimo 3 caracteres)
   - Email válido
   - Senha (mínimo 6 caracteres)
3. Clique em "Registrar"

## 🔒 Segurança

### Produção
Para usar em produção:

1. **Supabase**:
   - Atualize as URLs permitidas
   - Configure domínio personalizado
   - Revise políticas RLS

2. **Variáveis de Ambiente**:
   - Use `VITE_` apenas para variáveis públicas
   - Mantenha API keys seguras
   - Configure HTTPS

## 📊 Funcionalidades

### ✅ Implementado
- ✅ Autenticação segura com Supabase
- ✅ Banco de dados PostgreSQL
- ✅ Gestão de jobs e clientes
- ✅ Sistema de pagamentos
- ✅ Rascunhos e roteiros
- ✅ IA gratuita para consultas
- ✅ Dashboard e relatórios
- ✅ Calendário integrado
- ✅ Exportação/importação de dados

### 🔄 Melhorias Futuras
- 📧 Notificações por email
- 📱 App mobile
- 🔗 Integrações com APIs externas
- 📈 Analytics avançados

## 🆘 Solução de Problemas

### Erro de Conexão com Supabase
1. Verifique se as variáveis de ambiente estão corretas
2. Confirme se o projeto Supabase está ativo
3. Verifique se as URLs estão configuradas corretamente

### Erro de Autenticação
1. Verifique se o schema foi executado corretamente
2. Confirme se as políticas RLS estão ativas
3. Teste com o login de admin primeiro

### IA não Funciona
1. A IA básica funciona sem configuração
2. Para melhor qualidade, configure OpenRouter ou Gemini
3. Verifique se as API keys estão corretas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este guia primeiro
2. Consulte a documentação do Supabase
3. Abra uma issue no repositório

## 🎉 Pronto!

Seu BIG Gestor está configurado e pronto para uso! 

Comece criando seus primeiros clientes e jobs para explorar todas as funcionalidades.
