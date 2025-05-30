# Unix Timestamp Converter Tool Specification

## Overview

The Unix Timestamp Converter is a comprehensive time conversion tool that allows users to work with Unix timestamps in various formats. It provides an artistic real-time timestamp display with microsecond precision, bidirectional conversion between Unix timestamps and human-readable dates, and advanced features like date picker input and multi-timezone support.

**Target Users:**
- Developers working with Unix timestamps
- System administrators analyzing log files
- Data analysts processing time-based data
- Anyone needing quick timestamp conversions

## Core Features

### 1. Artistic Real-time Current Timestamp Display
- **Artistic Layout**: Split-screen design with gradient background and grid pattern overlay
- **Microsecond Precision**: Live display updating every second showing seconds, milliseconds, and microseconds
- **Visual Impact**: Large typography (5xl-6xl) with gradient effects and responsive design
- **Interactive Elements**: Hover-activated copy buttons for each timestamp format
- **Human Readable Time**: Large destructive-colored time display with date information
- **Timezone Info**: Automatic timezone detection and display

### 2. Enhanced Bidirectional Conversion
- **Three Input Methods**:
  - **Timestamp Input**: Direct Unix timestamp entry with format selection
  - **Date Picker**: HTML5 date picker with precise time selection (HH:MM:SS)
  - **Date String**: Free-form date string parsing
- **Swap Functionality**: One-click conversion between input and output formats
- **Auto-conversion**: Real-time conversion with 300ms debounce

### 3. Comprehensive Format Support
- **Input Formats**:
  - Seconds (1704067200)
  - Milliseconds (1704067200000)
  - Microseconds (1704067200000000)
- **Output Formats**:
  - US Format: `05/29/2025 @ 3:28pm UTC`
  - ISO 8601: `2025-05-29T15:28:02.000Z`
  - ISO Extended: `2025-05-29 15:28:02 UTC`
  - RFC 2822: `Thu, 29 May 2025 15:28:02 GMT`
  - RFC 2822 Alternative: `Thursday, 29-May-25 15:28:02 UTC`
  - RFC 3339: `2025-05-29T15:28:02+00:00`
  - Local: User's locale-specific formatting

### 4. Multi-timezone Support
- Display converted time in key timezones (UTC, EST, PST, GMT, JST, CET, IST, CST)
- Automatic timezone detection for current location
- Compact timezone display in results

### 5. Advanced Features
- **Relative Time**: Automatic display of time differences (e.g., "2 hours ago", "in 3 days")
- **Code Examples**: Toggle-able JavaScript and Python code examples
- **Copy Functionality**: One-click copy for all formats and values
- **Input Validation**: Real-time validation with error messages
- **Compact Results**: Optimized display for better space utilization

## UI Layout Design

### Current Implementation - Desktop Layout (1024px+)
```
┌─────────────────────────────────────────────────────────────────┐
│ Unix Timestamp Converter                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─── Artistic Current Timestamp Display ───────────────────┐   │
│ │ [Gradient Background with Grid Pattern]                  │   │
│ │                                                           │   │
│ │ ┌─ SECONDS ─────────┐  ┌─ HUMAN READABLE ─────────────┐  │   │
│ │ │ 1,704,067,200 [📋]│  │ 15:28:02 [📋] (destructive)  │  │   │
│ │ │                   │  │ Thu, May 29, 2025 [📋]       │  │   │
│ │ │ ┌─ MS ─┐ ┌─ μS ─┐  │  │ Asia/Shanghai                 │  │   │
│ │ │ │...[📋]│ │...[📋]│  │  └───────────────────────────────┘  │   │
│ │ │ └───────┘ └───────┘  │                                     │   │
│ │ └───────────────────┘                                     │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ┌─── Timestamp Converter ─────────────────────────────────────┐  │
│ │ Input Type: [Timestamp] [Date Picker] [Date String]        │  │
│ │                                                             │  │
│ │ ┌─ Date Picker Mode ──────────────────────────────────────┐ │  │
│ │ │ Date: [2025-05-29]    Time: [15][28][02] (HH:MM:SS)   │ │  │
│ │ └─────────────────────────────────────────────────────────┘ │  │
│ │                                            [⇄ Swap]       │  │
│ │ ┌─ Compact Results ─────────────────────────────────────────┐ │  │
│ │ │ Timestamp Formats:                                      │ │  │
│ │ │ [Seconds] [Milliseconds] [Microseconds] (grid)         │ │  │
│ │ │                                                         │ │  │
│ │ │ Standard Formats:                                       │ │  │
│ │ │ US Format: 05/29/2025 @ 3:28pm UTC        [📋]        │ │  │
│ │ │ ISO 8601: 2025-05-29T15:28:02.000Z        [📋]        │ │  │
│ │ │ RFC 2822: Thu, 29 May 2025 15:28:02 GMT   [📋]        │ │  │
│ │ │ ...                                                     │ │  │
│ │ │                                                         │ │  │
│ │ │ ┌─ Relative Time ─┐  ┌─ Key Timezones ──────────────┐  │ │  │
│ │ │ │ 2 hours ago     │  │ UTC: ...  EST: ...  PST: ... │  │ │  │
│ │ │ └─────────────────┘  └─────────────────────────────┘  │ │  │
│ │ │                                                         │ │  │
│ │ │ Code Examples: [🔄 Toggle]                             │ │  │
│ │ │ ┌─ JavaScript ────────────────────────────────────────┐ │ │  │
│ │ │ │ Math.floor(Date.now() / 1000)            [📋 Copy]│ │ │  │
│ │ │ └─────────────────────────────────────────────────────┘ │ │  │
│ │ └─────────────────────────────────────────────────────────┘ │  │
│ └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (< 768px)
```
┌─────────────────────────┐
│ Unix Timestamp Converter│
├─────────────────────────┤
│ ┌─ Current Timestamp ─┐ │
│ │ SECONDS             │ │
│ │ 1,704,067,200  [📋] │ │
│ │ ┌─ MS ─┐ ┌─ μS ─┐   │ │
│ │ │...[📋]│ │...[📋]│   │ │
│ │ └───────┘ └───────┘   │ │
│ │                     │ │
│ │ HUMAN READABLE      │ │
│ │ 15:28:02      [📋]  │ │
│ │ Thu, May 29   [📋]  │ │
│ │ Asia/Shanghai       │ │
│ └───────────────────┘ │
│                         │
│ ┌─ Converter ─────────┐ │
│ │ [Timestamp] [Picker]│ │
│ │ [Date String]       │ │
│ │                     │ │
│ │ Date: [2025-05-29]  │ │
│ │ Time: [15][28][02]  │ │
│ │            [⇄ Swap] │ │
│ │                     │ │
│ │ Results (compact):  │ │
│ │ ┌─ Formats ─────┐   │ │
│ │ │ Seconds: [📋] │   │ │
│ │ │ US: ...  [📋] │   │ │
│ │ │ ISO: ... [📋] │   │ │
│ │ └───────────────┘   │ │
│ └───────────────────┘ │
└─────────────────────────┘
```

## Technical Implementation

### Core Data Structures

```typescript
interface TimestampFormat {
  seconds: number;
  milliseconds: number;
  microseconds: number;
}

interface FormattedDate {
  iso8601: string;
  iso8601Extended: string;
  rfc2822: string;
  rfc2822Alternative: string;
  rfc3339: string;
  usFormat: string;
  locale: string;
  localeDate: string;
  localeTime: string;
  custom?: string;
}

interface TimezoneInfo {
  id: string;
  name: string;
  abbreviation: string;
  offset: string;
}

interface ConversionResult {
  input: string;
  timestamp: TimestampFormat;
  formatted: FormattedDate;
  timezones: Array<{
    timezone: TimezoneInfo;
    formatted: string;
  }>;
  relative: {
    past?: string;
    future?: string;
  };
}

interface ConverterState {
  currentTimestamp: number;
  inputValue: string;
  inputType: "timestamp" | "datetime" | "datepicker";
  selectedFormat: "seconds" | "milliseconds" | "microseconds";
  selectedDate: Date | undefined;
  selectedTime: { hour: number; minute: number; second: number };
  showCodeExamples: boolean;
  isProcessing: boolean;
  error: string | null;
}

interface CodeExample {
  language: string;
  name: string;
  code: string;
  description: string;
}
```

### Component Architecture

```typescript
// Core conversion engine
class UnixTimestampEngine {
  getCurrentTimestamp(): TimestampFormat
  convertSingleTimestamp(input: string, format: TimestampInputFormat): ConversionResult | null
  convertDateToTimestamp(input: string): ConversionResult | null
  convertDatePickerToTimestamp(date: Date, time: TimeInput): ConversionResult | null
  convertTimestampToDatePicker(timestamp: number, format: TimestampInputFormat): DateTimeResult | null
  getTimezones(): TimezoneInfo[]
  formatRelativeTime(timestamp: number): RelativeTime
  getCodeExamples(timestamp: number): CodeExample[]
  validateInput(input: string, type: InputType): boolean
  
  // Private formatting methods
  private generateFormattedDates(date: Date): FormattedDate
  private formatUSStyle(date: Date): string
  private formatRFC2822Alternative(date: Date): string
  private formatDateInTimezone(date: Date, timezoneId: string): string
}

// Component structure
UnixTimestampConverter/
├── ui.tsx                    # Main tool component with artistic design
├── toolInfo.ts              # Tool metadata
└── lib/
    ├── index.ts             # Engine exports
    ├── engine.ts            # Enhanced UnixTimestampEngine class
    └── types.ts             # Comprehensive TypeScript interfaces
```

### State Management

- **Local State**: React useState for component state
- **Real-time Updates**: useEffect with setInterval for current timestamp (1000ms)
- **Auto-conversion**: useEffect with 300ms debounce for input changes
- **Input Validation**: Real-time validation with error state management
- **Performance**: useMemo and useCallback for optimization
- **Memory Cleanup**: Proper cleanup of intervals and event listeners

## Component Requirements

Required shadcn/ui components:
- `button` - Action buttons, copy buttons, and input type selectors
- `card` - Main containers and result sections
- `input` - Text inputs, date input, and time number inputs
- `select` - Format and timezone selections
- `badge` - Relative time display and status indicators
- `switch` - Code examples toggle
- `toast` - Success/error notifications via sonner

## Installation Requirements

```bash
# Core UI components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add switch

# Additional dependencies
npm install sonner  # For toast notifications
```

## Responsive Design

### Breakpoint Strategy
- **Mobile (< 768px)**: Single column, stacked layout, compact time display
- **Tablet (768px - 1024px)**: Adaptive layout with optimized spacing
- **Desktop (> 1024px)**: Full artistic layout with side-by-side timestamp display

### Key Responsive Features
- Gradient background adapts to screen size
- Typography scales from text-5xl to text-6xl
- Grid layouts stack on mobile
- Touch-friendly button sizes (minimum 44px)
- Optimized copy button positioning

## Accessibility Features

### Keyboard Navigation
- **Tab order**: Input type selector → Date/time inputs → Swap button → Copy buttons
- **Arrow keys**: Navigate within select and number inputs
- **Enter**: Trigger conversion or copy actions
- **Escape**: Clear inputs or reset state

### Screen Reader Support
- Semantic HTML with proper headings and landmarks
- ARIA labels for all interactive elements
- ARIA live regions for timestamp updates
- Descriptive button labels and input placeholders
- Error message announcements

### Visual Accessibility
- High contrast support with CSS variables
- Minimum 16px font sizes
- Color-independent status indicators (icons + text)
- Clear focus indicators with outline
- WCAG 2.1 AA color contrast compliance

## Performance Considerations

### Optimization Strategies
- **Debouncing**: 300ms debounce for auto-conversion
- **Memoization**: useMemo for expensive date calculations
- **Callbacks**: useCallback for event handlers to prevent re-renders
- **Timezone Caching**: Static timezone data with efficient lookup
- **Bundle Optimization**: Tree shaking and lazy imports

### Memory Management
- Cleanup intervals on component unmount
- Efficient state updates with functional setState
- Minimal re-renders through proper dependency arrays
- Lightweight timestamp format storage

### Real-time Performance
- 1-second interval for timestamp updates
- Efficient time formatting with cached formatters
- Minimal DOM manipulations
- Optimized copy operations

## Testing Requirements

### Unit Tests
- Test all timestamp conversion methods accuracy
- Test input validation for all input types
- Test format generation methods
- Test timezone calculations
- Test relative time calculations
- Test code example generation

### Component Tests
- Test user input handling for all three input types
- Test copy functionality for all formats
- Test swap functionality
- Test error states and recovery
- Test responsive layout behavior
- Test keyboard navigation flows

### Integration Tests
- Test complete conversion workflows
- Test real-time timestamp updates
- Test auto-conversion behavior
- Test cross-browser compatibility
- Test accessibility compliance

## Error Handling

### Input Validation
- Invalid timestamp format detection with specific error messages
- Out-of-range timestamp handling (reasonable limits)
- Malformed date string detection with suggestions
- Empty input handling with placeholder guidance

### User Feedback
- Clear error messages with actionable suggestions
- Success notifications for copy operations
- Loading states for processing
- Graceful degradation for unsupported browsers

### Edge Cases
- Timezone transition periods handling
- Leap second considerations
- Extremely large or small timestamps
- Unicode and special characters in date strings
- Browser API availability checks

## Browser Support

- Chrome 90+ (full feature support)
- Firefox 88+ (full feature support)
- Safari 14+ (full feature support)
- Edge 90+ (full feature support)

## Success Metrics

- **Conversion Accuracy**: 100% precision for all supported ranges
- **Performance**: < 50ms for single conversions, < 1s real-time updates
- **Accessibility**: WCAG 2.1 AA compliance across all features
- **User Experience**: One-click copy operations, intuitive input methods
- **Code Quality**: 95%+ TypeScript coverage, comprehensive error handling
- **Visual Design**: Artistic yet functional interface with responsive behavior 