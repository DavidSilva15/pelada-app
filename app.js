const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

//rota principal
app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Pelada App</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="bg-light">
        <div class="container py-5">
            <div class="text-center mb-4">
                <h1 class="display-6" style="font-weight: 600;">Pelada71</h1
            </div>
            <div class="d-grid gap-3 col-6 mx-auto">
                <a href="/estatisticas" class="btn btn-primary btn-lg">Estatísticas</a>
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

//rota para estatísticas
app.get('/estatisticas', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Estatísticas</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet"href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
    </head>
    <body class="bg-light">
        <div class="container py-5">
            <div class="text-center mb-4">
                <h1 class="display-6" style="font-weight: 600;">Estatísticas</h1>
            </div>
            <div class="d-grid gap-3 col-6 mx-auto">
                <a href="/estatisticas/ranking" class="btn btn-success btn-lg"><i class="fas fa-trophy me-2"></i> Ranking</a>
                <a href="/estatisticas/partidas" class="btn btn-primary btn-lg"><i class="fas fa-futbol me-2"></i> Partidas</a>
                <a href="/" class="btn btn-secondary btn-lg">Voltar</a>
            </div>
        </div>
    </body>
    </html>
    `;
    res.send(html);
});

//rota para partidas
app.get('/estatisticas/partidas', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Partidas</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </head>
        <body class="bg-light d-flex flex-column justify-content-center align-items-center vh-100">
            <div class="text-center p-4 bg-white rounded shadow position-relative" style="width: 350px;">
                <h2 class="mb-3"><i class="fa-solid fa-exclamation-triangle"></i>Página de Partidas (em desenvolvimento)</h2>
                <p class="mb-3">Rai esteve por aqui</p>
                <img src="/rai.png" alt="Imagem Rai" class="img-fluid mb-3" style="max-width: 300px;">
                <div class="d-flex justify-content-start">
                    <a href="/estatisticas" class="btn btn-primary">Voltar</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

//rota para o ranking
app.get('/estatisticas/ranking', (req, res) => {
    db.query('SELECT * FROM ranking ORDER BY pontuacao DESC, gols DESC, assistencias DESC, amarelos ASC, vermelhos ASC', (err, results) => {
        if (err) throw err;

        function formatDate(date) {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = String(d.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        }

        let rows = results.map((player, index) => {
            let rowClass = '';
            if (index < 4) {
                rowClass = 'table-success';
            } else if (index < 15) {
                rowClass = 'table-warning';
            } else {
                rowClass = 'table-danger';
            }

            return `
                <tr class="${rowClass}" style="text-align:center;">
                    <td>${index + 1}</td>
                    <td>${player.nome}</td>
                    <td>${player.gols}</td>
                    <td>${player.assistencias}</td>
                    <td>${player.amarelos}</td>
                    <td>${player.vermelhos}</td>
                    <td>${player.partidas}</td>
                    <td>${player.mensalidade}</td>
                    <td>${formatDate(player.presenca)}</td>
                    <td>${player.pontuacao}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" title="Editar" onclick="openEditModal(
                            ${player.id}, 
                            '${player.nome}', 
                            ${player.gols}, 
                            ${player.assistencias}, 
                            ${player.amarelos}, 
                            ${player.vermelhos}, 
                            ${player.partidas},
                            '${player.mensalidade}',
                            '${player.presenca.toISOString().split('T')[0]}',
                            ${player.pontuacao}
                        )">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <form method="POST" action="/estatisticas/ranking/excluir/${player.id}" style="display:inline;">
                            <button class="btn btn-danger btn-sm" title="Excluir" type="submit" onclick="return confirm('Tem certeza que deseja excluir?')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </form>
                    </td>
                </tr>`;
        }).join('');


        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ranking</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <!-- Font Awesome -->
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
            <link rel="stylesheet" href="./public/sttyle.css">
        </head>
        <body class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="mb-0">Ranking</h1>
                <button type="button" class="btn btn-primary" onclick="openNewModal()">
                    <i class="fas fa-plus me-2"></i> Novo registro
                </button>
            </div>

            <table class="table table-striped table-bordered align-middle">
                <thead>
                    <tr>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-medal" title="Pontuação"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-users" title="Jogadores"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-futbol" style="color: white;"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-concierge-bell" style="color: white;"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-square" style="color: #FFD700;" title="Cartões Amarelos"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-square" style="color: #FF0000;" title="Cartões Vermelhos"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-calendar-alt" title="Partidas"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-file-invoice-dollar" title="Mensalidade"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-calendar-check" title="Presença"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            <i class="fas fa-star" title="Pontuação"></i>
                        </th>
                        <th style="background-color: rgb(51, 51, 51); color: white; font-weight: bold; text-align: center; vertical-align: middle; padding: 12px 8px;">
                            Ações
                        </th>
                    </tr>
                </thead>

                <tbody>${rows}</tbody>
            </table>
            <a href="/estatisticas" class="btn btn-secondary mt-3 mb-4">Voltar</a>

            <!-- Overlay comum para os modais -->
            <div id="modalOverlay" 
                style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background-color:rgba(0,0,0,0.5); z-index:1040;"
                onclick="closeModals()"></div>

            <!-- Modal de Novo Jogador -->
            <div id="modal" class="p-4 border bg-light rounded position-fixed top-50 start-50 translate-middle" 
                style="display:none; z-index:1050; max-width: 600px; width: 90vw;">
                <h2>Novo registro</h2>
                <form method="POST" action="/estatisticas/ranking/novo" class="modal-form">
                    <div class="form-group">
                        <label for="nomeNovo" class="form-label">Nome</label>
                        <input id="nomeNovo" name="nome" class="form-control" placeholder="Nome" required>
                    </div>

                    <div class="form-group">
                        <label for="golsNovo" class="form-label">Gols</label>
                        <input id="golsNovo" name="gols" class="form-control" placeholder="Gols" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="assistenciasNovo" class="form-label">Assistências</label>
                        <input id="assistenciasNovo" name="assistencias" class="form-control" placeholder="Assistências" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="amarelosNovo" class="form-label">Amarelos</label>
                        <input id="amarelosNovo" name="amarelos" class="form-control" placeholder="Amarelos" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="vermelhosNovo" class="form-label">Vermelhos</label>
                        <input id="vermelhosNovo" name="vermelhos" class="form-control" placeholder="Vermelhos" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="partidasNovo" class="form-label">Partidas</label>
                        <input id="partidasNovo" name="partidas" class="form-control" placeholder="Partidas" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="mensalidadeNovo" class="form-label">Mensalidade</label>
                        <select id="mensalidadeNovo" name="mensalidade" class="form-select">
                            <option value="Pago">Pago</option>
                            <option value="Calote">Calote</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="presencaNovo" class="form-label">Presença</label>
                        <input id="presencaNovo" name="presenca" class="form-control" type="date">
                    </div>

                    <div class="modal-buttons" style="flex-basis: 100%;">
                        <button type="submit" class="btn btn-success flex-grow-1">Salvar</button>
                        <button type="button" class="btn btn-secondary flex-grow-1" onclick="closeModals()">Cancelar</button>
                    </div>
                </form>
            </div>

            <!-- Modal de Edição -->
            <div id="editModal" class="p-4 border bg-light rounded position-fixed top-50 start-50 translate-middle" 
                style="display:none; z-index:1050; max-width: 600px; width: 90vw;">
                <h2>Editar Jogador</h2>
                <form method="POST" id="editForm" class="modal-form">
                    <div class="form-group">
                        <label for="editNome" class="form-label">Nome</label>
                        <input id="editNome" name="nome" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="editGols" class="form-label">Gols</label>
                        <input id="editGols" name="gols" class="form-control" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="editAssistencias" class="form-label">Assistências</label>
                        <input id="editAssistencias" name="assistencias" class="form-control" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="editAmarelos" class="form-label">Amarelos</label>
                        <input id="editAmarelos" name="amarelos" class="form-control" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="editVermelhos" class="form-label">Vermelhos</label>
                        <input id="editVermelhos" name="vermelhos" class="form-control" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="editPartidas" class="form-label">Partidas</label>
                        <input id="editPartidas" name="partidas" class="form-control" type="number" min="0">
                    </div>

                    <div class="form-group">
                        <label for="editMensalidade" class="form-label">Mensalidade</label>
                        <select id="editMensalidade" name="mensalidade" class="form-select">
                            <option value="Pago">Pago</option>
                            <option value="Calote">Calote</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="editPresenca" class="form-label">Presença</label>
                        <input id="editPresenca" name="presenca" class="form-control" type="date">
                    </div>

                    <div class="modal-buttons" style="flex-basis: 100%;">
                        <button type="submit" class="btn btn-success flex-grow-1">Salvar</button>
                        <button type="button" class="btn btn-secondary flex-grow-1" onclick="closeModals()">Cancelar</button>
                    </div>
                </form>
            </div>

            <script>
                // Função para abrir o modal de edição (com overlay)
                function openEditModal(id, nome, gols, assistencias, amarelos, vermelhos, partidas, mensalidade, presenca, pontuacao) {
                    document.getElementById('editForm').action = '/estatisticas/ranking/editar/' + id;
                    document.getElementById('editNome').value = nome;
                    document.getElementById('editGols').value = gols;
                    document.getElementById('editAssistencias').value = assistencias;
                    document.getElementById('editAmarelos').value = amarelos;
                    document.getElementById('editVermelhos').value = vermelhos;
                    document.getElementById('editPartidas').value = partidas;
                    document.getElementById('editMensalidade').value = mensalidade;
                    document.getElementById('editPresenca').value = presenca;
                    document.getElementById('modalOverlay').style.display = 'block';
                    document.getElementById('editModal').style.display = 'block';
                }

                // Função para abrir o modal de novo jogador (com overlay)
                function openNewModal() {
                    document.getElementById('modalOverlay').style.display = 'block';
                    document.getElementById('modal').style.display = 'block';
                }

                // Função para fechar ambos os modais e o overlay
                function closeModals() {
                    document.getElementById('modalOverlay').style.display = 'none';
                    document.getElementById('modal').style.display = 'none';
                    document.getElementById('editModal').style.display = 'none';
                }
            </script>


        </body>
        </html>
        `;

        res.send(html);
    });
});

//salvar registro
app.post('/estatisticas/ranking/novo', (req, res) => {
    const { nome, gols, assistencias, amarelos, vermelhos, mensalidade, presenca, partidas } = req.body;

    const sqlInsert = `
    INSERT INTO ranking (nome, gols, assistencias, amarelos, vermelhos, mensalidade, presenca, partidas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [nome, gols || 0, assistencias || 0, amarelos || 0, vermelhos || 0, mensalidade || 0, presenca, partidas || 0];

    db.query(sqlInsert, values, (err, result) => {
        if (err) throw err;

        const id = result.insertId;
        const sqlUpdatePontuacao = `
      UPDATE ranking
      SET pontuacao = ((gols * 1.5) + (assistencias * 0.8) - (amarelos * 0.8) - (vermelhos * 1.5)) / NULLIF(partidas, 0)
      WHERE id = ?
    `;

        db.query(sqlUpdatePontuacao, [id], (err2) => {
            if (err2) throw err2;
            res.redirect('/estatisticas/ranking');
        });
    });
});

//excluir registro
app.post('/estatisticas/ranking/excluir/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM ranking WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.redirect('/estatisticas/ranking');
    });
});

//editar registro
app.post('/estatisticas/ranking/editar/:id', (req, res) => {
    const id = req.params.id;
    const { nome, gols, assistencias, amarelos, vermelhos, mensalidade, presenca, partidas } = req.body;

    const sqlUpdate = `
    UPDATE ranking
    SET nome = ?, gols = ?, assistencias = ?, amarelos = ?, vermelhos = ?, mensalidade = ?, presenca = ?, partidas = ?
    WHERE id = ?
  `;

    const values = [nome, gols || 0, assistencias || 0, amarelos || 0, vermelhos || 0, mensalidade, presenca, partidas || 0, id];

    db.query(sqlUpdate, values, (err) => {
        if (err) throw err;
        const sqlUpdatePontuacao = `
            UPDATE ranking
            SET pontuacao = ((gols * 1.5) + (assistencias * 0.8) - (amarelos * 0.8) - (vermelhos * 1.5)) / NULLIF(partidas, 0)
            WHERE id = ?
            `;

        db.query(sqlUpdatePontuacao, [id], (err2) => {
            if (err2) throw err2;
            res.redirect('/estatisticas/ranking');
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});