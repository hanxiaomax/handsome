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

### Option 1: Docker Development (Recommended)

The easiest way to get started is using Docker, which provides a consistent development environment with all dependencies pre-installed.

#### Prerequisites
- Docker installed on your system
- Git (for cloning the repository)

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd handsome

# Start the development environment
bash go_docker.sh start

# Access the application at http://localhost:5173
```

#### Docker Commands
```bash
# Build the Docker image
bash go_docker.sh build

# Start development environment
bash go_docker.sh start

# Stop development environment
bash go_docker.sh stop

# Access container shell
bash go_docker.sh shell

# View logs
bash go_docker.sh logs

# Check status
bash go_docker.sh status

# Install dependencies
bash go_docker.sh install

# Run npm commands
bash go_docker.sh npm run build
bash go_docker.sh npm run lint

# Execute arbitrary commands
bash go_docker.sh exec ls -la
bash go_docker.sh exec cat package.json

# Clean up (remove container and image)
bash go_docker.sh clean

# Show help
bash go_docker.sh help
```

#### Development Workflow
1. Start the container: `bash go_docker.sh start`
2. Access the app at http://localhost:5173
3. Edit files in your host machine - changes will be reflected immediately
4. Access container shell if needed: `bash go_docker.sh shell`
5. View logs: `bash go_docker.sh logs`

### Option 2: Local Development

If you prefer to develop locally without Docker:

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

## Docker Environment Details

The Docker development environment includes:

### Pre-installed Tools
- **Node.js 18** with npm (Ubuntu-based)
- **Git** for version control
- **Development tools**: vim, nano, curl, wget
- **Shell options**: bash, zsh, fish with oh-my-zsh
- **Build tools**: gcc, g++, make, python3, python3-pip
- **System libraries**: build-essential, ca-certificates

### Global npm packages
- TypeScript, ESLint, Prettier
- Vite and related tools
- Development utilities

### Features
- **Hot reload**: File changes are automatically detected
- **Port forwarding**: Access the app at http://localhost:5173
- **Volume mounting**: Your code is synced between host and container
- **Git integration**: Your git config and SSH keys are shared
- **Non-root user**: Runs as nodejs user for security
- **Proxy support**: Automatically detects and uses local proxy settings

### Proxy Configuration
The Docker environment automatically detects and uses proxy settings if available:
- **HTTP/HTTPS Proxy**: `http://127.0.0.1:7890`
- **SOCKS Proxy**: `socks5://127.0.0.1:7890`

To customize proxy settings, edit the variables in `go_docker.sh`:
```bash
PROXY_HOST="127.0.0.1"
PROXY_HTTP_PORT="7890"
PROXY_SOCKS_PORT="7890"
```

The script automatically tests proxy connectivity and only applies proxy settings if the proxy is available.

### Network Access
The development server is configured to accept connections from any host (`--host 0.0.0.0`), allowing you to:
- Access from localhost: http://localhost:5173
- Access from other devices on your network: http://YOUR_IP:5173
- Test responsive design on mobile devices

## License

MIT 