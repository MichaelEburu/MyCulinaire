# MyCulinair - AI-Powered Cooking Companion

MyCulinair is a smart, user-centric vanilla JavaScript application designed to help users find recipes based on their pantry contents. It leverages multiple third-party APIs to fetch real-time recipes and provides an intuitive interface for managing ingredients and dietary preferences.

## Features

- 🏠 **Smart Recipe Discovery**: Find recipes based on your pantry ingredients
- 📸 **OCR Scanning**: Scan your pantry items using your camera
- 🧺 **Pantry Management**: Track ingredients and expiration dates
- 🛒 **Shopping List**: Create and manage shopping lists
- 🥗 **Dietary Filters**: Set dietary preferences and allergens
- 💎 **Premium Features**: Access to exclusive recipes and unlimited AI assistance

## Tech Stack

- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- Tesseract.js (OCR)
- Stripe (Payments)
- Multiple Recipe APIs (Spoonacular, Edamam, TheMealDB)

## Getting Started

### Prerequisites

- Node.js 14.x or later (for backend API features)
- API keys for:
  - Spoonacular
  - Edamam
  - TheMealDB
  - Stripe
  - OpenAI (for AI chat features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/myculinar.git
   cd myculinar
   ```

2. Install dependencies (for backend features):
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_key
   SPOONACULAR_API_KEY=your_spoonacular_key
   EDAMAM_API_KEY=your_edamam_key
   THEMEALDB_API_KEY=your_themealdb_key
   STRIPE_SECRET_KEY=your_stripe_key
   ```

4. **To run with backend features:**
   ```bash
   npm run server
   ```
   Then open `public/index.html` in your browser.

5. **To run without backend (static version):**
   Simply open `public/index.html` directly in your browser.

## Project Structure

```
myculinar/
├── public/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # All styling
│   └── js/
│       ├── app.js          # Main application logic
│       ├── cooking-assistant.js  # AI cooking assistant
│       └── ai-features.js  # AI features
├── server.js               # Express backend (optional)
├── package.json
└── README.md
```

## Usage

### Static Version (Recommended)
Simply open `public/index.html` in your browser. This gives you:
- ✅ Recipe search and display
- ✅ Pantry management
- ✅ UI and styling
- ❌ AI chat features (requires backend)

### Full Version (with AI features)
1. Start the backend server: `npm run server`
2. Open `public/index.html` in your browser
3. AI chat and backend features will be available

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Spoonacular API](https://spoonacular.com/food-api)
- [Edamam API](https://developer.edamam.com/)
- [TheMealDB API](https://www.themealdb.com/api.php)
- [Stripe](https://stripe.com)
- [Tesseract.js](https://github.com/naptha/tesseract.js) 