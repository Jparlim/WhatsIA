import { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClientList } from "../clientList";

dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

export async function WhatsRoute(request: FastifyRequest, reply: FastifyReply) {
  const { Body, From } = request.body as Data;

  if (!Memoria[From]) {
    Memoria[From] = [];
  }

  Memoria[From].push({
    role: "user",
    text: `Você é uma atendente virtual da empresa Joao Moreira Pintura e Reparo, voce deve responder sempre de forma educada e profissional, 
    ajudando o cliente com informações sobre o serviço e duvidas. caso não saiba algo, diga que vai encaminhar para um atendente humano. não faça textos muito grandes e nem muitas perguntas em uma mensagem só!
    , de alguma forma você vai ter que saber o nome dele e o serviço desejado! quero que você salve o nome e o serviço desejado apenas em formato JSON igual o exemplo:
    {
      "client": "...",
      "serviço": "...",
    }`,
    hora: new Date(),
  })

  Memoria[From].push({
    role: "user",
    text: Body,
    hora: new Date(),
  }, );

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

    if(response.response.candidates) {
      const ParseJson = response.response.candidates[0].content.parts[0].text ?? "{}"

      // ClientList({
      //   client: ,
      //   numero: From,
      //   serviço: ,
      //   data: new Date()
      // })
    }

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
