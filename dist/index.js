"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const App = (0, fastify_1.default)();
App.register(cors_1.default, { origin: "*" });
App.register(whatsapp_1.default);
App.listen({ port: 3000 }, () => console.log("servidor filhadaputamente rodando!"));
