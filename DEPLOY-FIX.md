# 🚨 SOLUÇÃO URGENTE - Deploy Vercel

## Problema

```
Environment Variable "DATABASE_URL" references Secret "database_url", which does not exist.
```

## Solução Rápida

### 1. Via Dashboard da Vercel (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```
DATABASE_URL = postgresql://[seu-usuario]:[sua-senha]@[host]:[port]/[database]
NEXTAUTH_SECRET = [sua-chave-secreta]
NEXTAUTH_URL = https://[seu-dominio].vercel.app
GOOGLE_CLIENT_ID = [seu-google-client-id]
GOOGLE_CLIENT_SECRET = [seu-google-client-secret]
```

### 2. Via CLI (Alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Configurar variáveis
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production

# Deploy
vercel --prod
```

### 3. Script Automático

```bash
npm run setup:vercel
```

## URL do Supabase

A URL do DATABASE_URL deve ser algo como:

```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

## Após Configurar

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. Ou faça um novo commit para trigger automático

## Verificação

Após o deploy, teste:

- https://[seu-dominio].vercel.app/api/health
- Modal de seleção de parceiros na home
- Login em /stilo-a/login
