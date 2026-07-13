// Script de EXEMPLO para criar/popular o banco cinema.db.
// Ajuste as tabelas e colunas conforme o que você já tem, se já existir dado real.
// Rode com: node inserirDados.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database', 'cinema.db'));

db.serialize(() => {
  // Tabela de filmes em cartaz / disponíveis
  db.run(`
    CREATE TABLE IF NOT EXISTS filmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      genero TEXT,
      classificacao TEXT,
      duracao_minutos INTEGER,
      sinopse TEXT,
      em_cartaz INTEGER DEFAULT 1
    )
  `);

  // Tabela de séries
  db.run(`
    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      genero TEXT,
      temporadas INTEGER,
      sinopse TEXT
    )
  `);

  // Tabela de sessões (horários de exibição de cada filme)
  db.run(`
    CREATE TABLE IF NOT EXISTS sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filme_id INTEGER,
      data TEXT,
      horario TEXT,
      sala TEXT,
      preco REAL,
      FOREIGN KEY (filme_id) REFERENCES filmes (id)
    )
  `);

  // Dados de exemplo — apague ou ajuste depois
  const filmes = [
    ['Duna: Parte Três', 'Ficção Científica', '14 anos', 165, 'A saga de Paul Atreides continua.', 1],
    ['Uma Comédia Qualquer', 'Comédia', 'Livre', 98, 'Confusões de família em uma viagem.', 1],
    ['Terror na Casa Antiga', 'Terror', '16 anos', 110, 'Uma família se muda para uma casa amaldiçoada.', 1]
  ];

  const stmtFilme = db.prepare(
    `INSERT INTO filmes (titulo, genero, classificacao, duracao_minutos, sinopse, em_cartaz) VALUES (?, ?, ?, ?, ?, ?)`
  );
  filmes.forEach((f) => stmtFilme.run(f));
  stmtFilme.finalize();

  const series = [
    ['Mistérios da Cidade', 'Suspense', 3, 'Um detetive investiga casos sobrenaturais.'],
    ['Risadas em Família', 'Comédia', 5, 'O dia a dia caótico de uma família grande.']
  ];

  const stmtSerie = db.prepare(`INSERT INTO series (titulo, genero, temporadas, sinopse) VALUES (?, ?, ?, ?)`);
  series.forEach((s) => stmtSerie.run(s));
  stmtSerie.finalize();

  // Sessões vinculadas ao filme de id 1, 2 e 3 (assumindo inserção em ordem)
  const sessoes = [
    [1, '2026-07-14', '19:30', 'Sala 1', 32.0],
    [1, '2026-07-14', '22:00', 'Sala 1', 32.0],
    [2, '2026-07-14', '18:00', 'Sala 2', 28.0],
    [3, '2026-07-15', '21:00', 'Sala 3', 30.0]
  ];

  const stmtSessao = db.prepare(
    `INSERT INTO sessoes (filme_id, data, horario, sala, preco) VALUES (?, ?, ?, ?, ?)`
  );
  sessoes.forEach((s) => stmtSessao.run(s));
  stmtSessao.finalize();

  console.log('Banco populado com dados de exemplo.');
});

db.close();
