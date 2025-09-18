// Stripe Payment Integration for MyCulinairee
class StripePaymentManager {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.paymentElement = null;
        this.clientSecret = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Get Stripe publishable key
            const response = await fetch('/api/stripe-key');
            const data = await response.json();
            
            if (!data.publishableKey) {
                console.warn('Stripe not configured. Payment features will be disabled.');
                return;
            }

            // Load Stripe.js
            if (!window.Stripe) {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.onload = () => this.initializeStripe(data.publishableKey);
                document.head.appendChild(script);
            } else {
                this.initializeStripe(data.publishableKey);
            }
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
        }
    }

    initializeStripe(publishableKey) {
        this.stripe = Stripe(publishableKey);
        this.isInitialized = true;
        console.log('Stripe initialized successfully');
    }

    async createPaymentIntent(items) {
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create payment intent');
            }

            return data;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    async setupPaymentForm(containerId, items) {
        if (!this.isInitialized) {
            throw new Error('Stripe not initialized');
        }

        try {
            // Create payment intent
            const { clientSecret, amount, currency } = await this.createPaymentIntent(items);
            this.clientSecret = clientSecret;

            // Create elements
            this.elements = this.stripe.elements({
                clientSecret: clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#8da47e',
                        colorBackground: '#ffffff',
                        colorText: '#333333',
                        colorDanger: '#df1b41',
                        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                    }
                }
            });

            // Create payment element
            this.paymentElement = this.elements.create('payment', {
                layout: 'tabs'
            });

            // Mount payment element
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = ''; // Clear existing content
                this.paymentElement.mount(`#${containerId}`);
            }

            return { amount, currency };
        } catch (error) {
            console.error('Error setting up payment form:', error);
            throw error;
        }
    }

    async confirmPayment() {
        if (!this.stripe || !this.elements || !this.clientSecret) {
            throw new Error('Payment not initialized');
        }

        try {
            const { error, paymentIntent } = await this.stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
                redirect: 'if_required'
            });

            if (error) {
                throw new Error(error.message);
            }

            return paymentIntent;
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }

    async confirmPaymentWithRedirect() {
        if (!this.stripe || !this.elements || !this.clientSecret) {
            throw new Error('Payment not initialized');
        }

        try {
            const { error } = await this.stripe.confirmPayment({
                elements: this.elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                }
            });

            if (error) {
                throw new Error(error.message);
            }
        } catch (error) {
            console.error('Error confirming payment with redirect:', error);
            throw error;
        }
    }

    destroy() {
        if (this.paymentElement) {
            this.paymentElement.destroy();
            this.paymentElement = null;
        }
        if (this.elements) {
            this.elements = null;
        }
        this.clientSecret = null;
    }

    isReady() {
        return this.isInitialized && this.stripe !== null;
    }
}

// Global payment manager instance
window.stripePaymentManager = new StripePaymentManager();

// Payment modal functions
function showPaymentModal(items) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <div class="payment-modal-header">
                <h2>Complete Your Order</h2>
                <button class="payment-modal-close" onclick="closePaymentModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="payment-modal-body">
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <div class="order-items">
                        ${items.map(item => `
                            <div class="order-item">
                                <span class="item-name">${item.name} x${item.quantity}</span>
                                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <strong>Total: $${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</strong>
                    </div>
                </div>
                <div class="payment-form">
                    <h3>Payment Information</h3>
                    <div id="payment-element">
                        <!-- Stripe Elements will be inserted here -->
                    </div>
                    <div id="payment-message" class="payment-message"></div>
                </div>
            </div>
            <div class="payment-modal-footer">
                <button class="btn-secondary" onclick="closePaymentModal()">Cancel</button>
                <button class="btn-primary" id="pay-button" onclick="processPayment()">
                    <i class="fas fa-credit-card"></i> Pay Now
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Setup payment form
    window.stripePaymentManager.setupPaymentForm('payment-element', items)
        .then(() => {
            console.log('Payment form ready');
        })
        .catch(error => {
            document.getElementById('payment-message').innerHTML = 
                `<div class="error-message">Error: ${error.message}</div>`;
        });

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePaymentModal();
        }
    });
}

function closePaymentModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        window.stripePaymentManager.destroy();
        modal.remove();
    }
}

async function processPayment() {
    const payButton = document.getElementById('pay-button');
    const messageDiv = document.getElementById('payment-message');
    
    if (payButton) {
        payButton.disabled = true;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    try {
        const paymentIntent = await window.stripePaymentManager.confirmPayment();
        
        if (paymentIntent.status === 'succeeded') {
            messageDiv.innerHTML = '<div class="success-message">Payment successful!</div>';
            
            // Clear cart and show success
            setTimeout(() => {
                closePaymentModal();
                clearCart();
                showNotification('Payment successful! Your order has been placed.', 'success');
            }, 2000);
        } else {
            throw new Error('Payment was not successful');
        }
    } catch (error) {
        console.error('Payment error:', error);
        messageDiv.innerHTML = `<div class="error-message">Payment failed: ${error.message}</div>`;
        
        if (payButton) {
            payButton.disabled = false;
            payButton.innerHTML = '<i class="fas fa-credit-card"></i> Pay Now';
        }
    }
}

// Export for use in other scripts
window.showPaymentModal = showPaymentModal;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;
