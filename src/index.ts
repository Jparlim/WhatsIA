import fastify from "fastify";
import cors from "@fastify/cors"
import { WhatsRoute } from "./routes/whatsapp";

const App = fastify({logger:true});
App.register(import("@fastify/formbody"))
App.register(cors, { origin: "*"})


App.post('/whatsapp', WhatsRoute)


const port = Number(process.env.PORT) || 3000;

App.listen({ port, host: "0.0.0.0" })
  .then(() => {
    console.log(`🚀 Server rodando na porta ${port}`);
  })
  .catch((err) => {
    App.log.error(err);
    process.exit(1);
  });