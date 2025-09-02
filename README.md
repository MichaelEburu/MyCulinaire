# MyCulinaire - AI-Powered Cooking Assistant

A modern, responsive web application that helps you manage your pantry, discover recipes, and get AI-powered cooking assistance.

## Features

### 🍳 Core Features
- **Recipe Discovery**: Browse and search through a curated collection of recipes
- **Pantry Management**: Track ingredients with expiration dates and storage tips
- **Smart Shopping Cart**: Add missing ingredients to your shopping list
- **AI Cooking Assistant**: Get personalized cooking advice and tips (requires OpenAI API key)
- **Ingredient Scanning**: Use your camera to scan and identify ingredients
- **Favorites System**: Save your favorite recipes for quick access

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Sage Green Theme**: Beautiful, calming color scheme inspired by nature
- **Smooth Animations**: Delightful micro-interactions and transitions
- **Touch-Friendly**: Optimized for mobile touch interactions

### 🔧 Technical Features
- **Progressive Web App**: Fast loading and offline capabilities
- **Real-time Updates**: Dynamic content updates without page refresh
- **Image Recognition**: AI-powered ingredient identification
- **Local Storage**: Data persists between sessions
- **Cross-Platform**: Works on all modern browsers

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyCulinaire-main/MyCulinair
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional)**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3001
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3001`

## Usage

### Basic Workflow
1. **Add Ingredients**: Use the Pantry section to add ingredients with expiration dates
2. **Discover Recipes**: Browse recipes on the home page or use the search function
3. **Get AI Help**: Ask the cooking assistant for tips, substitutions, or meal ideas
4. **Shop Smart**: Add missing ingredients to your cart for easy shopping

### Advanced Features
- **Ingredient Scanning**: Use the camera feature to automatically identify ingredients
- **Expiration Tracking**: Get alerts for ingredients nearing expiration
- **Recipe Filtering**: Filter recipes by dietary restrictions, cooking time, or missing ingredients
- **Social Features**: Share recipes with friends (coming soon)

## API Integration

### OpenAI Integration
To enable AI features, you'll need an OpenAI API key:
1. Sign up at [OpenAI](https://openai.com)
2. Get your API key from the dashboard
3. Add it to your `.env` file as `OPENAI_API_KEY`

### Supported AI Features
- Recipe suggestions based on available ingredients
- Cooking techniques and tips
- Ingredient substitutions
- Meal planning assistance
- Food safety and storage advice
- Nutrition information

## Project Structure

```
MyCulinair/
├── public/
│   ├── css/
│   │   └── styles.css          # Main stylesheet
│   ├── js/
│   │   ├── app.js             # Main application logic
│   │   ├── ai-features.js     # AI integration
│   │   ├── cooking-assistant.js # Chat interface
│   │   ├── expiration-estimator.js # Expiration tracking
│   │   ├── pantry-scroll.js   # Pantry interactions
│   │   └── toolbar-scroll.js  # Navigation interactions
│   └── index.html             # Main HTML file
├── data/
│   ├── recipes.json           # Recipe database
│   ├── userData.json          # User preferences
│   └── users.json             # User accounts
├── server.js                  # Express server
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add comments for complex functionality
- Test your changes on multiple devices
- Update documentation as needed

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Image Recognition**: TensorFlow.js, MobileNet
- **OCR**: Tesseract.js
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## Roadmap

### Upcoming Features
- [ ] User authentication and profiles
- [ ] Recipe sharing and social features
- [ ] Meal planning calendar
- [ ] Grocery store integration
- [ ] Nutrition tracking
- [ ] Voice commands
- [ ] Offline mode improvements
- [ ] Recipe scaling calculator

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI cooking assistant
- **v1.2.0** - Enhanced mobile experience
- **v1.3.0** - Added ingredient scanning

---

Made with ❤️ for food lovers everywhere!
