const path = require("path");
const fs = require("fs")

const fastify = require("fastify")({
    logger: false,
});

const db = new sqlite3.Database("agendamento.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("Connected to the database.");
});
db.run("CREATE TABLE Ocupacoes(id_ocupacao INT AUTO_INCREMENT PRIMARY KEY,ocupacao VARCHAR(20) NOT NULL)");
db.run("CREATE TABLE Usuario (email VARCHAR(255) NOT NULL PRIMARY KEY,id_ocupacao INT NOT NULL,FOREIGN KEY (id_ocupacao) REFERENCES Ocupacoes(id_ocupacao)");

async function updateData(){
    let agendamentos = await fs.promises.readFile('data.json', 'utf8');
    agendamentos = JSON.parse(agendamentos)
    let hora = new Date().getHours() - 3 // gmt-3
    let minuto = new Date().getMinutes()
    for (let i = 0; i < 24; i++) {
        if (agendamentos[i].horarios.length == 0) continue;
  
        for (let j = 0; j < agendamentos[i].horarios.length; j++) {
            let horario_inicio = agendamentos[i].horarios[j].split("-")[0].split("h");
            let horario_final = agendamentos[i].horarios[j].split("-")[1].split("h");
            // nao começou
            if ((horario_inicio[0] > hora) || (horario_inicio[0] == hora && horario_inicio[1] > minuto)) {
                continue;
            }
            // ja passou
            if ((hora > horario_final[0]) || (horario_final[0] == hora && minuto > horario_final[1]) || (horario_final[0] == 25)) {
                agendamentos[i].horarios.splice(agendamentos[i].horarios.indexOf(agendamentos[i].horarios[j]), 1);
                agendamentos[i].users.splice(agendamentos[i].users.indexOf(agendamentos[i].users[j]), 1);
                j--;
            }
        }
    }
    await fs.promises.writeFile('data.json', JSON.stringify(agendamentos));
}


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
    reply.view("src/pages/main.html");
    updateData();
});

fastify.get('/get-file', async (request, reply) => {
    try {
        // Read the file from the disk
        const fileData = await fs.promises.readFile('data.json', 'utf8');

        // Return the file data as a JSON object
        return JSON.parse(fileData);
    } catch (error) {
        console.error('Error reading file:', error);
        reply.status(500).send({ success: false, message: 'Failed to read file' });
    }
});

fastify.post('/save-file', async (request, reply) => {
    try {
        // Assuming you're receiving the file in the request body
        const fileData = request.body.body;

        // You can then write the file to the disk
        await fs.promises.writeFile('data.json', fileData);

        return { success: true, message: 'File saved successfully' };
    } catch (error) {
        console.error('Error saving file:', error);
        reply.status(500).send({ success: false, message: 'Failed to save file' });
    }
});

//setInterval(updateData, 10 * 60 * 1000);
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

