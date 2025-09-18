# MyCulinairee Subscription Setup

## 🎉 What's Been Added

I've created a complete subscription system for your MyCulinairee app using Stripe's best practices:

### Files Created:
- `public/subscription.html` - Beautiful subscription page with 3 plans
- `public/subscription-success.html` - Success page after subscription
- `public/subscription-canceled.html` - Canceled subscription page
- Updated `server.js` - Added subscription checkout endpoint
- Updated `index.html` - Added "Upgrade to Premium" link in profile menu

### Features:
✅ **3 Subscription Plans**: Starter ($20), Pro ($49), Premium ($99)
✅ **Beautiful UI**: Matches your app's design with glassmorphism effects
✅ **Stripe Integration**: Secure payment processing
✅ **Success/Cancel Pages**: Professional user experience
✅ **Mobile Responsive**: Works on all devices
✅ **Graceful Fallback**: Works even without Stripe keys (demo mode)

## 🚀 How to Test

### 1. View the Subscription Page
- Open: http://localhost:3001/subscription.html
- You'll see 3 beautiful plan cards
- Click any "Subscribe" button to test

### 2. Test Without Stripe Keys (Demo Mode)
- The subscription page will work but show an error when trying to subscribe
- This is expected behavior when Stripe isn't configured

### 3. Test With Stripe Keys (Production Mode)
- Add your Stripe keys to `.env` file:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```
- Restart the server: `pkill -f "node server.js" && node server.js &`
- Now subscriptions will work with real Stripe checkout

## 🎨 Customization

### Change Plan Prices
Edit the `priceMap` in `server.js`:
```javascript
const priceMap = {
    'starter': { amount: 2000, name: 'Starter Plan' },    // $20.00
    'pro': { amount: 4900, name: 'Pro Plan' },            // $49.00
    'premium': { amount: 9900, name: 'Premium Plan' }     // $99.00
};
```

### Change Plan Features
Edit the `plans` object in `subscription.html`:
```javascript
const plans = {
    starter: {
        name: 'Starter Plan',
        price: 20,
        interval: 'month',
        features: [
            'Unlimited recipe searches',
            'AI cooking assistant',
            // Add more features here
        ]
    }
};
```

### Styling
All styles are in the `<style>` section of each HTML file. You can:
- Change colors to match your brand
- Modify the layout
- Add animations
- Customize the design

## 🔧 Integration with Main App

### Access from Profile Menu
- Users can click "Upgrade to Premium" in the profile dropdown
- This takes them to the subscription page

### Add to Navigation
You can add a subscription link anywhere in your app:
```html
<a href="subscription.html" class="btn-primary">
    <i class="fas fa-crown"></i> Upgrade to Premium
</a>
```

## 🧪 Testing with Stripe

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Details
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any valid ZIP code (e.g., 12345)

## 📱 Mobile Experience

The subscription pages are fully responsive:
- Cards stack vertically on mobile
- Buttons are full-width on small screens
- Touch-friendly interface
- Optimized for all screen sizes

## 🎯 Next Steps

1. **Test the subscription page**: Visit http://localhost:3001/subscription.html
2. **Set up Stripe account**: Get your API keys from Stripe Dashboard
3. **Add keys to .env**: Configure your Stripe keys
4. **Test real payments**: Use Stripe test cards
5. **Customize the design**: Match your brand colors and styling
6. **Deploy to production**: Use live Stripe keys for real payments

## 🆘 Troubleshooting

### Server won't start
- Make sure port 3001 is free: `lsof -i :3001`
- Kill existing processes: `pkill -f "node server.js"`

### Subscription page shows errors
- Check browser console for errors
- Ensure server is running on port 3001
- Verify all files are in the correct locations

### Stripe integration not working
- Check your API keys in `.env` file
- Restart server after adding keys
- Use test keys for testing

Your MyCulinairee app now has a complete, professional subscription system! 🎉
