// Enhanced AI Chat Interface for MyCulinairee
class AIChat {
    constructor() {
        this.chatHistory = [];
        this.isLoading = false;
        this.setupEventListeners();
    }


    setupEventListeners() {
        // Send message
        const sendButton = document.getElementById('ai-chat-send');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Enter key to send
        const inputField = document.getElementById('ai-chat-input');
        if (inputField) {
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const query = e.target.getAttribute('data-query');
                const inputField = document.getElementById('ai-chat-input');
                if (inputField) {
                    inputField.value = query;
                    this.sendMessage();
                }
            }
        });
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;

        // Clear input
        input.value = '';

        // Add user message
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get pantry ingredients
            const pantryIngredients = this.getPantryIngredients();
            
            // Send to AI
            const response = await this.getAIResponse(message, pantryIngredients);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('AI Chat Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `${sender}-avatar`;
        avatar.innerHTML = sender === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = `${sender}-message-content`;
        messageContent.innerHTML = this.formatMessage(content);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to chat history
        this.chatHistory.push({ content, sender, timestamp: Date.now() });
    }

    formatMessage(content) {
        // Convert line breaks to HTML
        return content.replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.isLoading = true;
        const messagesContainer = document.getElementById('ai-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="ai-message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isLoading = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    getPantryIngredients() {
        // Get ingredients from pantry if available
        try {
            const pantryData = JSON.parse(localStorage.getItem('pantry') || '[]');
            return pantryData.map(item => item.name || item.ingredient).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    async getAIResponse(message, pantryIngredients) {
        try {
            console.log('Sending request to AI API:', { message, pantryIngredients });
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    pantryIngredients: pantryIngredients
                })
            });

            console.log('AI API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('AI API Error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI API Success response:', data);
            return data.message || 'I apologize, but I couldn\'t generate a response. Please try again.';
            
        } catch (error) {
            console.error('AI API Error:', error);
            // Enhanced fallback response
            return this.getEnhancedFallbackResponse(message);
        }
    }

    getEnhancedFallbackResponse(message) {
        // Much more open and helpful responses
        const lowerMessage = message.toLowerCase();
        
        // Recipe and cooking responses
        if (lowerMessage.includes('recipe') || lowerMessage.includes('make') || lowerMessage.includes('cook') || lowerMessage.includes('dish')) {
            return "I'd love to help you create amazing dishes! Tell me what ingredients you have or what you're craving, and I'll suggest delicious recipes. You can ask things like: 'What can I make with chicken and rice?' or 'I want to make something with pasta' or 'Give me a healthy dinner idea'.";
        }
        
        // Substitution help
        if (lowerMessage.includes('substitute') || lowerMessage.includes('replace') || lowerMessage.includes('instead of')) {
            return "I can definitely help with ingredient substitutions! Just tell me what you want to replace and I'll give you great alternatives. Try asking: 'What can I use instead of eggs?' or 'How do I substitute butter?' or 'I don't have milk, what can I use?'";
        }
        
        // Cooking techniques
        if (lowerMessage.includes('technique') || lowerMessage.includes('how to') || lowerMessage.includes('cook') || lowerMessage.includes('method')) {
            return "I can teach you all kinds of cooking techniques! Ask me about anything like: 'How do I sauté vegetables perfectly?' or 'What's the best way to cook rice?' or 'How do I make a roux?' or 'Teach me to braise meat'.";
        }
        
        // Tips and advice
        if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('help')) {
            return "I have tons of cooking tips and advice! Ask me about anything specific like: 'How do I keep vegetables fresh?' or 'What's the secret to tender meat?' or 'How do I season food properly?' or 'Give me knife skills tips'.";
        }
        
        // Meal planning
        if (lowerMessage.includes('meal plan') || lowerMessage.includes('meal prep') || lowerMessage.includes('planning') || lowerMessage.includes('prep')) {
            return "I can help you plan amazing meals! Tell me about your schedule, dietary preferences, or what you want to achieve. Ask things like: 'Help me plan meals for the week' or 'I want to meal prep for work' or 'Plan a dinner party menu'.";
        }
        
        // Food safety and storage
        if (lowerMessage.includes('safe') || lowerMessage.includes('storage') || lowerMessage.includes('store') || lowerMessage.includes('fresh')) {
            return "I can help with food safety and storage! Ask me about: 'How long can I keep chicken in the fridge?' or 'What's the best way to store herbs?' or 'How do I know if food is still good?' or 'Food safety tips for cooking'.";
        }
        
        // General cooking questions
        if (lowerMessage.includes('what') || lowerMessage.includes('why') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
            return "I can answer all kinds of cooking questions! Ask me anything like: 'What's the difference between baking and roasting?' or 'Why do I need to rest meat?' or 'When should I add salt?' or 'Where can I find good ingredients?'";
        }
        
        // Encouragement and general help
        return "I'm here to help you become a better cook! Ask me anything about cooking, recipes, techniques, ingredients, meal planning, food safety, or just tell me what you're trying to make. I love talking about food and helping people cook amazing meals! What's on your mind?";
    }

    getFallbackResponse(message) {
        return this.getEnhancedFallbackResponse(message);
    }
}

// Initialize AI Chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiChat = new AIChat();
});
