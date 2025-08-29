const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (only if API key is provided)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
} else {
    console.log('Warning: OPENAI_API_KEY not found. AI chat features will be disabled.');
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, pantryIngredients } = req.body;

        if (!openai) {
            return res.status(503).json({ 
                error: 'AI service is not available. Please set up your OpenAI API key in the .env file.',
                message: 'I apologize, but the AI cooking assistant is currently unavailable. Please check your API configuration.'
            });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful cooking assistant. You can help with:
                    - Recipe suggestions based on available ingredients
                    - Cooking techniques and tips
                    - Ingredient substitutions
                    - Meal planning
                    - Food safety and storage
                    - Nutrition advice
                    
                    The user's current pantry ingredients are: ${pantryIngredients.join(', ')}`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        res.json({ message: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

// Serve static files (frontend)
app.use(express.static('public'));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 