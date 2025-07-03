# MyCulinair - AI-Powered Cooking Companion

MyCulinair is a smart, user-centric React application designed to help users find recipes based on their pantry contents. It leverages multiple third-party APIs to fetch real-time recipes and provides an intuitive interface for managing ingredients and dietary preferences.

## Features

- 🏠 **Smart Recipe Discovery**: Find recipes based on your pantry ingredients
- 📸 **OCR Scanning**: Scan your pantry items using your camera
- 🧺 **Pantry Management**: Track ingredients and expiration dates
- 🛒 **Shopping List**: Create and manage shopping lists
- 🥗 **Dietary Filters**: Set dietary preferences and allergens
- 💎 **Premium Features**: Access to exclusive recipes and unlimited AI assistance

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Tesseract.js (OCR)
- Stripe (Payments)
- Multiple Recipe APIs (Spoonacular, Edamam, TheMealDB)

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn
- API keys for:
  - Spoonacular
  - Edamam
  - TheMealDB
  - Stripe

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/myculinar.git
   cd myculinar
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_key
   REACT_APP_EDAMAM_API_KEY=your_edamam_key
   REACT_APP_THEMEALDB_API_KEY=your_themealdb_key
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The application will be available at `http://localhost:3000`.

## Project Structure

```
myculinar/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── PantryPage.js
│   │   ├── CartPage.js
│   │   ├── FilterPage.js
│   │   └── UpgradePage.js
│   ├── components/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

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