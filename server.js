const path = require("path");
const fs = require("fs")

const fastify = require("fastify")({
    logger: false,
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
    reply.view("src/pages/main.html");
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
