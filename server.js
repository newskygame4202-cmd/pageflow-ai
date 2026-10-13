require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1); 
app.use(express.json());
app.use(express.static('.')); 

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { error: 'Session expired or too many requests.' }
});

app.post('/api/draft', apiLimiter, async (req, res) => {
  try {
    const { notes } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Using the exact model name found in your API key's allowed list
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a professional book editor. Turn these messy notes into a well-structured, cohesive book chapter paragraph. Maintain a professional tone. Notes: ${notes}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    const draft = data.candidates[0].content.parts[0].text;
    res.json({ draft: draft });
    
  } catch (error) {
    res.status(500).json({ error: `API Error: ${error.message}` });
  }
});

module.exports = app;
