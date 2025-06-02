# Tools2Go - Developer Tools Collection

A comprehensive collection of developer tools built with React, TypeScript, and Vite. All tools run locally in your browser for maximum privacy and security.

VIBE ONCE USE EVERYDAY

## 🚀 Live Demo

Visit the live site: [https://your-username.github.io/handsome/](https://your-username.github.io/handsome/)

## 📦 Features

- **Privacy First**: All data processing happens locally in the browser
- **Zero Configuration**: No installation required, works offline
- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Tool Suite**: Multiple developer tools in one place

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

### Project Structure

```
2base/
├── src/
│   ├── app/                 # Main application pages
│   ├── components/          # Reusable UI components
│   ├── tools/              # Individual tool implementations
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
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

- [ ] Add more developer tools
- [ ] Implement tool favorites system
- [ ] Add tool usage analytics (local only)
- [ ] Support for custom tool plugins
- [ ] Dark/light theme improvements
- [ ] Mobile app version

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/your-username/handsome/issues).

## 📞 Support

- Documentation: Check the individual tool documentation in `/tools/[tool-name]/docs/`
- Issues: [GitHub Issues](https://github.com/your-username/handsome/issues)
- Discussions: [GitHub Discussions](https://github.com/your-username/handsome/discussions) 