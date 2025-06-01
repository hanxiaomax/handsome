# Tool Suite - Developer Tools Collection

A modern, privacy-first collection of developer tools built with React, TypeScript, and Tailwind CSS.

## Features

- **Privacy First**: All data processing happens locally in the browser
- **Frontend Priority**: Basic functions work offline, advanced features optional
- **Zero Configuration**: Users need no software installation
- **Modular Architecture**: Independent tool development and loading
- **Progressive Enhancement**: Core functionality first, then advanced features
- **Theme Customization**: Light/dark mode with multiple color schemes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Minimal UI Design**: Clean, focused interface with consistent card layouts
- **Layout Consistency**: Uniform height cards with optimized content distribution

## Current Tools

### Programmer Calculator
- Advanced calculator with base conversion and bitwise operations
- Binary, Octal, Decimal, Hexadecimal conversion
- Bitwise operations (AND, OR, XOR, NOT)
- Bit manipulation and visualization
- Programming-specific functions

## Project Structure

```
src/
├── app/                   # Application pages
│   ├── homepage.tsx       # Main homepage component
│   └── favorites.tsx      # Favorites page component
├── components/            # UI Components
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Layout templates and wrappers
│   ├── navigation/        # Navigation-related components
│   │   ├── theme-toggle.tsx
│   │   └── welcome-page.tsx
│   └── tools/             # Tool display components
│       ├── tool-card.tsx
│       ├── tool-info-card.tsx
│       ├── tool-detail.tsx
│       └── dashboard-charts.tsx
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
├── tools/                 # Tool implementations
│   └── [tool-name]/
│       ├── ui.tsx         # Tool UI component
│       ├── toolInfo.ts    # Tool metadata
│       ├── lib.ts         # Simple tool logic
│       ├── lib/           # Complex tool logic (when needed)
│       ├── components/    # Tool-specific components (when needed)
│       └── docs/          # Tool documentation
│           ├── specification.md
│           └── api-reference.md
├── data/                  # Static data and configurations
│   └── tools.ts           # Tool registry and categories
└── assets/                # Static assets (images, icons)
```

## Technology Stack

- **React 19.1.0**: UI framework with functional components and hooks
- **TypeScript 5.8+**: Type-safe JavaScript with strict mode
- **Vite 6.3.5**: Modern build tool with fast HMR
- **Tailwind CSS 4.1**: Atomic CSS framework
- **shadcn/ui 2.5.0**: Reusable UI components
- **Radix UI**: Headless UI primitives for accessibility

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Open http://localhost:5173 in your browser

## Theme Customization

The application supports comprehensive theme customization:

### Theme Modes
- **Light Mode**: Bright theme for daytime use
- **Dark Mode**: Dark theme to reduce eye strain
- **System Mode**: Automatically follows system preferences

### Color Schemes
- **Default**: Warm orange color scheme
- **Blue**: Professional blue theme
- **Green**: Natural green theme  
- **Purple**: Elegant purple theme
- **Orange**: Vibrant orange theme
- **Red**: Bold red theme

### Usage
1. Click the theme mode button (sun/moon/monitor icon) in the top-right corner
2. Click the color scheme button (palette icon) to choose your preferred colors
3. Settings are automatically saved and restored on next visit

For detailed information, see [THEME_GUIDE.md](./THEME_GUIDE.md)

## Development

### Adding New Tools

1. Create tool directory in `src/tools/[tool-name]/`
2. Add tool metadata in `toolInfo.ts`
3. Implement UI component in `ui.tsx`
4. Register tool in `src/data/tools.ts`
5. Add detailed specification in `[tool-name]-specification.md`

### Code Standards

- Use TypeScript with strict mode
- Follow React functional component patterns
- Use shadcn/ui components for consistency
- Implement proper accessibility features
- Write comprehensive tests for tool logic

## Design Principles

### Core Values
- **Privacy First**: All data processing happens locally
- **Frontend Priority**: Basic functions work offline
- **Zero Configuration**: No software installation required
- **Modular Architecture**: Independent tool development
- **Progressive Enhancement**: Core functionality first

### Technical Constraints
- First load: < 2 seconds
- Tool startup: < 1 second  
- File processing: ≤ 100MB files
- Memory limit: < 500MB per tool
- Browser support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your tool following the project structure
4. Add comprehensive tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
