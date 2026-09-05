# Exel-2026

## Assistente com IA

O endpoint `api/assistant.js` foi preparado para a Vercel. Configure estas variáveis no projeto:

- `OPENAI_API_KEY`: chave da API da OpenAI, somente nas variáveis de ambiente da Vercel.
- `OPENAI_MODEL`: opcional; padrão `gpt-4o-mini`.
- `ALLOWED_ORIGIN`: opcional; domínio público da aplicação.

Na Vercel, publique este repositório como projeto sem build command. A função será disponibilizada em `/api/assistant`. A página usa essa rota automaticamente e continua com fallback local quando a API estiver indisponível.