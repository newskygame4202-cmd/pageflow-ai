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
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Calling ModelService.ListModels as requested by the error
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to fetch models');
    }

    // Format the list of available models and send it to the dashboard
    const modelNames = data.models.map(m => m.name).join('\n');
    res.json({ draft: `AVAILABLE MODELS FOR YOUR API KEY:\n\n${modelNames}` });
    
  } catch (error) {
    res.status(500).json({ error: `API Error: ${error.message}` });
  }
});

module.exports = app;
