const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const input = document.getElementById('input-mensagem');
const botaoEnviar = form.querySelector('button');

let historico = [];

function adicionarMensagem(texto, autor) {
  const div = document.createElement('div');
  div.className = `mensagem ${autor}`;
  div.textContent = texto;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mensagem = input.value.trim();
  if (!mensagem) return;

  adicionarMensagem(mensagem, 'usuario');
  input.value = '';
  input.disabled = true;
  botaoEnviar.disabled = true;

  const carregando = adicionarMensagem('Digitando...', 'carregando');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem, historico })
    });
    const dados = await res.json();

    carregando.remove();

    if (dados.resposta) {
      adicionarMensagem(dados.resposta, 'bot');
      historico.push({ role: 'user', content: mensagem });
      historico.push({ role: 'assistant', content: dados.resposta });
    } else {
      adicionarMensagem(dados.erro || 'Erro ao obter resposta.', 'bot');
    }
  } catch (err) {
    carregando.remove();
    adicionarMensagem('Erro de conexão com o servidor.', 'bot');
  } finally {
    input.disabled = false;
    botaoEnviar.disabled = false;
    input.focus();
  }
});
