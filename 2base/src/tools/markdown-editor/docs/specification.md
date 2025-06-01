# Markdown Editor Tool Specification

## Overview

The Markdown Editor is a powerful, feature-rich text editor designed for creating and editing Markdown documents with real-time preview capabilities. It provides an intuitive interface for both beginners and advanced users to write, format, and preview Markdown content efficiently.

**Target Users:**
- Content creators and technical writers
- Developers documenting code and APIs
- Students and researchers taking notes
- Bloggers and documentation maintainers
- Anyone working with Markdown format

## Core Features

### 1. Real-time Editing and Preview
- Split-pane view with editor on the left and preview on the right
- Live preview updates as you type
- Synchronized scrolling between editor and preview
- Toggle between edit-only, preview-only, and split-view modes

### 2. Advanced Editor Features
- **Syntax Highlighting**: Full Markdown syntax highlighting with proper color coding
- **Line Numbers**: Optional line numbers for better navigation
- **Auto-completion**: Smart completion for Markdown syntax
- **Code Folding**: Collapse/expand sections for better document navigation
- **Search and Replace**: Find and replace text with regex support

### 3. Toolbar and Quick Actions
- **Text Formatting**: Bold, italic, strikethrough, code inline
- **Headers**: H1-H6 header insertion
- **Lists**: Ordered and unordered lists
- **Links and Images**: Quick insertion with URL input
- **Tables**: Table generator and editor
- **Code Blocks**: Language-specific code block insertion
- **Quotes**: Blockquote insertion

### 4. File Management
- **Import**: Load .md, .txt files from local system
- **Export**: Save as .md, .html, .pdf formats
- **Auto-save**: Automatic content saving to localStorage
- **Templates**: Pre-defined document templates

### 5. Advanced Features
- **Table Editor**: Visual table creation and editing
- **Math Support**: LaTeX math formula rendering
- **Mermaid Diagrams**: Flowchart and diagram support
- **TOC Generation**: Automatic table of contents
- **Word Count**: Real-time word and character count

### 6. Keyboard Shortcuts
- Standard text editing shortcuts (Ctrl+B, Ctrl+I, etc.)
- Markdown-specific shortcuts (Ctrl+K for links, etc.)
- Custom shortcuts for frequently used features
- Vim-style navigation (optional)

## UI Layout Design

### Desktop Layout (1200px+)
```
┌─────────────────────────────────────────────────────────────────┐
│ Markdown Editor                                    [🔄][📁][💾] │
├─────────────────────────────────────────────────────────────────┤
│ Toolbar: [B][I][U][H1][H2][📝][🔗][📷][📊][{ }][📋]            │
├─────────────────────────────────────────────────────────────────┤
│ Editor                          │ Preview                       │
│ ┌─────────────────────────────┐ │ ┌─────────────────────────────┐ │
│ │1 # My Document              │ │ │ My Document                 │ │
│ │2                            │ │ │ ═══════════                 │ │
│ │3 This is **bold** text      │ │ │ This is bold text           │ │
│ │4 and *italic* text.         │ │ │ and italic text.            │ │
│ │5                            │ │ │                             │ │
│ │6 ## Code Example            │ │ │ Code Example                │ │
│ │7 ```javascript              │ │ │ ───────────                 │ │
│ │8 console.log('Hello');      │ │ │ console.log('Hello');       │ │
│ │9 ```                        │ │ │                             │ │
│ │10                           │ │ │                             │ │
│ │11 | Col1 | Col2 |           │ │ │ ┌──────┬──────┐             │ │
│ │12 |------|------|           │ │ │ │ Col1 │ Col2 │             │ │
│ │13 | Data | Data |           │ │ │ ├──────┼──────┤             │ │
│ │14                           │ │ │ │ Data │ Data │             │ │
│ │15 [Cursor]                  │ │ │ └──────┴──────┘             │ │
│ │                             │ │ │                             │ │
│ └─────────────────────────────┘ │ └─────────────────────────────┘ │
├─────────────────────────────────┼─────────────────────────────────┤
│ Words: 45 | Chars: 234 | Line 15│ Scroll sync: ████████████░░░ │ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────┐
│ Markdown Editor    [⚙️] │
├─────────────────────────┤
│ [📝] [👁️] [📱]          │
├─────────────────────────┤
│ # My Document           │
│                         │
│ This is **bold** text   │
│ and *italic* text.      │
│                         │
│ ## Code Example         │
│ ```javascript           │
│ console.log('Hello');   │
│ ```                     │
│                         │
│ [Keyboard area]         │
└─────────────────────────┘
```

## Technical Implementation

### Core Data Structures

```typescript
interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  scrollPosition: number;
  isDirty: boolean;
  fileName?: string;
  lastSaved: Date | null;
}

interface EditorConfig {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  autoSave: boolean;
  vim: boolean;
  previewSync: boolean;
  previewVisible: boolean;
}

interface ToolbarAction {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut: string;
  action: (editor: EditorRef) => void;
  isActive?: (content: string, cursor: number) => boolean;
}

interface MarkdownParseResult {
  html: string;
  headings: Array<{
    level: number;
    text: string;
    id: string;
    line: number;
  }>;
  wordCount: number;
  charCount: number;
  readingTime: number;
}

interface FileImportResult {
  content: string;
  fileName: string;
  type: 'markdown' | 'text' | 'unknown';
}

interface ExportOptions {
  format: 'markdown' | 'html' | 'pdf';
  includeTOC: boolean;
  includeCSS: boolean;
  fileName?: string;
}
```

### Component Architecture

```typescript
// Core editor engine
class MarkdownEngine {
  parseMarkdown(content: string): MarkdownParseResult
  insertText(content: string, position: number, text: string): string
  formatSelection(content: string, start: number, end: number, format: string): string
  generateTOC(headings: Heading[]): string
  calculateReadingTime(content: string): number
  validateMarkdown(content: string): ValidationResult[]
}

// Main component structure
MarkdownEditor/
├── ui.tsx                    # Main editor component
├── toolInfo.ts              # Tool metadata
├── lib/
│   ├── index.ts             # Engine exports
│   ├── engine.ts            # MarkdownEngine class
│   ├── parser.ts            # Markdown parsing utilities
│   ├── formatter.ts         # Text formatting helpers
│   └── types.ts             # TypeScript interfaces
└── components/
    ├── editor-toolbar.tsx   # Formatting toolbar
    ├── editor-pane.tsx      # Code editor component
    ├── preview-pane.tsx     # Markdown preview
    ├── table-editor.tsx     # Visual table editor
    ├── file-manager.tsx     # Import/export functionality
    └── settings-panel.tsx   # Editor configuration
```

### State Management

- **Editor State**: Content, cursor position, selection using useReducer
- **Configuration**: Settings persisted to localStorage
- **File Management**: Drag-drop file handling with File API
- **Auto-save**: Debounced content saving every 30 seconds
- **Undo/Redo**: Command pattern for action history

## Component Requirements

Required shadcn/ui components:
- `button` - Toolbar buttons and actions
- `card` - Panel containers and sections
- `input` - Text inputs for links, filenames
- `textarea` - Not used (custom editor implementation)
- `select` - Format and option selections
- `switch` - Configuration toggles
- `tabs` - Mode switching and settings
- `dialog` - Import/export modals
- `tooltip` - Toolbar button hints
- `separator` - UI section dividers
- `badge` - Status indicators
- `progress` - Loading states
- `scroll-area` - Scrollable content areas

## Installation Requirements

```bash
pnpm dlx shadcn@latest add button card input select switch tabs dialog tooltip separator badge progress scroll-area
```

Additional dependencies:
```bash
pnpm add react-markdown remark-gfm remark-math rehype-katex rehype-highlight prismjs
pnpm add @types/prismjs
```

## Responsive Design

### Breakpoint Strategy
- **Mobile (< 768px)**: Stack layout, tab-based editor/preview switching
- **Tablet (768px - 1024px)**: Side-by-side panes with adjustable split
- **Desktop (> 1024px)**: Full feature layout with toolbar and dual panes

### Responsive Features
- Collapsible toolbar on mobile
- Touch-friendly button sizing
- Adaptive split ratios
- Mobile-optimized text selection
- Responsive typography and spacing

## Accessibility Features

### Keyboard Navigation
- **Tab order**: Toolbar → Editor → Preview → Settings
- **Editor shortcuts**: Standard text editing plus Markdown shortcuts
- **Focus management**: Clear focus indicators and logical flow
- **Screen reader**: ARIA labels and live regions for preview updates

### Editor Accessibility
- High contrast syntax highlighting
- Keyboard-only operation capability
- Screen reader friendly markup
- Focus trap in modal dialogs
- Semantic HTML structure

## Performance Considerations

### Optimization Strategies
- **Debounced Parsing**: 300ms delay for preview updates
- **Virtual Scrolling**: For large documents (>10k lines)
- **Code Splitting**: Lazy load preview renderers
- **Memoization**: Cache parsed results and formatting
- **Web Workers**: Heavy parsing operations in background

### Memory Management
- Limit undo history to 100 actions
- Clean up event listeners on unmount
- Dispose of syntax highlighting workers
- Monitor document size and warn at 1MB+

### Bundle Optimization
- Tree shake markdown parsers
- Lazy load syntax highlighters
- Dynamic import for export formats
- Minimize third-party dependencies

## Error Handling

### Input Validation
- Markdown syntax validation
- File type validation for imports
- Size limits for uploaded files
- Character encoding detection

### User Feedback
- Real-time syntax error highlighting
- Clear error messages for file operations
- Progress indicators for exports
- Auto-recovery for unsaved changes

### Edge Cases
- Large file handling (>5MB)
- Memory limits for preview rendering
- Network errors during file operations
- Browser compatibility for features

## Security Considerations

### Content Security
- Sanitize HTML in preview mode
- Validate file uploads
- XSS prevention in user content
- Safe handling of external links

### Data Privacy
- Local-only processing by default
- Clear data retention policies
- Secure file handling
- No server-side data transmission

## Testing Requirements

### Unit Tests
- Markdown parsing accuracy
- Text formatting functions
- File import/export operations
- Keyboard shortcut handling
- Configuration management

### Component Tests
- Editor interaction behaviors
- Toolbar functionality
- Preview rendering accuracy
- Responsive layout behavior
- Accessibility compliance

### Integration Tests
- Complete editing workflows
- File operations end-to-end
- Keyboard navigation flows
- Cross-browser compatibility
- Performance benchmarks

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Success Metrics

- Editor responsiveness: < 50ms for typing
- Preview update time: < 200ms for parsing
- File operations: < 3 seconds for 1MB files
- Accessibility: WCAG 2.1 AA compliance
- User Experience: Intuitive single-click operations 