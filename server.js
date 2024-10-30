const fs = require("fs");
const exec = require("child_process");
const path = require("path");
const sqlite = require("sqlite3");
const fastify = require("fastify")({
    logger: false,
});

// loads the database and the server settings
const db = new sqlite.Database("agendamento.db", sqlite.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});
const settings = JSON.parse(fs.readFileSync("settings.json"));


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

// route to get all the schedules for a specific computer on a specific day
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


// route to send the classes of the day
fastify.get('/get-class', async (request, reply) => {
    const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const date = new Date();
    const dayIndex = date.getDay();
    let day = daysOfWeek[dayIndex];
    if (day == "Domingo" || day == "Sábado") {
        // nothing should be sent on weekends
        return;
    }
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM Aula WHERE dia_semana = ? AND ativo = 1`, [day], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
        console.log(rows)
        reply.send(rows);
    } catch (err) {
        console.error(err);
        reply.status(500).send({ error: 'Database error' });
    }
});

// similar to get-class but you can choose the day
// used to check if the admin user can schedule a class in that day
fastify.post('/get-class-admin', async (request, reply) => {
    try {
        const rows = await new Promise((resolve, reject) => {
            const data = request.body;
            const day = data.day
            db.all(`SELECT * FROM Aula WHERE dia_semana = ?`, [day], (err, rows) => {
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

// route to add a new user to the database
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

// route to remove a user from the database
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

// route to remove a class from the database
fastify.post('/delete-class', async (request, reply) => {
    try {
        const data = request.body;
        const email = data.email
        const start = data.id_inicio
        const end = data.id_fim
        const day = data.dia_semana
        db.run(`DELETE FROM Aula WHERE email = ? AND id_inicio = ? AND id_fim = ? AND dia_semana = ?`, [email, start, end, day], function (err) {
            if (err) {
                console.error('Erro ao deletar Aula:', err);
                reply.status(500).send({ success: false, message: 'Erro ao remover Aula.' });
                return;
            }

            console.log(`Aula deletada com sucesso.`);
            reply.send({ success: true, message: 'Aula removida com sucesso.' });
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});

// route to activate or deactivate a class
fastify.post('/alter-class', async (request, reply) => {
    try {
        const data = request.body;
        const email = data.email
        const start = data.id_inicio
        const end = data.id_fim
        const day = data.dia_semana
        const active = data.ativo
        db.run(`UPDATE Aula SET ativo = ? WHERE email = ? AND id_inicio = ? AND id_fim = ? AND dia_semana = ?`, [active, email, start, end, day], function (err) {
            if (err) {
                console.error('Erro ao alterar Aula:', err);
                reply.status(500).send({ success: false, message: 'Erro ao alterar Aula.' });
                return;
            }

            console.log(`Aula alterada com sucesso.`);
            reply.send({ success: true, message: 'Aula alterada com sucesso.' });
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});

// route to promote an user to admin or demote an admin to user
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

// route to an user schedule a computer
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

// route to an admin schedule a class
// classes are recurrent, if a class is scheduled for a day, it will be scheduled for every week
fastify.post('/schedule-class', async (request, reply) => {
    try {
        const data = request.body;
        const email = data.email
        const time = [JSON.parse(data.start), JSON.parse(data.end), data.date]
        const desc = data.description
        let days = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];
        // check if the day the class was scheduled is valid
        let ok = false;
        for (let i = 0; i < 5; i++) {
            if (data.date == days[i]) {
                ok = true;
            }
        }
        if (!ok) {
            throw "Value Error";
        }
        console.log(email, time)
        db.run(`INSERT INTO Aula (email, id_inicio, id_fim, dia_semana, descricao, ativo) VALUES (?,?,?,?,?,?)`, [email, time[0], time[1], time[2], desc, 1], function (err) {
            if (err) {
                console.error('Erro ao agendar:', err);
                reply.status(500).send({ success: false, message: 'Erro ao atualizar ocupação.' });
                return;
            }

            console.log(`Aula agendada para o horario de id ${time[0]} até ${time[1]} no dia ${time[2]} pelo usuário ${email}`);
            reply.send({ success: true, message: `Aula agendada para o horario de id ${time[0]} até ${time[1]} no dia ${time[2]} pelo usuário ${email}` });
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});

// route to update the website's contents
fastify.post('/update', async (request, reply) => {
    try {
        if (request.body.password == settings.password) {
            exec.exec("git pull", (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
            });
            reply.send({ success: true, message: 'Atualização realizada com sucesso.' });
        } else {
            reply.send({ success: false, message: 'Senha incorreta.' });
        }
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        reply.status(500).send({ success: false, message: 'Erro ao processar requisição.' });
    }
});

fastify.listen(
    { port: settings.port, host: settings.ip },
    function (err, address) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Your app is listening on ${address}`);
    }
);
