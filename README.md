# Tool Suite Website

A modern, privacy-first collection of web-based development and office tools. All processing happens locally in the browser with no data transmission to servers.

## Features

- **Privacy First**: Local data processing only
- **Offline Ready**: Core functionality works without internet
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: System theme support
- **Accessible**: WCAG 2.1 compliant design

## Tools

### Core Tool (MVP)
- **Programmer Calculator** - Advanced calculator for developers with base conversion, bitwise operations, and multiple data types

### Coming Soon
- Base64 Encoder/Decoder
- JSON Formatter
- Hash Calculator (MD5, SHA1, SHA256, SHA512)
- QR Code Generator
- Image Processing
- PDF Tools
- Code Formatters
- Network Utilities

## Technology Stack

- **React 18.2.0** + **TypeScript 5.5+**
- **Vite 6.3.5** for fast development and building
- **Tailwind CSS 4.0** for styling
- **shadcn/ui 2.5.0** for UI components
- **Radix UI** for accessible primitives

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Development

- **Framework Design**: See [design-specification.md](./design-specification.md) for complete design guidelines and development rules
- **Tool Specifications**: Individual tool designs are documented in the `tools/` directory
  - [Programmer Calculator](./tools/programmer-calculator-specification.md)

## License

MIT 