const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here') {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI (only if API key is provided)
let openai = null;
console.log('Environment check:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 20) + '...' : 'undefined');

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI initialized successfully!');
} else {
    console.log('❌ Warning: OPENAI_API_KEY not found. AI chat features will be disabled.');
}

// Initialize Stripe (only if API key is provided)
if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here') {
    console.log('Warning: STRIPE_SECRET_KEY not found. Payment features will be disabled.');
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
                    content: `You are an enthusiastic, knowledgeable, and helpful AI cooking assistant. You are passionate about food and love helping people cook amazing meals. 

                    You can help with:
                    - Recipe suggestions and creation based on available ingredients
                    - Cooking techniques, methods, and professional tips
                    - Ingredient substitutions and alternatives
                    - Meal planning and prep strategies
                    - Food safety, storage, and preservation
                    - Nutrition advice and dietary considerations
                    - Kitchen equipment recommendations
                    - Troubleshooting cooking problems
                    - General cooking questions and education
                    
                    Always be encouraging, detailed, and practical in your responses. Provide step-by-step instructions when helpful. Be creative with recipe suggestions and don't be afraid to suggest variations or improvements.
                    
                    The user's current pantry ingredients are: ${pantryIngredients.join(', ')}
                    
                    Respond naturally and conversationally, as if you're a friendly cooking expert helping a friend in the kitchen.`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.8,
            max_tokens: 800
        });

        res.json({ message: completion.choices[0].message.content });
    } catch (error) {
        console.error('AI Chat Error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            openaiAvailable: !!openai
        });
        
        // Return a helpful fallback response instead of just an error
        res.json({ 
            message: "I'm having trouble connecting to my AI brain right now, but I can still help! Here are some cooking tips: Always taste as you go, prep your ingredients before starting, and don't be afraid to experiment. What would you like to cook today?"
        });
    }
});

// Stripe Payment Endpoints

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { items, currency = 'usd' } = req.body;
        
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here') {
            return res.status(503).json({ 
                error: 'Stripe not configured',
                message: 'Payment processing is not available. Please configure your Stripe API keys.'
            });
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity * 100); // Convert to cents
        }, 0);

        if (totalAmount < 50) { // Minimum $0.50
            return res.status(400).json({ 
                error: 'Amount too low',
                message: 'Minimum order amount is $0.50'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: currency,
            metadata: {
                items: JSON.stringify(items),
                orderId: `order_${Date.now()}`
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: totalAmount,
            currency: currency
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Confirm payment
app.post('/api/confirm-payment', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your_stripe_secret_key_here') {
            return res.status(503).json({ 
                error: 'Stripe not configured',
                message: 'Payment processing is not available.'
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        res.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

// Get Stripe publishable key
app.get('/api/stripe-key', (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey || publishableKey === 'your_stripe_publishable_key_here') {
        return res.status(503).json({ 
            error: 'Stripe not configured',
            message: 'Payment processing is not available.'
        });
    }
    
    res.json({ publishableKey });
});

// Create checkout session for subscriptions
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, mode = 'subscription' } = req.body;
        
        if (!stripe) {
            return res.status(503).json({ 
                error: 'Stripe not configured',
                message: 'Subscription processing is not available.'
            });
        }

        // Updated price mapping - much more affordable!
        const priceMap = {
            'free': { amount: 0, name: 'Free Plan' },
            'pro': { amount: 900, name: 'Pro Plan' },      // $9.00
            'premium': { amount: 1900, name: 'Premium Plan' } // $19.00
        };

        const price = priceMap[priceId];
        if (!price) {
            return res.status(400).json({ error: 'Invalid price ID' });
        }

        // Handle free plan - no payment needed
        if (priceId === 'free') {
            return res.json({ 
                url: `${req.headers.origin}/subscription-success?plan=free`,
                message: 'Free plan activated!'
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: price.name,
                        },
                        unit_amount: price.amount,
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/subscription-canceled`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Serve static files (frontend)
app.use(express.static('public'));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access from your phone: http://192.168.100.78:${port}`);
}); 