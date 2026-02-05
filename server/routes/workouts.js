// server/routes/chat.js
const express = require('express');
const router = express.Router();
const { Ollama } = require('ollama');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const WorkoutSession = require('../models/WorkoutSession');

// Initialize connection to your local AI
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

// @route   POST api/chat/tip
// @desc    Get a quick tip for the widget (Fixes 404)
router.post('/tip', auth, async (req, res) => {
  try {
    const { page, contextData } = req.body;
    
    // Quick prompt for speed
    const prompt = `
      Provide a single, short (max 15 words) motivating tip for a user on the ${page} page.
      Context: ${JSON.stringify(contextData)}
    `;

    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    });

    res.json({ tip: response.message.content });
  } catch (err) {
    // Silent fail for tips is better than crashing
    console.error("Tip Error:", err.message);
    res.json({ tip: "Stay consistent! 💪" });
  }
});

// @route   POST api/chat
// @desc    Chat with Local Llama 3.1 (Context Aware)
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;

    // 1. GET USER CONTEXT
    const profile = await Profile.findOne({ user: req.user.id });
    const lastWorkout = await WorkoutSession.findOne({ user: req.user.id })
      .sort({ date: -1 })
      .limit(1);

    // 2. CREATE THE PERSONA
    const systemPrompt = `
      You are 'LiftEat Coach', an expert fitness assistant.
      
      USER DETAILS:
      - Name: ${req.user.name || 'Athlete'}
      - Goal: ${profile?.fitness_goal || 'General Fitness'}
      - Experience: ${profile?.experience_level || 'Beginner'}
      - Weight: ${profile?.weight_kg ? profile.weight_kg + 'kg' : 'Unknown'}
      
      LAST WORKOUT:
      ${lastWorkout 
        ? `User did '${lastWorkout.name}' on ${new Date(lastWorkout.date).toDateString()}.` 
        : "User has no recent workout history."}

      RULES:
      1. Keep answers concise (under 4 sentences) unless asked for a plan.
      2. Be motivating but factual.
      3. If the user asks "What should I do today?", suggest a workout based on their goal.
    `;

    console.log("... Asking Llama 3.1 ...");

    // 3. SEND TO LOCAL GPU
    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
    });

    // 4. SEND REPLY TO FRONTEND
    console.log("✅ Llama Replied!");
    res.json({ reply: response.message.content });

  } catch (err) {
    console.error("❌ AI Error:", err.message);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        reply: "⚠️ My brain is asleep! (Please ensure Ollama is running on your PC)." 
      });
    }
    
    res.status(500).send('Server Error');
  }
});

module.exports = router;