require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(express.static('.')); 

// Security: Block users who spam the server or stay too long
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 requests per window
  message: { error: 'Session expired or too many requests. Please take a break and try again later.' }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Apply the security limit only to the AI endpoint
app.post('/api/draft', apiLimiter, async (req, res) => {
  try {
    const { notes } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a professional book editor. Turn these messy notes into a well-structured, cohesive book chapter paragraph. Maintain a professional tone. Notes: ${notes}`;
    
    const result = await model.generateContent(prompt);
    res.json({ draft: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Server load is high. Please try again.' });
  }
});

module.exports = app;