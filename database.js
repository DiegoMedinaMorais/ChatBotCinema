const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database', 'cinema.db'));

// Descobre todas as tabelas do banco automaticamente
function listarTabelas() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
      [],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map((r) => r.name));
      }
    );
  });
}

// Puxa todos os registros de uma tabela
function selecionarTudo(tabela) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tabela}`, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

// Monta um "dump" completo do banco: { filmes: [...], series: [...], ... }
async function obterContextoCompleto() {
  const tabelas = await listarTabelas();
  const contexto = {};
  for (const tabela of tabelas) {
    contexto[tabela] = await selecionarTudo(tabela);
  }
  return contexto;
}

module.exports = { obterContextoCompleto, listarTabelas, selecionarTudo, db };
