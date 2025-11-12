import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize the Gemini client
const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Retry helper
async function sendWithRetry(prompt, maxRetries = 3, delay = 1000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const resp = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
      });

      // Correct way to extract text from the new SDK
      const botText = resp.candidates?.[0]?.content;
      if (!botText) throw new Error('No content returned by Gemini');

      return botText;
    } catch (err) {
      attempt++;
      console.warn(`⚠️ Gemini attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxRetries) throw err;
      await new Promise(r => setTimeout(r, delay * attempt));
    }
  }
}

// API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    let { chatHistory, location } = req.body;

    const userMessage = chatHistory[chatHistory.length - 1]?.parts?.[0]?.text || '';
    let augmentedMessage = userMessage;

    if (location?.lat && location?.lon) {
      augmentedMessage += ` (User is near latitude: ${location.lat}, longitude: ${location.lon}. Suggest travel ideas nearby.)`;
    }

    console.log('Augmented message:', augmentedMessage);

    const botText = await sendWithRetry(augmentedMessage);

    res.json({ botText, sources: [] });
  } catch (error) {
    console.error('❌ Error processing chat:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});