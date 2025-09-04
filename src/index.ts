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
const port = Number(process.env.PORT) || 3000;

App.listen({ port, host: "0.0.0.0" })
  .then(() => {
    console.log(`🚀 Server rodando na porta ${port}`);
  })
  .catch((err) => {
    App.log.error(err);
    process.exit(1);
  });