// AI Cooking Assistant for MyCulinair
class CookingAssistant {
    constructor() {
        this.chatHistory = [];
        this.commonIssues = {
            'sauce too thick': [
                'Add a splash of water, broth, or milk and stir until you reach the desired consistency.',
                'If it is a cream-based sauce, add a bit more cream or milk.'
            ],
            'food too salty': [
                'Add unsalted ingredients (potato, rice, or more vegetables) to absorb excess salt.',
                'Add a splash of acid (lemon juice or vinegar) to balance the saltiness.'
            ],
            'meat too tough': [
                'Cook it longer at a lower temperature to help break down connective tissue.',
                'Slice the meat thinly against the grain.'
            ]
        };
        this.techniques = {
            'sauté': 'Sautéing means cooking food quickly in a small amount of oil or fat over relatively high heat.',
            'deglaze': 'To deglaze, add liquid to a hot pan to loosen and dissolve the browned bits of food stuck to the bottom.',
            'blanch': 'Blanching is briefly boiling food, then plunging it into ice water to stop the cooking process.'
        };
        this.substitutions = {
            'egg': 'You can substitute 1 egg with 1/4 cup applesauce, mashed banana, or a flaxseed mixture.',
            'milk': 'Try almond milk, soy milk, or oat milk as a substitute for regular milk.',
            'butter': 'Use coconut oil, olive oil, or margarine as a butter substitute.'
        };
    }

    async getResponse(question) {
        const normalized = question.toLowerCase();
        // Troubleshooting
        for (const issue in this.commonIssues) {
            if (normalized.includes(issue)) {
                return this.commonIssues[issue].join(' ');
            }
        }
        // Substitutions
        for (const key in this.substitutions) {
            if (normalized.includes('substitute') && normalized.includes(key)) {
                return this.substitutions[key];
            }
        }
        // Techniques
        for (const tech in this.techniques) {
            if (normalized.includes(tech)) {
                return this.techniques[tech];
            }
        }
        // Definitions
        if (normalized.startsWith('what is') || normalized.startsWith('define ')) {
            const word = normalized.replace('what is', '').replace('define', '').trim();
            if (this.techniques[word]) return this.techniques[word];
            if (this.substitutions[word]) return this.substitutions[word];
            return `"${word}" is not in my glossary yet, but I'm learning more every day!`;
        }
        // General cooking tips
        if (normalized.includes('tip') || normalized.includes('advice')) {
            return 'Always read the recipe through before starting, prep your ingredients, and taste as you go!';
        }
        // Tutorial/step-by-step
        if (normalized.includes('how do i') || normalized.includes('tutorial') || normalized.includes('step')) {
            return this.generateTutorialSteps(question);
        }
        // Fallback
        return "I'm here to help! Please ask about a cooking technique, substitution, or describe your issue in detail.";
    }

    generateTutorialSteps(question) {
        // Example: return a simple step-by-step guide
        return [
            '1. Gather all your ingredients.',
            '2. Prepare your workspace and utensils.',
            '3. Follow the recipe steps one by one.',
            '4. Ask me for help if you get stuck!'
        ].join(' ');
    }
} 