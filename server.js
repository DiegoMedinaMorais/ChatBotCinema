require('dotenv').config();
const express = require('express');
const path = require('path');
const { obterContextoCompleto } = require('./database');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Confira o nome do modelo atual em https://console.groq.com/docs/models
const GROQ_MODEL = 'llama-3.3-70b-versatile';

app.post('/api/chat', async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({
        erro: 'GROQ_API_KEY não configurada. Crie um arquivo .env com sua chave.'
      });
    }

    const { mensagem, historico = [] } = req.body;

    if (!mensagem || typeof mensagem !== 'string') {
      return res.status(400).json({ erro: 'Mensagem vazia ou inválida.' });
    }

    const dadosBanco = await obterContextoCompleto();

    const systemPrompt = `
Você é o assistente virtual de um cinema. Responda SOMENTE com base nos dados
fornecidos abaixo, que representam o banco de dados do cinema (filmes,
séries, sessões, etc).

REGRAS OBRIGATÓRIAS:
- Nunca invente filmes, horários, preços, séries ou qualquer dado que não
  esteja presente no JSON abaixo.
- Se a pergunta não tiver relação com cinema/filmes/séries/sessões OU a
  informação não existir nos dados, responda educadamente que você só pode
  ajudar com o que está disponível no catálogo do cinema.
- Não responda perguntas gerais de conhecimento, atualidades, opiniões,
  cálculos, código, ou qualquer assunto fora do escopo do banco de dados.
- Seja objetivo, simpático e direto, como um atendente de cinema.
- Formate valores em reais (R$) quando fizer sentido, e datas/horários de
  forma legível.

DADOS DO BANCO (JSON):
${JSON.stringify(dadosBanco)}
`.trim();

    const mensagens = [
      { role: 'system', content: systemPrompt },
      ...historico.filter(
        (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
      ),
      { role: 'user', content: mensagem }
    ];

    const resposta = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: mensagens,
        temperature: 0.3
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro da API Groq:', dados);
      return res.status(500).json({ erro: 'Erro ao consultar a IA.' });
    }

    const textoResposta = dados.choices?.[0]?.message?.content ?? 'Não consegui gerar uma resposta.';
    res.json({ resposta: textoResposta });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
