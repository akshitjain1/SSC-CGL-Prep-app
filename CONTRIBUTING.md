# 🤝 Contributing to SSC CGL Prep App

Thank you for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/SSC-CGL-Prep-app.git
   cd SSC-CGL-Prep-app
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Google Gemini API key
   ```
5. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use Prettier for formatting
- Use meaningful variable and function names
- Add comments for complex logic

### File Structure
```
src/
├── app/              # Next.js pages and API routes
├── lib/              # Utility functions and shared logic
└── components/       # Reusable UI components (if any)
```

### Naming Conventions
- **Files**: kebab-case (`my-component.tsx`)
- **Components**: PascalCase (`MyComponent`)
- **Functions**: camelCase (`myFunction`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINT`)

## 🎯 How to Contribute

### 1. Bug Reports
- Check existing issues first
- Use the bug report template
- Include steps to reproduce
- Add screenshots if applicable

### 2. Feature Requests
- Check existing issues for duplicates
- Explain the use case clearly
- Describe the expected behavior
- Consider implementation complexity

### 3. Code Contributions

#### Step-by-step Process:
1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns
   - Add tests if applicable

3. **Test your changes**
   ```bash
   npm run lint          # Check code style
   npm run type-check    # Check TypeScript
   npm run build         # Test production build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new vocabulary feature"
   # Use conventional commits format
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

### Commit Message Format
Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Examples:
```
feat: add daily streak counter to dashboard
fix: resolve vocabulary card animation issue
docs: update installation instructions
```

## 🧪 Testing

### Manual Testing
- Test all learning modules
- Check responsive design on different devices
- Verify AI integrations work properly
- Test progress tracking functionality

### Build Testing
```bash
npm run build    # Ensure production build works
npm run start    # Test production mode locally
```

## 📝 Documentation

When adding new features:
- Update README.md if needed
- Add JSDoc comments to functions
- Update API documentation
- Include usage examples

## 🎨 UI/UX Guidelines

### Design Principles
- Maintain glass-morphism aesthetic
- Ensure WCAG AA accessibility compliance
- Keep mobile-first responsive design
- Use consistent color palette
- Smooth animations and transitions

### Component Guidelines
- Use existing Tailwind classes
- Follow glass-card pattern
- Maintain consistent spacing
- Add hover and focus states
- Include loading states

## 🔍 Code Review Process

### What We Look For
- ✅ Code follows existing patterns
- ✅ TypeScript types are properly defined
- ✅ No console errors or warnings
- ✅ Mobile responsive design
- ✅ Accessibility considerations
- ✅ Performance implications considered

### Review Checklist
- [ ] Code builds without errors
- [ ] ESLint passes
- [ ] TypeScript checks pass
- [ ] Feature works as expected
- [ ] No breaking changes
- [ ] Documentation updated if needed

## 🌟 Areas We Need Help

### High Priority
- [ ] Offline functionality
- [ ] Better error handling
- [ ] Performance optimizations
- [ ] Additional language support
- [ ] More practice exercise types

### Medium Priority
- [ ] Dark/light theme toggle
- [ ] Export progress to PDF
- [ ] Social sharing features
- [ ] Advanced analytics
- [ ] Mobile app version

### Low Priority
- [ ] Additional chart types
- [ ] Custom themes
- [ ] Gamification features
- [ ] Community features

## 🚫 What Not to Contribute

- Breaking changes without discussion
- Features that compromise security
- Code that doesn't follow TypeScript best practices
- UI changes that break accessibility
- Dependencies with known vulnerabilities

## 💬 Getting Help

- 📧 Create an issue for questions
- 💬 Join discussions in GitHub Discussions
- 📖 Read the documentation thoroughly
- 🔍 Search existing issues first

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making SSC CGL Prep App better! 🙏**
