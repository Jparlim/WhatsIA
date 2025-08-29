import { FastifyInstance } from "fastify";
import axios from "axios";
import qs from "qs"


export default async function whatsappRoutes(fastify: FastifyInstance) {
  fastify.post("/webhook", async (request, reply) => {
    const body = request.body as any;
    const message = body?.Body;   // texto que o usuário mandou
    const from = body?.From;      // número do usuário

    console.log("📩 Mensagem recebida:", message);

    // === Chamada para Gemini ===
    let iaReply = "Desculpe, não consegui gerar resposta.";
    try {
      const geminiRes = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: message }]
            }
          ]
        }
      );

      iaReply =
        geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Não entendi sua pergunta.";
    } catch (error) {
      console.error("Erro ao chamar Gemini:", error);
    }

    // === Enviar resposta via Twilio ===
    const twilioData = qs.stringify({
      To: from,
      From: process.env.TWILIO_WHATSAPP_NUMBER,
      Body: iaReply
    });

    try {
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        twilioData,
        {
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID!,
            password: process.env.TWILIO_AUTH_TOKEN!
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
      );
    } catch (error) {
      console.error("Erro ao enviar mensagem via Twilio:", error);
    }

    reply.send("OK");
  });
}