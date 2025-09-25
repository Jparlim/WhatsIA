import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { FastifyReply, FastifyRequest } from "fastify";
import { ClientList } from "../clientList/index";

dotenv.config();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

interface teste {
    role: "user" | "model",
    text: string,
}

interface memoryType {
    [userId: string]: teste[]
}

const Memory: memoryType = {}

export function WhatsTeste(request:FastifyRequest, reply: FastifyReply) {    
    const Teste = async () => {
        const { Body, From } = request.body as { Body: string, From: string}
      
        if(!Memory[From]) {
            Memory[From] = []
        }

        Memory[From].push({
            role: "user",
            text: Body,
        })

        const textIA = Memory[From].slice(-10).map(m => ({
            role: m.role,
            parts: [{ text: m.text}]
        }))

        // const response = await ai.models.generateContent({
        // model: "gemini-2.5-flash",
        // contents: textIA,
        // config: {
        //     systemInstruction: `você é uma atendente da empresa Joao Moreira pintura e reparos, seu dever é receber o cliente da melhor maneira,
        //    respondendo suas duvidas, passando valores e falando sobre nosso serviços e não faça frases muito grandes e nem muitas perguntas de uma vez.
        //     Converse de forma natural com o cliente para coletar informações sobre:
        //     - Nome
        //     - Serviço de interesse
        //     - Localização

        //     IMPORTANTE: 
        //     Sempre responda em duas partes e em json:
        //     1. A resposta natural para o cliente.
        //     2. Um bloco JSON chamado "dados_cliente" com os dados coletados até agora, mesmo que incompletos.]
        //     sendo a resposta no final saindo desta forma:
        //     {
        //         "resposta": "...",
        //         "dataClient": {
        //             "nome": "...",
        //             "serviço": "...",
        //             "local": "...",
        //         }
        //     }`
        // },
        // });

        // let dataClient;
        // try {
        //     const msgModel = response.candidates?.[0]?.content?.parts?.[0].text ?? "";
            
        //     const match = msgModel.match(/\{[\s\S]*\}/);
        //     if(match) {
        //         dataClient = JSON.parse(match[0]);
        //         // Memory[From].push({
        //         //     role: "model",
        //         //     text: match,
        //         // })
        //         return reply.send(dataClient.dataClient)
        //     }
        // } catch(error) {
        //     console.log(error)
        // }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: textIA,
            config: {
            responseMimeType: "application/json",
            systemInstruction: `você é uma atendente da empresa joao moreira pinturas e reparos, seu dever é atender o cliente da melhor forma,
                converse com eles da melhor forma, sem texto muito grande, poucas perguntas e ao longo da conversa, tente saber o nome dele, serviço desejado, `,
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        resposta: {type: Type.STRING},
                        dataClient: {
                            type: Type.OBJECT,
                            properties: {
                                client: {type: Type.STRING},
                                service: {type: Type.STRING},
                                tinta: {type: Type.STRING},
                                local: {type: Type.STRING},
                            }
                        },
                    },
                    propertyOrdering: ["resposta", "dataClient"],
                },
            },
            },
        })

        const data = response.candidates?.[0]?.content?.parts?.[0].text ?? ""

        interface dataInterface {
            resposta: string,
            dataClient: object,
        }

        try {
            if(response.text) {
                const txt = JSON.parse(data);
    
                const withRole = txt.map((item:dataInterface) => ({
                    role: "model",
                    text: item.resposta
                }))

                Memory[From].push(withRole[0])
                
                reply.send(withRole[0].text)
                ClientList(txt[0].dataClient)
            }
        } catch( error ) {
            reply.send(error)
        }
    }

    Teste();
}