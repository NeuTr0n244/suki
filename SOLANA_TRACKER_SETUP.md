# Como Obter API Key do Solana Tracker

## Passo 1: Criar Conta

1. Acesse: https://www.solanatracker.io/
2. Clique em "Sign Up" ou "Get Started"
3. Crie sua conta (email + senha)

## Passo 2: Obter API Key

1. Após login, vá para: https://www.solanatracker.io/data-api
2. Clique em "Get API Key" ou "Dashboard"
3. Na seção de API Keys, clique em "Generate New Key"
4. Copie a API key gerada

## Passo 3: Configurar no Projeto

1. Abra o arquivo `.env.local` na raiz do projeto
2. Cole sua API key:
   ```
   SOLANA_TRACKER_API_KEY=sua_api_key_aqui
   ```
3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento (`npm run dev`)

## Free Tier

O Solana Tracker oferece um free tier com:
- Limite de requisições mensais (veja no dashboard)
- Acesso completo à API de PnL
- Sem necessidade de cartão de crédito

## Documentação

API completa: https://docs.solanatracker.io/data-api/pnl/get-wallet-pnl

## Troubleshooting

### "API key not configured"
- Verifique se a variável `SOLANA_TRACKER_API_KEY` está no `.env.local`
- Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)

### "Could not fetch wallet data"
- Verifique se o endereço da carteira está correto
- Verifique se a API key é válida (teste no dashboard do Solana Tracker)
- Verifique se não excedeu o limite de requisições do free tier

### API retorna erro 403
- Sua API key pode estar incorreta ou expirada
- Gere uma nova API key no dashboard

### API retorna erro 429
- Você excedeu o rate limit
- Espere alguns minutos ou faça upgrade do plano
