# 🚀 Guia de Deploy - BIG Gestor

## Deploy no Vercel (Recomendado)

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit - BIG Gestor v2.0"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/big-gestor.git
git push -u origin main
```

### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione seu repositório `big-gestor`
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave pública do Supabase
6. Clique em "Deploy"

### 3. Configurar Domínio no Supabase

Após o deploy:
1. Copie a URL do Vercel (ex: `https://big-gestor.vercel.app`)
2. No Supabase, vá em **Authentication** > **Settings**
3. Atualize:
   - **Site URL**: `https://big-gestor.vercel.app`
   - **Redirect URLs**: `https://big-gestor.vercel.app/**`

## Deploy Manual (Servidor Próprio)

### 1. Build do Projeto

```bash
npm run build
```

### 2. Configurar Servidor Web

#### Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    root /path/to/big-gestor/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configurar headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName seu-dominio.com
    DocumentRoot /path/to/big-gestor/dist
    
    <Directory /path/to/big-gestor/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
        
        # Rewrite para SPA
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## Variáveis de Ambiente para Produção

### Obrigatórias
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### Opcionais (para melhor IA)
```env
OPENROUTER_API_KEY=sua-chave-openrouter
API_KEY=sua-chave-gemini
```

## Checklist de Produção

### ✅ Segurança
- [ ] HTTPS configurado
- [ ] Variáveis de ambiente seguras
- [ ] RLS ativo no Supabase
- [ ] URLs de redirect configuradas
- [ ] Headers de segurança configurados

### ✅ Performance
- [ ] Build otimizado executado
- [ ] Compressão gzip ativa
- [ ] Cache configurado
- [ ] CDN configurado (opcional)

### ✅ Monitoramento
- [ ] Logs de erro configurados
- [ ] Analytics configurado (opcional)
- [ ] Backup do banco configurado
- [ ] Monitoramento de uptime

## Domínio Personalizado

### No Vercel
1. Vá em **Settings** > **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação

### No Supabase
1. Atualize **Site URL** com novo domínio
2. Atualize **Redirect URLs**
3. Teste autenticação

## Backup e Recuperação

### Backup Automático
O Supabase faz backup automático, mas você pode:

```sql
-- Backup manual via SQL
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Backup via Interface
1. No painel do Supabase
2. **Settings** > **Database**
3. **Backups** > **Download**

## Troubleshooting

### Erro 404 em Rotas
- Verifique configuração de rewrite no servidor
- Confirme se `vercel.json` está correto

### Erro de CORS
- Verifique URLs no Supabase
- Confirme variáveis de ambiente

### Erro de Autenticação
- Teste com login admin primeiro
- Verifique RLS policies
- Confirme schema do banco

## Atualizações

### Deploy Automático
Com Vercel + GitHub:
1. Faça push para `main`
2. Deploy automático será executado
3. Verifique logs no painel Vercel

### Deploy Manual
```bash
git pull origin main
npm install
npm run build
# Copiar dist/ para servidor
```

## Monitoramento

### Logs do Vercel
- Acesse painel Vercel
- Vá em **Functions** > **Logs**

### Logs do Supabase
- Acesse painel Supabase
- Vá em **Logs** > **Database**

### Analytics (Opcional)
- Google Analytics
- Vercel Analytics
- Supabase Analytics

## 🎉 Pronto para Produção!

Seu BIG Gestor está agora rodando em produção com:
- ✅ Autenticação segura
- ✅ Banco de dados PostgreSQL
- ✅ IA gratuita integrada
- ✅ Interface responsiva
- ✅ Backup automático
- ✅ SSL/HTTPS
- ✅ Performance otimizada

Compartilhe o link com seus usuários e comece a gerenciar projetos profissionalmente!
