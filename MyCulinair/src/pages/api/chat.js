import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant. You can help with recipes, cooking techniques, ingredient substitutions, and general cooking advice. Be friendly and informative in your responses."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.data.choices[0].message.content;
    res.status(200).json({ message: response });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ message: 'Error processing your request' });
  }
} 