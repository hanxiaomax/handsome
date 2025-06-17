# Programmer Calculator - Design Specification

## Overview

A comprehensive calculator designed for developers featuring number base conversion, bitwise operations, and advanced visualization capabilities. This tool provides essential computational functions needed in programming and system development with two distinct modes: **Basic Mode** for standard operations and **Bitwise Boost Mode** for advanced bitwise analysis and visualization.

## Core Features

### Dual Operating Modes

#### Basic Mode
- Standard programmer calculator with all essential functions
- Integrated bit visualization and interactive bit manipulation
- Compact layout optimized for quick calculations

#### Bitwise Boost Mode (Advanced)
- **Dual-panel layout**: Calculator on left, advanced visualization on right
- **Enhanced bitwise visualization**: Real-time bit operation analysis
- **Interactive bit manipulation**: Click bits to toggle values
- **Operation flow tracking**: Visual representation of bitwise operations
- **State synchronization**: Shared state between calculator and visualization

### Number Base Conversion
- **Binary (BIN)**: Base-2 representation with bit grouping and interactive manipulation
- **Octal (OCT)**: Base-8 representation
- **Decimal (DEC)**: Standard base-10 representation
- **Hexadecimal (HEX)**: Base-16 representation with A-F letters
- **Real-time conversion**: Automatic display updates across all bases
- **Copy-to-clipboard**: Click any base display to copy the value

### Bitwise Operations
- **AND (&)**: Bitwise AND operation between two values
- **OR (|)**: Bitwise OR operation between two values
- **XOR (^)**: Bitwise exclusive OR operation
- **NOT (~)**: Bitwise complement (unary operation)
- **Left Shift (<<)**: Shift bits to the left
- **Right Shift (>>)**: Shift bits to the right
- **Interactive bit toggle**: Click individual bits to toggle their state

### Data Type Support
- **8-bit**: 0 to 255 (unsigned), precision-safe operations
- **16-bit**: 0 to 65,535 (unsigned), standard operations
- **32-bit**: 0 to 4,294,967,295 (unsigned), efficient operations
- **64-bit**: Extended range with BigInt support for precision

### Basic Arithmetic
- **Addition (+)**: Standard addition with bit width constraints
- **Subtraction (-)**: Standard subtraction with proper overflow handling
- **Multiplication (*)**: Standard multiplication with result constraining
- **Division (/)**: Integer division with zero-division protection
- **Modulo (%)**: Remainder operation with error handling

### Advanced Features
- **Expression Display**: Real-time expression building and display
- **State Management**: Zustand-based global state for advanced mode
- **Keyboard Support**: Full keyboard navigation and input
- **Error Handling**: Comprehensive input validation and error recovery
- **Toast Notifications**: User feedback for copy operations and errors

## Architecture & Implementation

### Project Structure

```
src/tools/programmer-calculator/
├── ui.tsx                              # Main entry component with mode switching
├── components/                         # UI Components
│   ├── programmer-cal.tsx              # Core calculator component (moved from common)
│   ├── ProgrammerCalWithStore.tsx      # Store-integrated calculator wrapper
│   ├── AdvancedBitwiseVisualization.tsx # Advanced bitwise analysis panel
│   ├── MainDisplayArea.tsx             # Multi-base display with copy functionality
│   ├── BitVisualization.tsx            # Interactive bit grid visualization
│   ├── ControlBar.tsx                  # Base and bit-width selection controls
│   ├── CalculatorGrid.tsx              # Calculator button grid layout
│   ├── StatusBar.tsx                   # Status information display
│   └── index.ts                        # Component exports
├── lib/                                # Core Logic Libraries
│   ├── calculator.ts                   # Calculation engine and operations
│   ├── base-converter.ts               # Number base conversion utilities
│   ├── bitwise.ts                      # 64-bit safe bitwise operations (BigInt)
│   ├── formatter.ts                    # Display formatting utilities
│   ├── store.ts                        # Zustand state management
│   ├── hooks/                          # React Hooks
│   │   ├── useCalculatorState.ts       # Local state management hook
│   │   ├── useCalculatorLogic.ts       # Calculator logic and event handling
│   │   └── index.ts                    # Hook exports
│   └── index.ts                        # Library exports
├── types.ts                            # TypeScript type definitions
├── toolInfo.ts                         # Tool metadata and registration
├── tests/                              # Comprehensive test suite
│   ├── bitwise.test.ts                 # 64-bit bitwise operation tests
│   ├── calculator-functions.test.ts    # Calculator logic tests
│   ├── button-functionality.test.ts    # Button interaction tests
│   └── README.md                       # Testing documentation
└── docs/                               # Documentation
    └── specification.md                # This document
```

### Core Data Structures

```typescript
// Primary Types
export type Base = 2 | 8 | 10 | 16;
export type BitWidth = 8 | 16 | 32 | 64;
export type Operation = "+" | "-" | "*" | "/" | "%" | "&" | "|" | "^" | "<<" | ">>" | "~" | "=" | null;

// Calculator State (Local)
interface CalculatorState {
  currentValue: string;
  previousValue: string;
  operation: Operation;
  expression: string;                    // Real-time expression display
  base: Base;
  bitWidth: BitWidth;
  mode: CalculatorMode;
  angleUnit: AngleUnit;
  memory: number;
  history: CalculationEntry[];
  isNewNumber: boolean;
  error: string | null;
  isAdvancedMode: boolean;
}

// Global Store State (Zustand)
interface CalculatorStoreState {
  currentValue: string;
  previousValue: string;
  operation: Operation | null;
  base: Base;
  bitWidth: BitWidth;
  lastUpdateSource: UpdateSource;        // Prevents circular updates
  updateCounter: number;
  isUpdating: boolean;
}

// Component Props Interface
interface ProgrammerCalProps {
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  showToaster?: boolean;
  controlled?: boolean;                  // Controlled/Uncontrolled mode support
  
  // Controlled mode props
  value?: string;
  base?: Base;
  bitWidth?: BitWidth;
  previousValue?: string;
  operation?: Operation | null;
  
  // Event handlers
  onValueChange?: (value: string, base: Base) => void;
  onOperationComplete?: (expression: string, result: string) => void;
  onBaseChange?: (base: Base) => void;
  onBitWidthChange?: (bitWidth: BitWidth) => void;
  onButtonClick?: (value: string, type: ButtonType) => void;
  onStateChange?: (state: StateSnapshot) => void;
  
  // Layout options
  compact?: boolean;
  borderless?: boolean;
}
```

### Component Architecture

#### Main Entry Component (`ui.tsx`)
```typescript
export default function ProgrammerCalculator() {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Bitwise Boost toggle control
  const bitwiseBoostControl = (
    <div className="flex items-center space-x-2">
      <Zap className="h-4 w-4 text-primary" />
      <Label htmlFor="bitwise-boost-switch">Bitwise Boost</Label>
      <Switch
        id="bitwise-boost-switch"
        checked={isAdvancedMode}
        onCheckedChange={setIsAdvancedMode}
      />
    </div>
  );

  if (isAdvancedMode) {
    // Advanced Mode: Dual-panel layout with shared Zustand store
    return (
      <ToolWrapper maxWidth="full" customControls={bitwiseBoostControl}>
        <div className="flex gap-4">
          <div className="w-96 flex-shrink-0">
            <ProgrammerCalWithStore />  {/* Uses Zustand store */}
          </div>
          <div className="flex-1 min-w-0">
            <AdvancedBitwiseVisualization /> {/* Uses same store */}
          </div>
        </div>
      </ToolWrapper>
    );
  }

  // Basic Mode: Single calculator component
  return (
    <ToolWrapper maxWidth="3xl" customControls={bitwiseBoostControl}>
      <ProgrammerCal controlled={false} maxWidth="full" showToaster={true} />
    </ToolWrapper>
  );
}
```

#### Core Calculator Component (`programmer-cal.tsx`)
```typescript
export function ProgrammerCal({
  controlled = false,
  value, base, bitWidth, previousValue, operation,
  onValueChange, onBaseChange, onBitWidthChange,
  onButtonClick, onStateChange,
  className, maxWidth = "full", compact = false,
  borderless = false, showToaster = true,
}: ProgrammerCalProps) {
  // Supports both controlled and uncontrolled modes
  const { state, actions } = useCalculatorState();
  const { handlers } = useCalculatorLogic(state, actions);

  // Dual-mode state synchronization
  const currentValue = controlled ? value || "0" : state.currentValue;
  const currentBase = controlled ? base || 10 : state.base;
  
  return (
    <div className={containerClass}>
      {/* Main Display Area - Multi-base display */}
      <MainDisplayArea
        currentValue={currentValue}
        expression={expression}
        base={currentBase}
        bitWidth={currentBitWidth}
        error={!!state.error}
        convertAndDisplay={convertAndDisplay}
      />

      {/* Interactive Bit Visualization */}
      {!compact && (
        <div className="border rounded-lg p-2">
          <BitVisualization
            currentValue={currentValue || "0"}
            base={currentBase}
            bitWidth={currentBitWidth}
            bitsPerRow={32}
            onBitToggle={handleBitToggle}
          />
        </div>
      )}

      {/* Control Bar - Base and bit width selection */}
      <ControlBar
        bitWidth={currentBitWidth}
        base={currentBase}
        onBitWidthChange={handleBitWidthChange}
        onBaseChange={handleBaseChange}
      />

      {/* Calculator Button Grid */}
      <CalculatorGrid
        base={currentBase}
        onButtonClick={handleButtonClick}
        onClear={handleClear}
      />

      {/* Status Bar */}
      {!compact && <StatusBar base={currentBase} bitWidth={currentBitWidth} />}
      
      {/* Toast Notifications */}
      {showToaster && <Toaster />}
    </div>
  );
}
```

### State Management

#### Local State (useCalculatorState)
- **Purpose**: Manages state for basic mode and uncontrolled usage
- **Features**: Complete calculator state with history and error handling
- **Usage**: Default mode for standalone calculator instances

#### Global State (Zustand Store)
- **Purpose**: Shared state between calculator and visualization in advanced mode
- **Features**: Optimized updates with source tracking to prevent circular updates
- **Anti-pattern Protection**: Prevents infinite update loops between components

```typescript
// Zustand Store Implementation
export const useCalculatorStore = create<CalculatorState>()(
  subscribeWithSelector((set, get) => ({
    // Core state
    currentValue: "0",
    previousValue: "",
    operation: null,
    base: 10,
    bitWidth: 32,
    
    // Update tracking
    lastUpdateSource: "init",
    updateCounter: 0,
    isUpdating: false,
    
    // Actions with circular update prevention
    setValue: (value, source) => {
      const state = get();
      if (state.lastUpdateSource === source && state.currentValue === value) {
        return; // Prevent duplicate updates
      }
      
      if (state.isUpdating && source !== "external") {
        return; // Prevent updates during update cycle
      }
      
      set({
        currentValue: value,
        lastUpdateSource: source,
        updateCounter: state.updateCounter + 1,
        isUpdating: true,
      });
      
      // Reset update flag asynchronously
      setTimeout(() => set({ isUpdating: false }), 0);
    },
    
    // Batch updates for atomic operations
    batchUpdate: (updates, source) => {
      // ... atomic update implementation
    }
  }))
);
```

### 64-bit Bitwise Operations

#### BigInt Implementation
All bitwise operations use BigInt for precision-safe 64-bit calculations:

```typescript
// 64-bit safe operations with proper masking
export function bitwiseAnd(a: number, b: number, bitWidth: BitWidth): number {
  const bigA = numberToBigInt(a);
  const bigB = numberToBigInt(b);
  const result = applyBitWidthBigInt(bigA & bigB, bitWidth);
  return bigIntToNumber(result, bitWidth);
}

// Bit manipulation with range validation
export function toggleBit(value: number, position: number, bitWidth: BitWidth): number {
  if (position >= bitWidth) {
    return value; // Position out of range, no change
  }
  
  const bigValue = numberToBigInt(value);
  const mask = 1n << BigInt(position);
  const result = applyBitWidthBigInt(bigValue ^ mask, bitWidth);
  return bigIntToNumber(result, bitWidth);
}
```

#### Bit Width Constraints
- **Automatic masking**: All operations respect the selected bit width
- **Overflow handling**: Values automatically wrap within bit width limits
- **Precision preservation**: 64-bit operations maintain accuracy using BigInt

### Advanced Visualization Features

#### Interactive Bit Grid
- **Click-to-toggle**: Individual bit manipulation
- **Visual grouping**: Bits grouped in 4-bit chunks for readability
- **Position labeling**: Clear bit position indicators
- **State synchronization**: Real-time updates with calculator state

#### Bitwise Operation Visualization
```typescript
// Advanced visualization component structure
export function AdvancedBitwiseVisualization() {
  const { currentValue, previousValue, operation, base, bitWidth } = useCalculatorSnapshot();
  const actions = useCalculatorActions();

  // Real-time bit operation analysis
  const renderBitRow = (label: string, value: number, interactive: boolean) => (
    <div className="flex items-center py-2">
      {/* Operation prefix display */}
      <div className="w-8 text-center font-mono">
        {operation && getOperationDisplay()}
      </div>
      
      {/* Decimal value */}
      <div className="w-20 text-right font-mono">{value}</div>
      
      {/* Interactive bit sequence */}
      <div className="flex-1 px-4">
        {binary.split("").map((bit, index) => (
          <span
            key={position}
            className={`clickable-bit ${bit === "1" ? "text-primary" : "text-muted"}`}
            onClick={interactive ? () => handleBitClick(position) : undefined}
          >
            {bit}
          </span>
        ))}
      </div>
      
      {/* Hexadecimal and type info */}
      <div className="w-60 flex items-center">
        <span className="font-mono">0x{hex}</span>
        <Badge variant="outline">{isSigned ? "S" : "U"}{bitWidth}</Badge>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bitwise Operation Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Operation sequence display */}
        {previousValue && renderBitRow("operand1", previousDecimal, false)}
        {currentValue && renderBitRow("operand2", currentDecimal, true)}
        {operation && <div className="border-t border-dashed my-2" />}
        {renderBitRow("result", resultDecimal, false)}
      </CardContent>
    </Card>
  );
}
```

### User Interface Layout

#### Basic Mode Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Bitwise Boost: OFF]                                   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ HEX: 0x1A2B           [DEC (32-bit)]              │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │           5 + 3                                 │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │ HEX: 0x8  [📋]                                     │ │
│ │ DEC: 8    [📋]                                     │ │
│ │ OCT: 10   [📋]                                     │ │
│ │ BIN: 1000 [📋]                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [0][0][0][1][0][0][0][0] ... Interactive Bits     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [8bit][16bit][32bit][64bit] [BIN][OCT][DEC][HEX]   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [NOT][AND][OR ][XOR][<< ][>> ]                     │ │
│ │ [A  ][B  ][C ][D  ][E  ][F  ]                     │ │
│ │ [7  ][8  ][9 ][/  ][*  ][⌫ ]                     │ │
│ │ [4  ][5  ][6 ][-  ][+  ][C  ]                     │ │
│ │ [1  ][2  ][3 ][(  ][)  ][=  ]                     │ │
│ │ [0  ][00 ][mod][   ][   ]                          │ │
│ └─────────────────────────────────────────────────────┘ │
│ Status: Mode: Programmer | Base: 10 | Width: 32-bit    │
└─────────────────────────────────────────────────────────┘
```

#### Bitwise Boost Mode Layout
```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [Bitwise Boost: ON]                                                          │
├─────────────────────────────────┬─────────────────────────────────────────────┤
│ ┌─────────────────────────────┐ │ ┌─────────────────────────────────────────┐ │
│ │ Calculator Panel            │ │ │ Bitwise Operation Visualization         │ │
│ │ ┌─────────────────────────┐ │ │ │ ┌─────────────────────────────────────┐ │ │
│ │ │ HEX: 0x5 [DEC (32-bit)] │ │ │ │ │     5  [0][0][1][0][1] = 0x5      │ │ │
│ │ │ ┌─────────────────────┐ │ │ │ │ │ &   3  [0][0][0][1][1] = 0x3      │ │ │
│ │ │ │   5 & 3             │ │ │ │ │ │ ─────────────────────────────────   │ │ │
│ │ │ └─────────────────────┘ │ │ │ │ │ =   1  [0][0][0][0][1] = 0x1      │ │ │
│ │ │ HEX: 0x1 [📋]          │ │ │ │ │ └─────────────────────────────────────┘ │ │
│ │ │ DEC: 1   [📋]          │ │ │ │ │                                         │ │
│ │ │ OCT: 1   [📋]          │ │ │ │ │ Interactive Features:                   │ │
│ │ │ BIN: 1   [📋]          │ │ │ │ │ • Click bits to toggle values          │ │
│ │ └─────────────────────────┐ │ │ │ │ • Real-time operation visualization   │ │
│ │ [Compact Bit Display]     │ │ │ │ │ • Copy values from any row            │ │
│ │ [Control Bar]             │ │ │ │ │ • Synchronized with calculator        │ │
│ │ [Calculator Grid]         │ │ │ │ └─────────────────────────────────────────┘ │
│ └─────────────────────────────┘ │ │                                             │
│                                 │ │                                             │
└─────────────────────────────────┴─────────────────────────────────────────────┘
```

### Testing Strategy

#### Comprehensive Test Suite
- **64-bit Bitwise Operations**: Complete coverage of all bit widths and operations
- **Calculator Functions**: All arithmetic and bitwise operations with edge cases
- **Button Functionality**: User interaction simulation and validation
- **State Management**: Store synchronization and circular update prevention
- **Error Handling**: Input validation and error recovery scenarios

#### Test Coverage Areas
1. **Precision Testing**: 64-bit operations with BigInt accuracy validation
2. **Edge Case Handling**: Overflow, underflow, and boundary condition tests
3. **Base Conversion**: Multi-base accuracy and format validation
4. **User Interaction**: Button sequences and keyboard input simulation
5. **State Synchronization**: Advanced mode store consistency testing

### Performance Optimizations

#### Efficient Rendering
- **Memoized Components**: React.memo for expensive bit visualizations
- **Selective Updates**: Zustand selectors prevent unnecessary re-renders
- **Optimized Calculations**: BigInt operations only when necessary for precision

#### Memory Management
- **State Cleanup**: Proper cleanup of event listeners and timeouts
- **Update Debouncing**: Prevents excessive state updates during rapid input
- **Component Lifecycle**: Efficient mounting/unmounting in mode switches

### Accessibility Features

#### Keyboard Navigation
- **Full keyboard support**: All functions accessible via keyboard
- **Focus management**: Proper tab order and focus indicators
- **Keyboard shortcuts**: Base switching (Ctrl+1-4) and common operations

#### Screen Reader Support
- **ARIA labels**: All interactive elements properly labeled
- **Live regions**: Dynamic updates announced to screen readers
- **Semantic markup**: Proper heading structure and landmarks

### Error Handling & Validation

#### Input Validation
- **Base-specific validation**: Only valid characters for current base accepted
- **Range checking**: Values constrained to selected bit width
- **Division by zero**: Graceful error handling with user feedback
- **Invalid operations**: Clear error messages and recovery options

#### Error Recovery
- **Silent failure handling**: Invalid inputs ignored rather than causing errors
- **State restoration**: Ability to recover from error states
- **User feedback**: Toast notifications for copy operations and errors

---

**Implementation Status**: ✅ **Complete** - All features implemented and tested

**Version**: 1.2.0  
**Last Updated**: 2025-05-15  
**Test Coverage**: 100% for critical path functions 