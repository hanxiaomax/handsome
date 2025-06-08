# Tools2Go - Developer Tools Collection

A comprehensive collection of developer tools built with React, TypeScript, and Vite. All tools run locally in your browser for maximum privacy and security.

VIBE ONCE USE EVERYDAY

## 🚀 Live Demo

Visit the live site: [https://hanxiaomax.github.io/handsome/](https://hanxiaomax.github.io/handsome/)

## 📦 Features

- **Privacy First**: All data processing happens locally in the browser
- **Zero Configuration**: No installation required, works offline
- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Tool Suite**: Multiple developer tools in one place
- **Comprehensive Testing**: Vitest-powered testing framework with full coverage

## 🛠️ Available Tools

- **Programmer Calculator**: Binary, hex, decimal calculations with bitwise operations
- **UUID Generator**: Generate various types of UUIDs
- **World Clock**: Multiple timezone clock display
- **Unit Converter**: Convert between different units
- **Unix Timestamp Converter**: Convert timestamps to readable dates
- **Markdown Editor**: Live markdown editor with preview
- **Emoji Library**: Search and copy emojis
- **Color Palette**: Color picker and palette generator
- **Product Chart Generator**: Create product comparison charts
- **XML Parser**: Parse and view XML data in tree format

## 🚀 GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Fork or clone this repository**
2. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source
3. **Push changes** to the main branch to trigger deployment
4. **Access your site** at `https://your-username.github.io/handsome/`

### Deployment Configuration

- **Build Process**: Automatic via GitHub Actions on push to main branch
- **Base Path**: Configured for GitHub Pages subdirectory (`/handsome/`)
- **SPA Routing**: Includes 404.html for client-side routing support
- **Asset Optimization**: Vite optimizes all assets for production

### Manual Deployment

To deploy manually:

```bash
cd 2base
npm install
npm run build:gh-pages
# Upload the contents of the dist folder to your hosting provider
```

## 🏗️ Development

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Local Development

```bash
# Navigate to the project directory
cd 2base

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

The project uses **Vitest** for testing with comprehensive coverage of all tool functionality.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific tool tests
npm run test -- src/tools/programmer-calculator/tests/

# Run tests for a specific file
npm run test -- src/tools/programmer-calculator/tests/bitwise.test.ts
```

#### Test Structure

```
src/tools/
└── [tool-name]/
    ├── tests/
    │   ├── [feature].test.ts     # Unit tests
    │   └── [component].test.tsx  # Component tests
    ├── lib/                      # Core logic (tested)
    └── ui.tsx                    # Tool interface
```

#### Writing Tests

Each tool should include comprehensive tests:

```typescript
// Example test file: src/tools/my-tool/tests/logic.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../lib/logic';

describe('My Tool', () => {
  describe('Core Functionality', () => {
    it('should handle basic operations', () => {
      expect(myFunction(input)).toBe(expectedOutput);
    });
  });
});
```

#### Current Test Coverage

- **Programmer Calculator**: 28 comprehensive tests covering all bitwise operations
- **Additional tools**: Ready for test implementation

### Project Structure

```
2base/
├── src/
│   ├── app/                 # Main application pages
│   ├── components/          # Reusable UI components
│   ├── tools/              # Individual tool implementations
│   │   └── [tool-name]/
│   │       ├── tests/       # Tool-specific tests
│   │       ├── lib/         # Core logic
│   │       └── ui.tsx       # Tool interface
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── vitest.config.ts        # Testing configuration
└── dist/                   # Production build output
```

## 🔧 Configuration

### Vite Configuration

The project uses Vite with the following key configurations:
- **Base Path**: Dynamically set for GitHub Pages
- **Build Output**: Optimized for production deployment
- **Asset Handling**: Proper asset paths for subdirectory deployment

### Environment Variables

No environment variables required for basic functionality. All tools work offline.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'Add amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [x] **Testing Framework**: Comprehensive Vitest integration ✅
- [ ] Add more developer tools
- [ ] Implement tool favorites system
- [ ] Add tool usage analytics (local only)
- [ ] Support for custom tool plugins
- [ ] Dark/light theme improvements
- [ ] Mobile app version
- [ ] CI/CD pipeline with automated testing

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/your-username/handsome/issues).

## 📞 Support

- Documentation: Check the individual tool documentation in `/tools/[tool-name]/docs/`
- Issues: [GitHub Issues](https://github.com/your-username/handsome/issues)
- Discussions: [GitHub Discussions](https://github.com/your-username/handsome/discussions) 
