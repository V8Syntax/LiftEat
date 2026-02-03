const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatMessage = require('../models/ChatMessage');
const auth = require('../middleware/auth'); // You'll need a simple JWT middleware

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', auth, async (req, res) => {
  try {
    const { message, profile } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Construct System Prompt (Ported from your edge function)
    let systemPrompt = `You are an expert fitness coach called GymFlow AI. 
    Profile: ${profile ? JSON.stringify(profile) : 'Not specified'}.
    Provide concise, action-oriented advice backed by fitness science.`;

    // 2. Start Chat History (Load last few messages for context if needed)
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am ready to assist with fitness goals." }] }
      ],
    });

    // 3. Save User Message
    await ChatMessage.create({ user: req.user.id, role: 'user', content: message });

    // 4. Generate Response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // 5. Save Assistant Message
    await ChatMessage.create({ user: req.user.id, role: 'assistant', content: text });

    res.json({ content: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI Error' });
  }
});

// Get History
router.get('/history', auth, async (req, res) => {
  const messages = await ChatMessage.find({ user: req.user.id }).sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;