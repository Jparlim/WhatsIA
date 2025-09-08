import { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

interface Data {
  Body: string;
  From: string;
}

interface Mensagem {
  role: "user" | "model";
  text: string;
  hora: Date;
}

const Memoria: { [userId: string]: Mensagem[] } = {};

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function WhatsRoute(request: FastifyRequest, reply: FastifyReply) {
  const { Body, From } = request.body as Data;

  if (!Memoria[From]) {
    Memoria[From] = [];
  }

  Memoria[From].push({
    role: "user",
    text: Body,
    hora: new Date(),
  });

  try {
    const contexto = Memoria[From].slice(-10).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent({
      contents: contexto,
    });

    const respostaTexto = response.response.text();

    Memoria[From].push({
      role: "model",
      text: respostaTexto,
      hora: new Date(),
    });

    reply.header("content-type", "text/xml");
    reply.send(`
      <Response>
        <Message>${respostaTexto}</Message> 
      </Response>
    `);
  } catch (error) {
    console.error(error);
    reply.header("content-type", "text/xml");
    reply.send(`
      <Response>
        <Message>Desculpe, ocorreu um erro ao processar sua mensagem.</Message>
      </Response>
    `);
  }
}
