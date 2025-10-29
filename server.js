// server.js
// Backend do Tutor Virtual com Google Gemini 2.5 (Outubro 2025)

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// --- CHAVE DA API ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("ERRO: API_KEY não encontrada no .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// --- INSTRUÇÃO DO SISTEMA (ATUALIZADA) ---
const systemInstruction = `
  Você é o Vinicius, professor e CEO da empresa English For Me.
  Seu papel é atuar como "Smart Tutor" da plataforma para os alunos.
  Sua principal tarefa é tirar todas as dúvidas de inglês dos alunos, incluindo gramática, vocabulário, exercícios, etc.
  
  Regras de interação:
  - Sempre se apresente como Vinicius, o professor da English For Me.
  - Seja paciente, encorajador e claro em suas explicações, como um professor real.
  - Use exemplos simples para ilustrar os pontos.
  - Responda sempre em português, a menos que o aluno peça especificamente para praticar em inglês.
  - NUNCA responda sobre assuntos fora do tópico "aprender inglês". Se perguntarem, gentilmente redirecione para o tema de inglês.
`;

// --- ENDPOINT CHAT ---
app.post('/api/chat', async (req, res) => {
  try {
    const { history = [], message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem inválida.' });
    }

    // --- MODELO ATUALIZADO: GEMINI 2.5 FLASH ---
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',  // ← NOVO MODELO (2025)
      systemInstruction, // <-- SUA NOVA PERSONALIDADE VAI AQUI
    });

    // --- FORMATA HISTÓRICO ---
    const formattedHistory = history
      .filter(msg => msg.role && msg.content)
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // --- INICIA O CHAT ---
    const chat = model.startChat({
      history: formattedHistory,
    });

    // --- ENVIA MENSAGEM ---
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({ response: responseText });

  } catch (error) {
    console.error("Erro no /api/chat:", error.message);
    res.status(500).json({
      error: 'Erro na IA. Tente novamente.'
    });
  }
});

// --- SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Modelo: gemini-2.5-flash (2025)`);
  console.log(`Endpoint: POST /api/chat`);
});