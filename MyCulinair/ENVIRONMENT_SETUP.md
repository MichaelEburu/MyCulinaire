# Environment Setup for MyCulinaire

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Server Configuration
PORT=3001
```

## Getting Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in to your account
3. Go to "Developers" > "API keys"
4. Copy your Publishable key and Secret key
5. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

## Getting Your OpenAI Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to "API keys" section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Testing Payments

- Use Stripe test card numbers for testing
- Common test cards:
  - Success: 4242 4242 4242 4242
  - Decline: 4000 0000 0000 0002
  - Requires authentication: 4000 0025 0000 3155
