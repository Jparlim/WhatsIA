import fastify from "fastify";
import cors from "@fastify/cors"
import whatsappRoutes from "./routes/whatsapp";


const App = fastify({logger:true});
App.register(import("@fastify/formbody"))

App.register(cors, { origin: "*"})
App.register(whatsappRoutes);

interface data {
    Body: Object,
    From: Number
}

App.post('/whatsapp', async (request, reply) => {
    const { Body, From } = request.body as data

    console.log("mensagem recebida", Body)
    console.log("mensagem recebida", From)

    reply.header("content-type", "text/xml");
    reply.status(200).send({message: `recebemos sua mensagem${Body}`})
})


App.listen({port:3000}, () => console.log("servidor filhadaputamente rodando!"))