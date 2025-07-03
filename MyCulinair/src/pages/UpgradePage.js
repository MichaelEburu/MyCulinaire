import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Check, Star } from 'lucide-react';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      
      // Call your backend to create a Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_H5ggYwtDq4fbrJ', // Your Stripe price ID
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const premiumFeatures = [
    'Access to premium recipes',
    'Unlimited AI cooking assistant usage',
    'Advanced recipe filtering',
    'Priority support',
    'Ad-free experience',
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Upgrade to Premium</h1>

      <div className="max-w-2xl mx-auto">
        {/* Premium Card */}
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-primary-100 rounded-full mb-4">
              <Star size={32} className="text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-primary-900">Premium Plan</h2>
            <p className="text-primary-600 mt-2">$3/month</p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <Check size={16} className="text-primary-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full btn btn-primary flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </button>

          {/* Terms */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Cancel anytime. No commitment required.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="card">
              <h4 className="font-medium mb-2">What's included in the premium plan?</h4>
              <p className="text-gray-600">
                Premium subscribers get access to exclusive recipes, unlimited AI cooking assistant usage,
                advanced filtering options, priority support, and an ad-free experience.
              </p>
            </div>
            <div className="card">
              <h4 className="font-medium mb-2">How do I cancel my subscription?</h4>
              <p className="text-gray-600">
                You can cancel your subscription at any time from your account settings.
                Your premium features will remain active until the end of your billing period.
              </p>
            </div>
            <div className="card">
              <h4 className="font-medium mb-2">Is my payment information secure?</h4>
              <p className="text-gray-600">
                Yes, we use Stripe for secure payment processing. Your payment information
                is encrypted and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpgradePage; 