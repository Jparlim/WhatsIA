"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = whatsappRoutes;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
async function whatsappRoutes(fastify) {
    fastify.post("/webhook", async (request, reply) => {
        const body = request.body;
        const message = body?.Body; // texto que o usuário mandou
        const from = body?.From; // número do usuário
        console.log("📩 Mensagem recebida:", message);
        // === Chamada para Gemini ===
        let iaReply = "Desculpe, não consegui gerar resposta.";
        try {
            const geminiRes = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                contents: [
                    {
                        parts: [{ text: message }]
                    }
                ]
            });
            iaReply =
                geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "Não entendi sua pergunta.";
        }
        catch (error) {
            console.error("Erro ao chamar Gemini:", error);
        }
        // === Enviar resposta via Twilio ===
        const twilioData = qs_1.default.stringify({
            To: from,
            From: process.env.TWILIO_WHATSAPP_NUMBER,
            Body: iaReply
        });
        try {
            await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, twilioData, {
                auth: {
                    username: process.env.TWILIO_ACCOUNT_SID,
                    password: process.env.TWILIO_AUTH_TOKEN
                },
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });
        }
        catch (error) {
            console.error("Erro ao enviar mensagem via Twilio:", error);
        }
        reply.send("OK");
    });
}
