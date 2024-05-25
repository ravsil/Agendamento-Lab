const path = require("path");
const fs = require("fs")
const sqlite = require("sqlite3");
const fastify = require("fastify")({
    logger: false,
});

const db = new sqlite.Database("agendamento.db", sqlite.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});

fastify.register(require("@fastify/static"), {
    root: path.join(__dirname, "public"),
    prefix: "/",
});

fastify.register(require("@fastify/formbody"));

fastify.register(require("@fastify/view"), {
    engine: {
        handlebars: require("handlebars"),
    },
});

fastify.get("/", function (request, reply) {
    reply.view("src/pages/login.html");
});

fastify.get("/agendamento", function (request, reply) {
    reply.view("src/pages/agend.html");
});

fastify.get("/disponibilidade", function (request, reply) {
    reply.view("src/pages/disp.html");
});

fastify.get("/admin", function (request, reply) {
    reply.view("src/pages/admin.html");
});

fastify.get('/get-computers', async (request, reply) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM Computador', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        reply.send(rows);
    } catch (err) {
        console.error(err);
        reply.status(500).send({ error: 'Database error' });
    }
});

fastify.get('/get-users', async (request, reply) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM Usuario', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        reply.send(rows);
    } catch (err) {
        console.error(err);
        reply.status(500).send({ error: 'Database error' });
    }
});

fastify.post('/get-schedule', async (request, reply) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            const data = request.body;
            const date = data.date
            const pcId = data.pcId
            db.all('SELECT * FROM Agendamento WHERE data = ? AND computador_patrimonio = ?', [date, pcId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        reply.send(rows);
    } catch (err) {
        console.error(err);
        reply.status(500).send({ error: 'Database error' });
    }
});

fastify.post('/add-user', async (request, reply) => {
    const email = request.body.email

    db.all('SELECT email FROM Usuario', (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            for (let i = 0; i < rows.length; i++) {
                if (email == rows[i].email) {
                    return
                }
            }
            db.run("INSERT INTO Usuario(email, ocupacao) VALUES(?,'Aluno')", [email]);
        }
    });
});

fastify.post('/delete-user', async (request, reply) => {
    try {
        const email = request.body.email;
        db.run(`DELETE FROM Usuario WHERE email = ?`, [email], function (err) {
            if (err) {
                console.error('Erro ao deletar usuário:', err);
                reply.status(500).send({ success: false, message: 'Erro ao remover usuário.' });
                return;
            }

            console.log(`Usuário com email ${email} deletado com sucesso.`);
            reply.send({ success: true, message: 'Usuário removido com sucesso.' });
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});


fastify.post('/alter-occupation', async (request, reply) => {
    try {
        const user = request.body;
        db.run(`UPDATE Usuario SET ocupacao = "${user.ocupation}" WHERE email = ?`, [user.email], function (err) {
            if (err) {
                console.error('Erro ao atualizar ocupação:', err);
                reply.status(500).send({ success: false, message: 'Erro ao atualizar ocupação.' });
                return;
            }

            console.log(`Ocupação atualizada para ${user.ocupation} para o usuário com email ${user.email}.`);
            reply.send({ success: true, message: 'Ocupação atualizada com sucesso.' });
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});

fastify.post('/schedule', async (request, reply) => {
    try {
        const data = request.body;
        const email = data.email
        const pcId = data.pcId
        const time = [JSON.parse(data.start), JSON.parse(data.end), data.date]

        db.run(`INSERT INTO Agendamento (email, computador_patrimonio, id_inicio, id_fim, data) VALUES (?,?,?,?,?)`, [email, pcId, time[0], time[1], time[2]], function (err) {
            if (err) {
                console.error('Erro ao agendar:', err);
                reply.status(500).send({ success: false, message: 'Erro ao atualizar ocupação.' });
                return;
            }

            console.log(`Computador ${pcId} agendado para o horario de id ${time[0]} até ${time[1]} no dia ${time[2]} pelo usuário ${email}`);
            reply.send({ success: true, message: `Computador ${pcId} agendado para o horario de id ${time[0]} até ${time[1]} no dia ${time[2]} pelo usuário ${email}` });
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});

fastify.listen(
    { port: process.env.PORT, host: "0.0.0.0" },
    function (err, address) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Your app is listening on ${address}`);
    }
);
