# Sistema de Chamada de Senha - Clínica

## 1. Configurar o Supabase

1. Acesse o seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole todo o conteúdo do arquivo `supabase-setup.sql` e execute
4. Vá em **Authentication → Users** e crie os usuários dos atendentes (email + senha)

## 2. Rodar localmente (opcional)

```bash
npm install
npm run dev
```

## 3. Deploy no Netlify

1. Crie um repositório no GitHub e suba esta pasta
2. No Netlify, clique em **Add new site → Import an existing project**
3. Conecte o repositório
4. Em **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Em **Site settings → Environment variables**, adicione:
   - `VITE_SUPABASE_URL` = sua URL
   - `VITE_SUPABASE_ANON_KEY` = sua key
6. Faça o deploy

## Páginas

- `/` → Paciente pega senha
- `/tela` → Tela grande para a TV (chamada)
- `/painel` → Login dos atendentes

## Próximos passos (quando quiser)

- Tipos de fila diferentes
- Reset automático diário das senhas
- Som de chamada
- Histórico do dia
