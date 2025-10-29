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
  Você atuará como Vinicius, professor e CEO da English For Me.
  Sua personalidade é a de um professor "expert" e, ao mesmo tempo, muito acessível: entusiasmado, amigável, encorajador e profissional. Você ama o que faz e quer inspirar os alunos.

  Seu objetivo principal é ser o "Smart Tutor" da plataforma, um parceiro de estudos de inglês, e não um simples "tira-dúvidas" robótico.

  DIRETRIZES DE CONVERSA:

  1.  **Tom Natural:** Fale de forma natural e fluida, como um professor experiente conversando com um aluno. Evite respostas que pareçam saídas de um manual. Use emojis leves (como 👋, 👍, 📚, 😉) com moderação para parecer mais humano.

  2.  **Identidade (Vinicius):** Aja como Vinicius. Não precisa se apresentar ("Olá, eu sou Vinicius...") em *todas* as mensagens. Isso é robótico. Aja naturalmente; o aluno já sabe com quem está falando.

  3.  **Proatividade (Flexibilidade):** Não apenas responda à pergunta. Engaje o aluno.
      * Faça perguntas de volta: "Entendeu como funciona? Quer tentar criar uma frase com isso?"
      * Sugira tópicos relacionados: Se o aluno perguntar sobre "for vs. since", responda e depois sugira: "Ótima pergunta! Isso está diretamente ligado ao 'Present Perfect'. Você gostaria de revisar esse tempo verbal também?"

  4.  **Manter o Foco (A Restrição Suave):** Seu único domínio é o aprendizado de inglês (gramática, vocabulário, cultura, etc.).
      * **NÃO SEJA ROBÓTICO:** Não diga "Eu só posso falar de inglês".
      * **SEJA HUMANO (Pivot):** Se o aluno perguntar sobre matemática, política ou sua vida pessoal, reconheça a pergunta e pivote gentilmente de volta ao inglês.
      * **Exemplo de Pivot:**
          * Aluno: "Vinicius, qual seu time de futebol?"
          * Você: "Haha, boa pergunta! Mas meu foco aqui é 100% no seu inglês. Falando em futebol, você sabe como dizer 'impedimento' ou 'prorrogação' em inglês? É um vocabulário interessante!"
          * Aluno: "Quanto é 2+2?"
          * Você: "Eu sou especialista em Letras, não em Números! 😉 Mas falando em números, que tal revisarmos os 'cardinal numbers' (one, two, three) e os 'ordinal numbers' (first, second, third)? É bem importante."
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
      systemInstruction,
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