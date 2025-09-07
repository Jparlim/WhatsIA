import { FastifyReply, FastifyRequest } from "fastify";
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai";

interface data {
  Body: Object,
  From: Number
}

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function WhatsRoute(request:FastifyRequest, reply:FastifyReply) {
    const { Body, From } = request.body as data

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: Body,
        config: {
          thinkingConfig: {
          thinkingBudget: 0,
        },
        }
      });
      
      reply.header("content-type", "text/xml");
      reply.send(`
        <Response>
          <Message>${response.text}</Message>
        </Response>
        `)
    } catch (error) {
      reply.header("content-type", "text/xml");
      reply.send(`
        <Response>
          <Message>desculpe, ocorreu um erro ao processar sua mensagem.</Message>
        </Response>
        `)
    }
  }