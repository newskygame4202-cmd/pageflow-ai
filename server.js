require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.set('trust proxy', 1); // FIXED: Required for Vercel rate limiting to work
app.use(express.json());
app.use(express.static('.')); 

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { error: 'Session expired or too many requests.' }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
