# Deploy do AutoTube no Cloud Run

Pré-requisitos: gcloud autenticado, projeto com Cloud Run + Cloud Build habilitados.

## 1. Build e deploy
```bash
gcloud builds submit --tag gcr.io/SEU_PROJETO/autotube .
gcloud run deploy autotube --image gcr.io/SEU_PROJETO/autotube --region southamerica-east1 --allow-unauthenticated --port 8080
```

## 2. Variáveis de ambiente (definir no Cloud Run)
- GEMINI_API_KEY: chave do Google AI Studio (somente servidor)
- YOUTUBE_API_KEY: chave do YouTube Data API v3 (somente servidor)
- APP_ACCESS_TOKEN: token de acesso do painel (obrigatório para o proxy de IA)

## 3. Verificação pós-deploy
- `GET /health` deve retornar 200
- Abrir a raiz: o painel deve carregar (build validado localmente: lint tsc limpo, vite build ok, servidor em modo produção testado com root 200 e health 200)

## Observações
- A branch foi validada no sandbox (Node 20 + build WASM do rolldown). No Cloud Run o build usa Node 22, que atende os engines exigidos pelo Vite 8.
- Se `npm install` falhar por pacotes corrompidos, rodar `npm cache clean --force` e repetir.
