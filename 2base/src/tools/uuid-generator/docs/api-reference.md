# UUID Generator - API Reference

## Types and Interfaces

### Core Types

```typescript
type UUIDVersion = 1 | 4 | 7

type UUIDFormat = 'standard' | 'uppercase' | 'no-hyphens' | 'braces'

interface GeneratedUUID {
  uuid: string
  version: UUIDVersion
  format: UUIDFormat
  timestamp: number
  metadata?: {
    node?: string
    clockSeq?: number
  }
}

interface UUIDGeneratorConfig {
  version: UUIDVersion
  quantity: number
  format: UUIDFormat
}

interface UUIDGeneratorState {
  config: UUIDGeneratorConfig
  generatedUUIDs: GeneratedUUID[]
  isGenerating: boolean
}
```

### Validation Types

```typescript
interface ValidationResult {
  isValid: boolean
  version?: UUIDVersion
  format?: UUIDFormat
  error?: string
}

interface FormatValidation {
  isValid: boolean
  detectedFormat?: UUIDFormat
  normalizedUUID?: string
}
```

## Core Classes

### UUIDGenerator

The main class responsible for UUID generation and management.

```typescript
class UUIDGenerator {
  constructor()
  
  // Generation Methods
  generateV1(): string
  generateV4(): string
  generateV7(): string
  generateBatch(config: UUIDGeneratorConfig): GeneratedUUID[]
  
  // Format Methods
  formatUUID(uuid: string, format: UUIDFormat): string
  parseUUID(uuid: string): ValidationResult
  
  // Utility Methods
  validateUUID(uuid: string): boolean
  getUUIDVersion(uuid: string): UUIDVersion | null
  normalizeUUID(uuid: string): string
}
```

#### Constructor

```typescript
constructor()
```

Creates a new UUIDGenerator instance with default configuration.

**Example:**
```typescript
const generator = new UUIDGenerator()
```

#### Generation Methods

##### generateV1()

```typescript
generateV1(): string
```

Generates a version 1 (time-based) UUID.

**Returns:** `string` - The generated UUID in standard format

**Example:**
```typescript
const uuid = generator.generateV1()
// "550e8400-e29b-41d4-a716-446655440000"
```

##### generateV4()

```typescript
generateV4(): string
```

Generates a version 4 (random) UUID using cryptographically secure random numbers.

**Returns:** `string` - The generated UUID in standard format

**Example:**
```typescript
const uuid = generator.generateV4()
// "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

##### generateV7()

```typescript
generateV7(): string
```

Generates a version 7 (Unix timestamp) UUID.

**Returns:** `string` - The generated UUID in standard format

**Example:**
```typescript
const uuid = generator.generateV7()
// "01851234-5678-7abc-def0-123456789abc"
```

##### generateBatch()

```typescript
generateBatch(config: UUIDGeneratorConfig): GeneratedUUID[]
```

Generates multiple UUIDs according to the provided configuration.

**Parameters:**
- `config` (`UUIDGeneratorConfig`) - Generation configuration

**Returns:** `GeneratedUUID[]` - Array of generated UUIDs with metadata

**Example:**
```typescript
const config = {
  version: 4,
  quantity: 5,
  format: 'standard'
}
const results = generator.generateBatch(config)
```

#### Format Methods

##### formatUUID()

```typescript
formatUUID(uuid: string, format: UUIDFormat): string
```

Converts a UUID to the specified format.

**Parameters:**
- `uuid` (`string`) - The UUID to format
- `format` (`UUIDFormat`) - Target format

**Returns:** `string` - The formatted UUID

**Example:**
```typescript
const uuid = "550e8400-e29b-41d4-a716-446655440000"
const uppercase = generator.formatUUID(uuid, 'uppercase')
// "550E8400-E29B-41D4-A716-446655440000"

const nohyphens = generator.formatUUID(uuid, 'no-hyphens')
// "550e8400e29b41d4a716446655440000"

const braces = generator.formatUUID(uuid, 'braces')
// "{550e8400-e29b-41d4-a716-446655440000}"
```

##### parseUUID()

```typescript
parseUUID(uuid: string): ValidationResult
```

Parses and validates a UUID string, returning detailed information.

**Parameters:**
- `uuid` (`string`) - The UUID string to parse

**Returns:** `ValidationResult` - Validation result with metadata

**Example:**
```typescript
const result = generator.parseUUID("550e8400-e29b-41d4-a716-446655440000")
// {
//   isValid: true,
//   version: 4,
//   format: 'standard'
// }
```

#### Utility Methods

##### validateUUID()

```typescript
validateUUID(uuid: string): boolean
```

Validates if a string is a properly formatted UUID.

**Parameters:**
- `uuid` (`string`) - The string to validate

**Returns:** `boolean` - True if valid UUID

**Example:**
```typescript
const isValid = generator.validateUUID("550e8400-e29b-41d4-a716-446655440000")
// true

const isInvalid = generator.validateUUID("invalid-uuid")
// false
```

##### getUUIDVersion()

```typescript
getUUIDVersion(uuid: string): UUIDVersion | null
```

Determines the version of a UUID.

**Parameters:**
- `uuid` (`string`) - The UUID to analyze

**Returns:** `UUIDVersion | null` - The UUID version or null if invalid

**Example:**
```typescript
const version = generator.getUUIDVersion("550e8400-e29b-41d4-a716-446655440000")
// 4
```

##### normalizeUUID()

```typescript
normalizeUUID(uuid: string): string
```

Converts a UUID to the standard lowercase format with hyphens.

**Parameters:**
- `uuid` (`string`) - The UUID to normalize

**Returns:** `string` - The normalized UUID

**Example:**
```typescript
const normalized = generator.normalizeUUID("550E8400E29B41D4A716446655440000")
// "550e8400-e29b-41d4-a716-446655440000"
```

## React Component API

### Props Interface

```typescript
interface UUIDGeneratorProps {
  // No props - self-contained component
}
```

### State Management

The component uses internal state management with the following structure:

```typescript
const [state, setState] = useState<UUIDGeneratorState>(initialState)
const [copiedUUID, setCopiedUUID] = useState<string | null>(null)
const [copiedAll, setCopiedAll] = useState(false)
const [isFullscreen, setIsFullscreen] = useState(false)
```

### Event Handlers

```typescript
// Generation
const handleGenerate = useCallback(() => void, [dependencies])

// Copy functionality
const handleCopyAll = useCallback(() => void, [dependencies])
const handleCopyUUID = useCallback((uuid: string) => void, [dependencies])

// Configuration
const handleVersionChange = useCallback((value: string) => void, [dependencies])
const handleFormatChange = useCallback((value: string) => void, [dependencies])
const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => void, [dependencies])

// UI Controls
const handleClear = useCallback(() => void, [dependencies])
const handleClose = useCallback(() => void, [dependencies])
const handleMinimize = useCallback(() => void, [dependencies])
const handleFullscreen = useCallback(() => void, [dependencies])
```

## Hooks and Utilities

### Custom Hooks

```typescript
// Internal state management
const useUUIDGenerator = () => {
  // Returns state and handlers for UUID generation
}

// Clipboard operations
const useClipboard = () => {
  // Returns clipboard functionality
}
```

### Utility Functions

```typescript
// Format validation
function validateFormat(format: string): boolean

// Version validation
function validateVersion(version: number): boolean

// Quantity validation
function validateQuantity(quantity: number): boolean

// UUID pattern matching
function getUUIDPattern(format: UUIDFormat): RegExp
```

## Error Handling

### Error Types

```typescript
type UUIDGeneratorError = 
  | 'INVALID_VERSION'
  | 'INVALID_FORMAT'
  | 'INVALID_QUANTITY'
  | 'GENERATION_FAILED'
  | 'CLIPBOARD_ERROR'

interface UUIDError extends Error {
  type: UUIDGeneratorError
  details?: string
}
```

### Error Handling Examples

```typescript
try {
  const results = generator.generateBatch(config)
} catch (error) {
  if (error instanceof UUIDError) {
    switch (error.type) {
      case 'INVALID_VERSION':
        console.error('Unsupported UUID version')
        break
      case 'GENERATION_FAILED':
        console.error('Failed to generate UUID')
        break
      default:
        console.error('Unknown error:', error.message)
    }
  }
}
```

## Performance Considerations

### Batch Generation

- Optimal batch size: 1-50 UUIDs
- Large batches (>50) may cause UI lag
- Consider chunking for very large requirements

### Memory Usage

```typescript
// Efficient for small batches
const smallBatch = generator.generateBatch({ version: 4, quantity: 10, format: 'standard' })

// Consider cleanup for large operations
const largeBatch = generator.generateBatch({ version: 4, quantity: 100, format: 'standard' })
// Process and clear results periodically
```

### Browser Compatibility

| Feature | Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+ |
|---------|------------|-------------|------------|----------|
| crypto.getRandomValues() | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |
| BigInt | ✅ | ✅ | ✅ | ✅ |

## Integration Examples

### Basic Usage

```typescript
import { UUIDGenerator } from './lib'

const generator = new UUIDGenerator()

// Generate single UUID
const uuid = generator.generateV4()

// Generate batch
const batch = generator.generateBatch({
  version: 4,
  quantity: 5,
  format: 'standard'
})

// Format existing UUID
const formatted = generator.formatUUID(uuid, 'uppercase')
```

### React Integration

```typescript
import UUIDGeneratorTool from './ui'

function MyApp() {
  return (
    <div>
      <UUIDGeneratorTool />
    </div>
  )
}
```

### ToolLayout Integration

```typescript
import { ToolLayout } from '@/components/layout/tool-layout'

<ToolLayout
  toolName="UUID Generator"
  toolDescription="Generate UUIDs in various formats"
  onClose={() => navigate('/')}
  onMinimize={() => {}}
  onFullscreen={() => {}}
  isFullscreen={false}
>
  {/* UUID Generator content */}
</ToolLayout>
```

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers with ES2020+ support 