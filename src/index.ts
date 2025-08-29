import fastify from "fastify";
import cors from "@fastify/cors"
import whatsappRoutes from "./routes/whatsapp";

const App = fastify();

App.register(cors, { origin: "*"})
App.register(whatsappRoutes);

App.listen({port:3000}, () => console.log("servidor filhadaputamente rodando!"))