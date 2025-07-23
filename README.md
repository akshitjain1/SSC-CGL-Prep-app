# 🏆 SSC CGL Preparation Web App

A comprehensive AI-powered web application for SSC (Staff Selection Commission) Combined Graduate Level exam preparation. Built with Next.js 15, TypeScript, and powered by Google Gemini AI.

![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4)

## ✨ Features

### 📚 Core Learning Modules
- **Vocabulary Builder** - Learn 10 AI-generated words daily with definitions, synonyms, and examples
- **Idioms & Phrases** - Master common expressions with practice exercises and AI evaluation
- **Daily GK** - AI-curated current affairs and general knowledge facts
- **Writing Practice** - Essay writing with AI-powered feedback and scoring

### 🎯 AI-Powered Features
- **Smart Content Generation** - Fresh content generated daily using Google Gemini AI
- **Intelligent Evaluation** - AI feedback on writing and comprehension exercises
- **Personalized Learning** - Adaptive content based on your progress
- **Real-time Scoring** - Instant feedback on practice exercises

### 📊 Progress Tracking
- **Interactive Dashboard** - Beautiful glass-morphism design with real-time stats
- **Progress Analytics** - Detailed charts and performance tracking
- **Streak Tracking** - Maintain your learning momentum
- **Achievement System** - Track completed tasks and milestones

### 🎨 Modern UI/UX
- **Glass-morphism Design** - Beautiful, modern interface with backdrop blur effects
- **Responsive Layout** - Perfect on desktop, tablet, and mobile devices
- **Dark Theme** - Easy on the eyes with gradient backgrounds
- **Smooth Animations** - Engaging micro-interactions and transitions
- **Accessibility Compliant** - WCAG AA contrast ratios and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akshitjain1/SSC-CGL-Prep-app.git
   cd SSC-CGL-Prep-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google Gemini API key:
   ```env
   GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage Guide

### Daily Study Routine
1. **Start with Vocabulary** (10 min) - Learn new words with AI-generated examples
2. **Practice Idioms** (12 min) - Master expressions with interactive exercises  
3. **Read Daily GK** (15 min) - Stay updated with current affairs
4. **Writing Practice** (10 min) - Improve essay writing with AI feedback

### Progress Tracking
- View your daily completion status on the dashboard
- Check detailed analytics in the Progress section
- Monitor your learning streak and achievements
- Export progress data for personal records

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom glass-morphism components
- **Icons**: Lucide React
- **Charts**: Recharts for analytics visualization

### Backend
- **API Routes**: Next.js serverless functions
- **AI Integration**: Google Gemini API for content generation
- **Data Storage**: Local JSON files with localStorage persistence
- **Content Management**: Dynamic AI-generated daily content

### Development
- **Linting**: ESLint with TypeScript rules
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Next.js optimized bundling
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Server-side API routes
│   │   ├── daily-gk/      # Daily GK content generation
│   │   ├── evaluate-sentence/ # AI sentence evaluation
│   │   ├── idioms/        # Idioms and phrases
│   │   ├── news/          # Current affairs
│   │   ├── practice/      # Writing practice
│   │   └── vocabulary/    # Vocabulary generation
│   ├── daily-gk/         # Daily GK page
│   ├── idioms/           # Idioms & Phrases page
│   ├── news/             # Current Affairs page
│   ├── practice/         # Writing Practice page
│   ├── progress/         # Analytics & Progress page
│   ├── vocabulary/       # Vocabulary page
│   ├── globals.css       # Global styles and components
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard/Home page
├── lib/                  # Utility libraries
│   ├── geminiClient.ts   # Google Gemini AI client
│   ├── progressManager.ts # Progress tracking logic
│   └── storage.ts        # Data persistence utilities
└── components/           # Reusable UI components (if any)
```

## 🔧 API Endpoints

### Content Generation
- `GET /api/vocabulary` - Generate daily vocabulary
- `GET /api/idioms` - Generate idioms and phrases  
- `GET /api/daily-gk?category={category}` - Generate GK content
- `GET /api/news` - Fetch current affairs

### AI Evaluation
- `POST /api/evaluate-sentence` - Evaluate user sentences
- `POST /api/practice` - Submit and evaluate essays

### Data Management
- All data is stored locally using localStorage
- Progress tracking via JSON serialization
- No external database required

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (`from-blue-600 to-blue-700`)
- **Secondary**: Purple accent (`from-purple-600 to-purple-700`)
- **Success**: Green (`from-green-600 to-green-700`)
- **Background**: Dark gradient (`from-blue-900 via-purple-900 to-indigo-900`)

### Components
- **Glass Cards**: `glass-card` - Backdrop blur with transparency
- **Buttons**: `btn-primary`, `btn-secondary` with hover effects
- **Forms**: `input-field`, `textarea-field` with glass styling
- **Progress**: Custom progress bars and completion indicators

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms
- **Netlify**: Works with standard Next.js build
- **Railway**: Supports Node.js applications
- **Heroku**: Compatible with Next.js apps

### Environment Variables for Production
```env
GOOGLE_GEMINI_API_KEY=your_production_api_key
NEXT_PUBLIC_APP_NAME=SSC CGL Prep App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📱 Browser Support
- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the intelligent content generation
- **Next.js Team** for the amazing React framework
- **TailwindCSS** for the utility-first CSS framework
- **Vercel** for seamless deployment platform

## 📞 Support

If you encounter any issues or have questions:
- Create an issue on GitHub
- Check the documentation
- Review the API documentation

---

**Built with ❤️ for SSC CGL aspirants**

*Good luck with your exam preparation! 🎯*
