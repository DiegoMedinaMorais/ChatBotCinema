# ChatBot Cinema

Chat com IA (via Groq API) que responde **somente** com base nos dados do
seu banco `cinema.db` (filmes, séries, sessões, etc).

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e coloque sua chave da Groq:
   ```bash
   cp .env.example .env
   ```
   Edite o `.env`:
   ```
   GROQ_API_KEY=sua_chave_aqui
   PORT=3000
   ```
   Pegue sua chave em https://console.groq.com

3. Se ainda não tem dados no banco, rode o script de exemplo (cria as
   tabelas `filmes`, `series` e `sessoes` com alguns dados fictícios):
   ```bash
   node inserirDados.js
   ```
   Se você já tem `database/cinema.db` com suas próprias tabelas, pode
   pular esse passo — o servidor lê o schema automaticamente, não
   importa os nomes das colunas.

4. Inicie o servidor:
   ```bash
   node server.js
   ```

5. Acesse http://localhost:3000

## Como funciona

- `database.js` lê **todas as tabelas do banco automaticamente** e monta
  um JSON com todos os dados.
- `server.js` expõe `POST /api/chat`. A cada pergunta, ele monta um
  "system prompt" instruindo a IA a responder **apenas** com base nesse
  JSON, e nunca inventar informação ou responder assuntos fora do escopo
  do cinema.
- O front-end (`public/`) é um chat simples que mantém o histórico da
  conversa em memória (no navegador) e conversa com a rota `/api/chat`.

## Ajustando para o seu banco real

Se suas tabelas/colunas forem diferentes das do `inserirDados.js`, não tem
problema — não precisa mudar nada no `database.js` nem no `server.js`,
eles já se adaptam ao schema que existir no `cinema.db`. Só ajuste (se
quiser) o texto do `systemPrompt` em `server.js` para dar dicas mais
específicas à IA sobre como interpretar suas colunas (ex: "o campo
`disponivel` é 1 para filmes em cartaz e 0 para fora de cartaz").

## Nota sobre o modelo da Groq

O nome do modelo (`GROQ_MODEL` em `server.js`) pode mudar com o tempo,
pois a Groq atualiza/depreca modelos periodicamente. Confira a lista
atual em https://console.groq.com/docs/models antes de rodar.

## Atenção

- Nunca suba o arquivo `.env` para o git (já está no `.gitignore`).
- Se o banco de dados crescer muito (milhares de linhas), mandar o JSON
  inteiro para a IA a cada pergunta vai ficar caro/lento — nesse caso, o
  ideal é filtrar os dados relevantes antes de montar o prompt (ex:
  buscar só os filmes que batem com palavras-chave da pergunta).
