# UUID Generator - Design Specification

## Overview

A clean, minimalist UUID generator tool for developers. Focuses on the most common use cases with a simple, intuitive interface. Generates UUIDs instantly with one-click copying and essential format options.

## Core Features (Simplified)

### UUID Version Support
- **UUID v4**: Random generation (default, most common)
- **UUID v1**: Time-based with MAC address
- **UUID v7**: Unix timestamp-based (modern alternative)

### Generation Options
- **Single Generation**: Generate one UUID (default)
- **Batch Generation**: Generate 2-100 UUIDs
- **One-Click Generate**: Instant generation with spacebar or click

### Output Formats
- **Standard**: `550e8400-e29b-41d4-a716-446655440000` (default)
- **Uppercase**: `550E8400-E29B-41D4-A716-446655440000`
- **No Hyphens**: `550e8400e29b41d4a716446655440000`
- **Braces**: `{550e8400-e29b-41d4-a716-446655440000}`

### Essential Features
- **One-Click Copy**: Click any UUID to copy instantly
- **Bulk Copy**: Copy all generated UUIDs at once
- **Format Toggle**: Quick format switching
- **Clear All**: Reset with one click

## UI Layout Design (Simplified)

### Main Interface - Clean & Minimal
```
┌─────────────────────────────────────────────────────────────┐
│ UUID Generator                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [v4 Random ▼] [Standard ▼] Qty: [1] [Generate UUID]        │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 550e8400-e29b-41d4-a716-446655440000                   │ │
│ │ Click to copy                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Copy All] [Clear] [Generate More]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Batch Mode (When Qty > 1)
```
┌─────────────────────────────────────────────────────────────┐
│ UUID Generator                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [v4 Random ▼] [Standard ▼] Qty: [5] [Generate UUIDs]       │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 550e8400-e29b-41d4-a716-446655440000                   │ │
│ │ 6ba7b810-9dad-11d1-80b4-00c04fd430c8                   │ │
│ │ 6ba7b811-9dad-11d1-80b4-00c04fd430c8                   │ │
│ │ 7c9e6679-7425-40de-944b-e07fc1f90ae7                   │ │
│ │ 886313e1-3b8a-5372-9b90-0c9aee199e5d                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Copy All] [Clear] [Generate More]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Required Components Analysis

### shadcn/ui Components Needed
Based on the project's existing components, we need:

**Already Available:**
- ✅ `Button` - For generate, copy, clear actions
- ✅ `Card` - Main container
- ✅ `Select` - Version and format dropdowns  
- ✅ `Input` - Quantity input
- ✅ `Badge` - Version indicators

**Need to Install:**
```bash
npx shadcn@latest add textarea
npx shadcn@latest add toast
```

### Component Usage Plan
- **Card**: Main container with clean borders
- **Button**: Primary actions (Generate, Copy All, Clear)
- **Select**: Version (v4/v1/v7) and Format dropdowns
- **Input**: Quantity input (1-100)
- **Textarea**: Display generated UUIDs (readonly, monospace)
- **Toast**: Copy confirmation feedback

## Technical Implementation (Simplified)

### Core Data Structures

```typescript
interface UUIDConfig {
  version: 1 | 4 | 7;  // Simplified to 3 most useful versions
  quantity: number;    // 1-100 range
  format: UUIDFormat;
}

interface GeneratedUUID {
  id: string;
  uuid: string;
  version: number;
  format: UUIDFormat;
  timestamp: Date;
}

interface UUIDGeneratorState {
  config: UUIDConfig;
  generatedUUIDs: GeneratedUUID[];
  isGenerating: boolean;
}

type UUIDFormat = 
  | 'standard'      // 550e8400-e29b-41d4-a716-446655440000
  | 'uppercase'     // 550E8400-E29B-41D4-A716-446655440000
  | 'no-hyphens'    // 550e8400e29b41d4a716446655440000
  | 'braces';       // {550e8400-e29b-41d4-a716-446655440000}
```

### UUID Generation Engine (Simplified)

```typescript
class UUIDGenerator {
  private crypto: Crypto;
  
  constructor() {
    this.crypto = window.crypto;
  }
  
  // UUID v4: Random (most common)
  generateV4(): string {
    const bytes = new Uint8Array(16);
    this.crypto.getRandomValues(bytes);
    
    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    
    return this.bytesToUUID(bytes);
  }
  
  // UUID v1: Time-based (simplified)
  generateV1(): string {
    const timestamp = BigInt(Date.now()) * 10000n + 122192928000000000n;
    const randomBytes = new Uint8Array(10);
    this.crypto.getRandomValues(randomBytes);
    
    const bytes = new Uint8Array(16);
    
    // Timestamp (simplified)
    const timestampHex = timestamp.toString(16).padStart(16, '0');
    for (let i = 0; i < 8; i++) {
      bytes[i] = parseInt(timestampHex.slice(i * 2, i * 2 + 2), 16);
    }
    
    // Version and variant
    bytes[6] = (bytes[6] & 0x0f) | 0x10; // Version 1
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    
    // Random node and clock sequence
    for (let i = 8; i < 16; i++) {
      bytes[i] = randomBytes[i - 8];
    }
    
    return this.bytesToUUID(bytes);
  }
  
  // UUID v7: Unix timestamp-based
  generateV7(): string {
    const timestamp = BigInt(Date.now());
    const randomBytes = new Uint8Array(10);
    this.crypto.getRandomValues(randomBytes);
    
    const bytes = new Uint8Array(16);
    
    // 48-bit timestamp
    bytes[0] = Number((timestamp >> 40n) & 0xffn);
    bytes[1] = Number((timestamp >> 32n) & 0xffn);
    bytes[2] = Number((timestamp >> 24n) & 0xffn);
    bytes[3] = Number((timestamp >> 16n) & 0xffn);
    bytes[4] = Number((timestamp >> 8n) & 0xffn);
    bytes[5] = Number(timestamp & 0xffn);
    
    // Version and random data
    bytes[6] = (randomBytes[0] & 0x0f) | 0x70; // Version 7
    bytes[7] = randomBytes[1];
    bytes[8] = (randomBytes[2] & 0x3f) | 0x80; // Variant 10
    
    // Remaining random bytes
    for (let i = 9; i < 16; i++) {
      bytes[i] = randomBytes[i - 6];
    }
    
    return this.bytesToUUID(bytes);
  }
  
  // Generate multiple UUIDs
  generateBatch(config: UUIDConfig): GeneratedUUID[] {
    const results: GeneratedUUID[] = [];
    
    for (let i = 0; i < config.quantity; i++) {
      let uuid: string;
      
      switch (config.version) {
        case 1: uuid = this.generateV1(); break;
        case 7: uuid = this.generateV7(); break;
        default: uuid = this.generateV4();
      }
      
      const formattedUUID = this.formatUUID(uuid, config.format);
      
      results.push({
        id: `uuid-${i}`,
        uuid: formattedUUID,
        version: config.version,
        format: config.format,
        timestamp: new Date()
      });
    }
    
    return results;
  }
  
  // Format conversion
  formatUUID(uuid: string, format: UUIDFormat): string {
    const clean = uuid.replace(/[^0-9a-f]/gi, '').toLowerCase();
    const formatted = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`;
    
    switch (format) {
      case 'standard': return formatted;
      case 'uppercase': return formatted.toUpperCase();
      case 'no-hyphens': return clean;
      case 'braces': return `{${formatted}}`;
      default: return formatted;
    }
  }
  
  // Helper method
  private bytesToUUID(bytes: Uint8Array): string {
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
}
```

## Component Architecture (Simplified)

### Main UUID Generator Component
```typescript
// tools/uuid-generator/ui.tsx
export default function UUIDGenerator() {
  const [state, setState] = useState<UUIDGeneratorState>(initialState);
  const generator = useRef(new UUIDGenerator());
  
  const handleGenerate = useCallback(() => {
    setState(s => ({ ...s, isGenerating: true }));
    
    try {
      const results = generator.current.generateBatch(state.config);
      setState(s => ({
        ...s,
        generatedUUIDs: results,
        isGenerating: false
      }));
    } catch (error) {
      setState(s => ({ ...s, isGenerating: false }));
      console.error('UUID generation failed:', error);
    }
  }, [state.config]);
  
  const handleCopyAll = useCallback(() => {
    const allUUIDs = state.generatedUUIDs.map(u => u.uuid).join('\n');
    navigator.clipboard.writeText(allUUIDs);
    // Show toast notification
  }, [state.generatedUUIDs]);
  
  const handleCopyUUID = useCallback((uuid: string) => {
    navigator.clipboard.writeText(uuid);
    // Show toast notification
  }, []);
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>UUID Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Select value={state.config.version.toString()} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">v4 Random</SelectItem>
              <SelectItem value="1">v1 Time</SelectItem>
              <SelectItem value="7">v7 Unix</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={state.config.format} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="uppercase">Uppercase</SelectItem>
              <SelectItem value="no-hyphens">No Hyphens</SelectItem>
              <SelectItem value="braces">Braces</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Qty:</span>
            <Input 
              type="number" 
              min="1" 
              max="100" 
              value={state.config.quantity}
              onChange={handleQuantityChange}
              className="w-16"
            />
          </div>
          
          <Button onClick={handleGenerate} disabled={state.isGenerating}>
            {state.config.quantity === 1 ? 'Generate UUID' : 'Generate UUIDs'}
          </Button>
        </div>
        
        {/* Output */}
        {state.generatedUUIDs.length > 0 && (
          <div className="space-y-4">
            <div className="border rounded-md p-4 bg-muted/30">
              {state.generatedUUIDs.map((item) => (
                <div 
                  key={item.id}
                  className="font-mono text-sm py-1 cursor-pointer hover:bg-accent rounded px-2 -mx-2"
                  onClick={() => handleCopyUUID(item.uuid)}
                  title="Click to copy"
                >
                  {item.uuid}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyAll}>
                Copy All
              </Button>
              <Button variant="outline" onClick={handleClear}>
                Clear
              </Button>
              <Button variant="outline" onClick={handleGenerate}>
                Generate More
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Key Design Decisions
- **Single Component**: No complex sub-components, everything in one file
- **Inline Controls**: All controls in a single row for quick access
- **Click to Copy**: Direct interaction - click any UUID to copy
- **Minimal State**: Only essential state management
- **Clean Layout**: Generous spacing, clear visual hierarchy

## User Experience Features

### Keyboard Shortcuts
- **Spacebar**: Generate new UUID(s)
- **Ctrl+C**: Copy all UUIDs
- **Ctrl+Enter**: Generate more
- **Escape**: Clear all

### Visual Feedback
- **Hover Effects**: UUIDs highlight on hover
- **Click Feedback**: Brief visual feedback on copy
- **Toast Notifications**: "Copied to clipboard" messages
- **Loading States**: Button disabled during generation

### Responsive Design
- **Mobile**: Stacked controls, larger touch targets
- **Tablet**: Compact horizontal layout
- **Desktop**: Full horizontal control bar

## Performance & Security

### Performance
- **Instant Generation**: 1-100 UUIDs generate immediately
- **Memory Efficient**: Clear old UUIDs automatically
- **Lightweight**: Minimal dependencies

### Security
- **Crypto API**: Uses `window.crypto.getRandomValues()`
- **Local Only**: No network requests
- **No Tracking**: No analytics or data collection

## Accessibility

### Essential Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **High Contrast**: Works with system themes
- **Focus Management**: Clear focus indicators

## Installation Commands

```bash
# Install required components
npx shadcn@latest add textarea
npx shadcn@latest add toast

# Existing components (already available)
# - button, card, select, input, badge
```

---

**Implementation Priority**: High-value utility with minimal complexity. Perfect for validating the framework's simplicity and developer experience. 