# Programmer Calculator - Design Specification

## Overview

A comprehensive calculator designed for developers featuring number base conversion, bitwise operations, and multiple data type support. This tool provides essential computational functions needed in programming and system development.

## Core Features

### Number Base Conversion
- **Binary (BIN)**: Base-2 representation with bit grouping
- **Octal (OCT)**: Base-8 representation
- **Decimal (DEC)**: Standard base-10 representation
- **Hexadecimal (HEX)**: Base-16 representation with A-F letters

### Bitwise Operations
- **AND**: Bitwise AND operation between two values
- **OR**: Bitwise OR operation between two values
- **XOR**: Bitwise exclusive OR operation
- **NOT**: Bitwise complement (inversion)
- **Left Shift (<<)**: Shift bits to the left
- **Right Shift (>>)**: Shift bits to the right

### Data Type Support
- **8-bit**: 0 to 255 (unsigned), -128 to 127 (signed)
- **16-bit**: 0 to 65,535 (unsigned), -32,768 to 32,767 (signed)
- **32-bit**: Standard 32-bit integer range
- **64-bit**: Extended 64-bit integer range

### Basic Arithmetic
- **Addition (+)**: Standard addition
- **Subtraction (-)**: Standard subtraction
- **Multiplication (*)**: Standard multiplication
- **Division (/)**: Integer division
- **Modulo (%)**: Remainder operation

### Memory Functions
- **Memory Store (MS)**: Store current value in memory
- **Memory Recall (MR)**: Recall value from memory
- **Memory Clear (MC)**: Clear memory
- **Memory Add (M+)**: Add current value to memory
- **Memory Subtract (M-)**: Subtract current value from memory

## UI Layout Design

### Display Panel
```
┌─────────────────────────────────────┐
│ HEX: 0x1A2B                        │
│ DEC: 6,699                         │
│ OCT: 015053                        │
│ BIN: 0001 1010 0010 1011          │
└─────────────────────────────────────┘
```

### Button Layout
```
┌─────┬─────┬─────┬─────┬─────┐
│ MC  │ MR  │ M+  │ M-  │ MS  │ Memory Functions
├─────┼─────┼─────┼─────┼─────┤
│  C  │ CE  │ ⌫   │  /  │     │ Clear Functions
├─────┼─────┼─────┼─────┼─────┤
│  7  │  8  │  9  │  *  │     │ Numbers & Operators
├─────┼─────┼─────┼─────┼─────┤
│  4  │  5  │  6  │  -  │     │
├─────┼─────┼─────┼─────┼─────┤
│  1  │  2  │  3  │  +  │     │
├─────┼─────┼─────┼─────┼─────┤
│  0  │  .  │ ±   │  =  │     │
└─────┴─────┴─────┴─────┴─────┘

┌─────┬─────┬─────┬─────┐
│ AND │ OR  │ XOR │ NOT │ Bitwise Operations
├─────┼─────┼─────┼─────┤
│ <<  │ >>  │ MOD │     │
└─────┴─────┴─────┴─────┘

┌─────┬─────┬─────┬─────┬─────┬─────┐
│  A  │  B  │  C  │  D  │  E  │  F  │ Hex Digits
└─────┴─────┴─────┴─────┴─────┴─────┘

┌─────┬─────┬─────┬─────┐
│ HEX │ DEC │ OCT │ BIN │ Base Selection
└─────┴─────┴─────┴─────┘

┌─────┬─────┬─────┬─────┐
│ 8   │ 16  │ 32  │ 64  │ Data Type (bits)
└─────┴─────┴─────┴─────┘
```

### History Panel
```
┌─────────────────────────────────────┐
│ History                        [×]  │
├─────────────────────────────────────┤
│ 15 + 27 = 42                  [Copy]│
│ HEX: 0x2A  DEC: 42  BIN: 101010    │
├─────────────────────────────────────┤
│ 0xFF & 0x0F = 15              [Copy]│
│ HEX: 0xF   DEC: 15  BIN: 1111      │
└─────────────────────────────────────┘
```

## Technical Implementation

### Core Data Structures

```typescript
interface NumberDisplay {
  binary: string;    // Binary with grouping: "0001 1010"
  octal: string;     // Octal with prefix: "0o32"
  decimal: string;   // Decimal with commas: "1,234"
  hex: string;       // Hex with prefix: "0x4D2"
}

interface CalculatorState {
  currentValue: bigint;
  previousValue: bigint;
  operation: string | null;
  dataType: 8 | 16 | 32 | 64;
  inputBase: 'bin' | 'oct' | 'dec' | 'hex';
  memory: bigint;
  history: CalculationHistory[];
  isNewNumber: boolean;
}

interface CalculationHistory {
  id: string;
  expression: string;
  result: bigint;
  timestamp: Date;
  bases: NumberDisplay;
}
```

### Calculator Engine

```typescript
class ProgrammerCalculator {
  private state: CalculatorState;
  
  // Number base conversion
  convertToBase(value: bigint, base: 'bin' | 'oct' | 'dec' | 'hex'): string {
    // Implementation for base conversion with proper formatting
  }
  
  // Bitwise operations
  bitwiseAnd(a: bigint, b: bigint): bigint {
    return a & b;
  }
  
  bitwiseOr(a: bigint, b: bigint): bigint {
    return a | b;
  }
  
  bitwiseXor(a: bigint, b: bigint): bigint {
    return a ^ b;
  }
  
  bitwiseNot(value: bigint): bigint {
    // Implement based on current data type
    return ~value & this.getDataTypeMask();
  }
  
  leftShift(value: bigint, positions: number): bigint {
    return (value << BigInt(positions)) & this.getDataTypeMask();
  }
  
  rightShift(value: bigint, positions: number): bigint {
    return value >> BigInt(positions);
  }
  
  // Data type constraints
  constrainToDataType(value: bigint, dataType: number): bigint {
    const mask = (1n << BigInt(dataType)) - 1n;
    return value & mask;
  }
  
  private getDataTypeMask(): bigint {
    return (1n << BigInt(this.state.dataType)) - 1n;
  }
  
  // Memory operations
  memoryStore(value: bigint): void {
    this.state.memory = value;
  }
  
  memoryRecall(): bigint {
    return this.state.memory;
  }
  
  memoryClear(): void {
    this.state.memory = 0n;
  }
  
  memoryAdd(value: bigint): void {
    this.state.memory = this.constrainToDataType(
      this.state.memory + value, 
      this.state.dataType
    );
  }
  
  memorySubtract(value: bigint): void {
    this.state.memory = this.constrainToDataType(
      this.state.memory - value, 
      this.state.dataType
    );
  }
}
```

## Component Architecture

### Main Calculator Component
```typescript
// tools/programmer-calculator/ui.tsx
export default function ProgrammerCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const calculator = useRef(new ProgrammerCalculator());
  
  return (
    <div className="calculator-container">
      <DisplayPanel state={state} />
      <ControlPanel 
        onDataTypeChange={handleDataTypeChange}
        onBaseChange={handleBaseChange}
      />
      <ButtonGrid onButtonClick={handleButtonClick} />
      <HistoryPanel 
        history={state.history}
        onHistoryItemClick={handleHistoryClick}
      />
    </div>
  );
}
```

### Common Components Used
- **Button**: From `@/components/ui/button` for all calculator buttons
- **Card**: From `@/components/ui/card` for main container
- **Badge**: From `@/components/ui/badge` for data type indicators
- **ScrollArea**: From `@/components/ui/scroll-area` for history panel
- **Separator**: From `@/components/ui/separator` for visual divisions

### Custom Components
- **DisplayPanel**: Multi-base number display
- **ButtonGrid**: Calculator button layout
- **HistoryPanel**: Calculation history with copy functionality
- **ControlPanel**: Data type and base selection

## Responsive Design

### Desktop Layout (≥1024px)
- Full calculator with all functions visible
- History panel on the right side
- Wide button spacing for mouse interaction

### Tablet Layout (768px-1023px)
- Compact button layout
- Collapsible history panel
- Touch-friendly button sizes

### Mobile Layout (<768px)
- Vertical stacked layout
- Swipeable panels for advanced functions
- Large touch targets
- Bottom sheet for history

## Keyboard Support

### Number Input
- **0-9**: Direct number input
- **A-F**: Hexadecimal digits (when in HEX mode)

### Operations
- **+, -, *, /**: Basic arithmetic
- **%**: Modulo operation
- **Enter/=**: Calculate result
- **Escape/C**: Clear current input
- **Backspace**: Delete last digit

### Function Keys
- **F1**: Switch to HEX mode
- **F2**: Switch to DEC mode
- **F3**: Switch to OCT mode
- **F4**: Switch to BIN mode

### Advanced Functions
- **Ctrl+M**: Memory store
- **Ctrl+R**: Memory recall
- **Ctrl+L**: Memory clear
- **Ctrl+Z**: Undo last operation
- **Ctrl+H**: Toggle history panel

## Error Handling

### Input Validation
- Invalid characters for current base
- Number overflow for selected data type
- Division by zero
- Invalid shift amounts

### Error Display
- Inline error messages below display
- Visual feedback for invalid operations
- Clear error recovery paths

## Testing Requirements

### Unit Tests
- Number base conversion accuracy
- Bitwise operation correctness
- Data type constraint validation
- Memory function behavior

### Integration Tests
- Complete calculation workflows
- Keyboard navigation
- Responsive layout behavior
- Error handling scenarios

### Accessibility Tests
- Screen reader compatibility
- Keyboard-only navigation
- High contrast mode support
- Focus management

## Performance Considerations

### Optimization Strategies
- Memoized base conversion results
- Efficient BigInt operations
- Lazy loading of history items
- Debounced input handling

### Memory Management
- Limited history item count (max 100)
- Cleanup of unused calculation objects
- Efficient string formatting for large numbers

---

**Implementation Priority**: This calculator serves as the MVP tool to validate the complete framework architecture while providing genuine value to developers. 