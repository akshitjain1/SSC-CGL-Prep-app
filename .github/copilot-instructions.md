<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SSC CGL Preparation Web App - Copilot Instructions

This is a Next.js-based SSC CGL (Staff Selection Commission Combined Graduate Level) preparation web application. The app provides AI-powered daily study content including vocabulary, idioms, current affairs, and practice tests.

## Project Structure
- **Frontend**: Next.js 15 with TypeScript and TailwindCSS
- **API Routes**: Next.js API routes for backend functionality
- **AI Integration**: Google Gemini API for content generation and evaluation
- **Data Storage**: Local JSON files for user progress and content
- **UI Components**: Custom components with responsive design

## Key Features
1. **Daily Vocabulary**: 10 AI-generated words with meanings, synonyms, examples
2. **Idioms & Phrases**: 5 idioms with practice exercises and AI evaluation
3. **Current Affairs**: AI-summarized news relevant for GK preparation
4. **GK Quiz**: 5 MCQs covering various topics with explanations
5. **Practice Writing**: AI-evaluated sentence writing practice
6. **Progress Tracking**: Charts and analytics for study progress

## Important Guidelines
- All API keys should be stored in `.env.local` and never exposed to client-side code
- Use server-side API routes for all AI interactions and data operations
- Maintain TypeScript types for all components and data structures
- Follow responsive design principles for mobile compatibility
- Use the established color scheme (primary-blue, secondary-green, etc.)
- Handle loading states and error scenarios gracefully
- Store user progress in localStorage for persistence

## File Organization
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions, API clients, and data storage
- `src/app/api/` - Server-side API routes
- `data/` - JSON files for storing application data

## AI Integration
- Use Google Gemini API for content generation and evaluation
- Parse JSON responses carefully with fallback data
- Implement proper error handling for AI service failures
- Generate structured content suitable for competitive exam preparation

## Styling
- Use TailwindCSS for all styling
- Follow the established component classes (.btn-primary, .card, etc.)
- Ensure mobile-first responsive design
- Use consistent color scheme and spacing
