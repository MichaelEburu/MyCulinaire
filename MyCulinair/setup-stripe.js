#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 MyCulinaire Stripe Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    let envContent = `# MyCulinaire Environment Variables

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration (required for payments)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Server Configuration
PORT=3001
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
} else {
    console.log('✅ .env file already exists');
}

console.log('\n🔑 Next Steps:');
console.log('1. Go to https://dashboard.stripe.com/');
console.log('2. Sign up or log in to your Stripe account');
console.log('3. Go to "Developers" > "API keys"');
console.log('4. Copy your "Publishable key" and "Secret key"');
console.log('5. Replace the placeholder values in your .env file:');
console.log('   - STRIPE_PUBLISHABLE_KEY=pk_test_...');
console.log('   - STRIPE_SECRET_KEY=sk_test_...');
console.log('6. Restart your server: pkill -f "node server.js" && node server.js &');

console.log('\n🧪 Test Cards:');
console.log('• Success: 4242 4242 4242 4242');
console.log('• Decline: 4000 0000 0000 0002');
console.log('• Requires Auth: 4000 0025 0000 3155');

console.log('\n📱 Test Your Subscription:');
console.log('• Visit: http://localhost:3001/subscription.html');
console.log('• Click any "Subscribe" button');
console.log('• Use test card numbers above');

console.log('\n🎉 You\'re all set! Your subscription system will redirect to Stripe checkout.');
