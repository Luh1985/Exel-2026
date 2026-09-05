const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Método não permitido' });
  if (!process.env.OPENAI_API_KEY) return response.status(500).json({ error: 'OPENAI_API_KEY não configurada' });

  const { command, sheet } = request.body || {};
  if (!String(command || '').trim()) return response.status(400).json({ error: 'Pedido vazio' });

  const instructions = `Você é o assistente de uma planilha em português do Brasil. Entenda pedidos escritos de forma natural e converta-os em UMA única ação usando apenas os comandos abaixo. Responda somente JSON válido no formato {"command":"...","reply":"..."}.

Comandos aceitos:
- analise a planilha
- limpar a página
- corrija os problemas
- pinte a coluna B de amarelo
- exclua as linhas vazias
- exclua os valores duplicados
- padronize as vírgulas
- adicione uma linha
- adicione uma coluna
- insira o exemplo
- some C2:C10 em D11
- multiplique A1 por B1 em C1
- limpe B2
- preencha A1 com texto ou fórmula

Regras: preserve referências de células; transforme pedidos como “apague tudo”, “zere a aba” e “deixe a página vazia” em “limpar a página”; transforme pedidos de soma e multiplicação no formato aceito; não invente ações; se o pedido não puder ser executado, use “analise a planilha” e explique brevemente no campo reply.

Estado resumido da aba atual:
${JSON.stringify(sheet).slice(0, 18000)}

Pedido do usuário: ${command}`;

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4o-mini', input: instructions, temperature: 0.1 })
    });
    const payload = await openaiResponse.json();
    if (!openaiResponse.ok) return response.status(openaiResponse.status).json({ error: payload.error?.message || 'Falha na IA' });
    const text = payload.output_text || payload.output?.flatMap(item => item.content || []).map(item => item.text || '').join('') || '';
    const result = JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim());
    return response.status(200).json(result);
  } catch (error) {
    return response.status(502).json({ error: 'Não foi possível interpretar o pedido agora' });
  }
}
