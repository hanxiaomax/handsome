# ToolLayout Framework - Usage Examples

## Quick Start

The ToolLayout framework provides a standardized layout for all tool pages with consistent navigation, window controls, and responsive design.

**重要：默认情况下，最小化按钮不保存工具状态。只有当工具明确需要保存状态时，才需要额外实现状态管理。**

## Basic Usage

### 1. 推荐方式：使用 useToolControls Hook

最简单的工具实现（默认不保存状态）：

```typescript
import { useToolControls } from '@/hooks/use-tool-controls'
import { ToolLayout } from '@/components/layout/tool-layout'
import { toolInfo } from './toolInfo'

export default function MyTool() {
  // 使用标准化工具控制（默认不保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    // 不传递 state 参数 = 不保存状态
  });

  return (
    <ToolLayout {...toolLayoutProps}>
      {/* Your tool content here */}
    </ToolLayout>
  )
}
```

### 2. 传统方式：手动实现控制逻辑

如果需要自定义控制逻辑：

```typescript
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToolLayout } from '@/components/layout/tool-layout'
import { useMinimizedToolsActions } from '@/stores/minimized-tools-store'
import { useFavoriteActions, useIsFavorite } from '@/stores/favorites-store'
import { toolInfo } from './toolInfo'

export default function MyTool() {
  const navigate = useNavigate()
  const { minimizeTool } = useMinimizedToolsActions()
  const { toggleFavorite } = useFavoriteActions()
  const isFavorite = useIsFavorite(toolInfo.id)

  // Minimize: 不保存状态，直接最小化
  const handleMinimize = useCallback(() => {
    minimizeTool(toolInfo) // 不传递状态参数
    navigate('/tools')
  }, [minimizeTool, navigate])

  // Toggle favorite
  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(toolInfo.id)
  }, [toggleFavorite])

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onMinimize={handleMinimize}
      onToggleFavorite={handleToggleFavorite}
      isFavorite={isFavorite}
    >
      {/* Your tool content here */}
    </ToolLayout>
  )
}
```

## Complete Example 1: Simple Text Tool (不保存状态)

大多数简单工具的推荐实现：

```typescript
import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ToolLayout } from '@/components/layout/tool-layout'
import { useToolControls } from '@/hooks/use-tool-controls'
import { toolInfo } from './toolInfo'

export default function SimpleTextTool() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 使用标准化工具控制（不保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    // 不传递 state 参数 = 不保存状态
  })

  // Tool-specific functionality
  const handleProcess = useCallback(() => {
    setIsProcessing(true)
    
    // Simulate processing
    setTimeout(() => {
      setOutputText(inputText.toUpperCase())
      setIsProcessing(false)
    }, 500)
  }, [inputText])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value)
  }, [])

  return (
    <ToolLayout {...toolLayoutProps}>
      <div className="w-full p-6 space-y-6 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Text Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={handleInputChange}
              className="min-h-[120px]"
            />
            <Button 
              onClick={handleProcess}
              disabled={isProcessing || !inputText}
            >
              {isProcessing ? 'Processing...' : 'Convert to Uppercase'}
            </Button>
          </CardContent>
        </Card>

        {outputText && (
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[120px] bg-muted"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
```

## Complete Example 2: Complex Text Tool (保存状态)

当工具有复杂输入或重要工作进度时：

```typescript
import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ToolLayout } from '@/components/layout/tool-layout'
import { useToolControls } from '@/hooks/use-tool-controls'
import { useIsToolMinimized, useToolState, useMinimizedToolsActions } from '@/stores/minimized-tools-store'
import { toolInfo } from './toolInfo'

interface TextToolState {
  inputText: string
  outputText: string
  selectedMode: string
}

export default function ComplexTextTool() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedMode, setSelectedMode] = useState('uppercase')
  const [isProcessing, setIsProcessing] = useState(false)

  // 工具状态（需要保存的部分）
  const toolState: TextToolState = {
    inputText,
    outputText,
    selectedMode,
  }

  // 使用标准化工具控制（保存状态）
  const { toolLayoutProps } = useToolControls({
    toolInfo,
    state: toolState,  // 传递状态以保存
  })

  // 状态恢复逻辑
  const isMinimized = useIsToolMinimized(toolInfo.id)
  const savedState = useToolState(toolInfo.id)
  const { restoreTool } = useMinimizedToolsActions()

  useEffect(() => {
    if (isMinimized && savedState) {
      // 恢复保存的状态
      const typedState = savedState as TextToolState
      setInputText(typedState.inputText || '')
      setOutputText(typedState.outputText || '')
      setSelectedMode(typedState.selectedMode || 'uppercase')
      restoreTool(toolInfo.id)
    }
  }, [isMinimized, savedState, restoreTool])

  // Tool-specific functionality
  const handleProcess = useCallback(() => {
    setIsProcessing(true)
    
    setTimeout(() => {
      let result = inputText
      switch (selectedMode) {
        case 'uppercase':
          result = inputText.toUpperCase()
          break
        case 'lowercase':
          result = inputText.toLowerCase()
          break
        case 'reverse':
          result = inputText.split('').reverse().join('')
          break
      }
      setOutputText(result)
      setIsProcessing(false)
    }, 500)
  }, [inputText, selectedMode])

  return (
    <ToolLayout {...toolLayoutProps}>
      <div className="w-full p-6 space-y-6 mt-5">
        <Card>
          <CardHeader>
            <CardTitle>Complex Text Processor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={selectedMode === 'uppercase' ? 'default' : 'outline'}
                onClick={() => setSelectedMode('uppercase')}
              >
                Uppercase
              </Button>
              <Button
                variant={selectedMode === 'lowercase' ? 'default' : 'outline'}
                onClick={() => setSelectedMode('lowercase')}
              >
                Lowercase
              </Button>
              <Button
                variant={selectedMode === 'reverse' ? 'default' : 'outline'}
                onClick={() => setSelectedMode('reverse')}
              >
                Reverse
              </Button>
            </div>
            
            <Textarea
              placeholder="Enter your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px]"
            />
            
            <Button 
              onClick={handleProcess}
              disabled={isProcessing || !inputText}
            >
              {isProcessing ? 'Processing...' : `Convert to ${selectedMode}`}
            </Button>
          </CardContent>
        </Card>

        {outputText && (
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outputText}
                readOnly
                className="min-h-[120px] bg-muted"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  )
}
```

## Layout Features

### Header
- **Tool Name**: Automatically displayed from `toolName` prop
- **Tool Description**: Optional subtitle from `toolDescription` prop
- **Sidebar Toggle**: Consistent with main interface
- **Theme Toggle**: Dark/light mode switching

### Sidebar
- **Default State**: Collapsed on tool pages
- **Search**: Full tool search functionality
- **Navigation**: Access to all tools and categories
- **Favorites**: Consistent favorites management

### Window Controls
- **Red Button**: Close tool and return to homepage
- **Yellow Button**: Minimize to bottom drawer
- **Green Button**: Toggle fullscreen mode
- **Hover Effects**: Icons appear on hover with smooth transitions

### Content Area
- **Responsive**: Adapts to different screen sizes
- **Scrollable**: Automatic overflow handling
- **Padding**: Consistent 24px padding (`p-6`)
- **Background**: Subtle muted background

## Best Practices

### 1. State Management
```typescript
// Preserve important state when minimizing
const handleMinimize = useCallback(() => {
  minimizeTool(toolInfo, { 
    userInput: currentInput,
    settings: userSettings,
    results: processedResults
  })
  navigate('/')
}, [minimizeTool, currentInput, userSettings, processedResults, navigate])
```

### 2. Keyboard Shortcuts
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape to close
    if (e.key === 'Escape') {
      handleClose()
    }
    // Ctrl+M to minimize
    if (e.ctrlKey && e.key === 'm') {
      e.preventDefault()
      handleMinimize()
    }
    // F11 for fullscreen
    if (e.key === 'F11') {
      e.preventDefault()
      handleFullscreen()
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [handleClose, handleMinimize, handleFullscreen])
```

### 3. Error Handling
```typescript
const handleFullscreen = useCallback(() => {
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  } catch (error) {
    console.warn('Fullscreen not supported:', error)
  }
}, [])
```

### 4. Responsive Content
```typescript
return (
  <ToolLayout {...props}>
    <div className="p-6">
      {/* Use responsive grid for complex layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>...</Card>
        <Card>...</Card>
        <Card>...</Card>
      </div>
    </div>
  </ToolLayout>
)
```

## Migration from Old Layout

### Before (Custom Layout)
```typescript
export default function OldTool() {
  return (
    <div className="min-h-screen bg-background">
      <header>
        <h1>Tool Name</h1>
        <button onClick={() => navigate('/')}>Back</button>
      </header>
      <main>
        {/* Tool content */}
      </main>
    </div>
  )
}
```

### After (ToolLayout Framework)
```typescript
export default function NewTool() {
  const navigate = useNavigate()
  const { minimizeTool } = useMinimizedTools()
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Add window control handlers...

  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={() => navigate('/')}
      onMinimize={() => minimizeTool(toolInfo)}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      {/* Same tool content, just wrapped */}
    </ToolLayout>
  )
}
```

## Troubleshooting

### Common Issues

1. **Fullscreen not working**
   - Ensure you're handling the `fullscreenchange` event
   - Check browser support for Fullscreen API

2. **Minimize state not preserved**
   - Pass relevant state to `minimizeTool()` function
   - Ensure state is serializable (no functions or complex objects)

3. **Sidebar not working**
   - Verify `AppSidebar` component is properly imported
   - Check that `SidebarProvider` is wrapping the layout

4. **Window controls not visible**
   - Ensure parent container has `position: relative`
   - Check z-index conflicts with tool content

### Performance Tips

1. **Memoize handlers**
   ```typescript
   const handleClose = useCallback(() => navigate('/'), [navigate])
   ```

2. **Debounce state updates**
   ```typescript
   const debouncedMinimize = useMemo(
     () => debounce(() => minimizeTool(toolInfo, state), 300),
     [minimizeTool, state]
   )
   ```

3. **Lazy load heavy components**
   ```typescript
   const HeavyComponent = lazy(() => import('./heavy-component'))
   
```

# Tool Layout Usage Guide

## Design Principles

### Content Layout Standards
Based on the programmer calculator implementation, all tools should follow these layout guidelines:

#### 1. Main Container Structure
```typescript
<ToolLayout>
  <div className="w-full p-6 space-y-6 mt-5">
    {/* Main tool interface - NO Card wrapper */}
    <div className="space-y-6">
      {/* Tool-specific content */}
    </div>
    
    {/* Optional: Secondary content - CAN use Card */}
    <Card>
      <CardContent>
        {/* Help, shortcuts, or additional info */}
      </CardContent>
    </Card>
  </div>
</ToolLayout>
```

#### 2. Key Layout Rules
- **Top Margin**: Always use `mt-5` for proper spacing from window controls
- **Padding**: Use `p-6` for consistent content padding
- **Spacing**: Use `space-y-6` for vertical spacing between major sections
- **Width**: Use `w-full` to maximize screen usage
- **No Main Card**: Do NOT wrap the primary tool interface in a Card component

#### 3. Card Usage Policy
- **Main Tool UI**: Never wrap in Card - use direct div containers
- **Secondary Content**: Use Card only for supplementary content like:
  - Keyboard shortcuts help
  - Tool information/tips
  - Settings panels (if separate from main interface)
  - Status information

## Implementation Examples

### Simple Tool Layout
```typescript
export default function SimpleTool() {
  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Main interface */}
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Controls */}
          </div>
          <div className="border rounded-lg p-4 bg-muted/30">
            {/* Output area */}
          </div>
        </div>
        
        {/* Help section */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-2">Keyboard Shortcuts</div>
              {/* Shortcuts list */}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
```

### Complex Tool Layout (Multi-column)
```typescript
export default function ComplexTool() {
  return (
    <ToolLayout
      toolName={toolInfo.name}
      toolDescription={toolInfo.description}
      onClose={handleClose}
      onMinimize={handleMinimize}
      onFullscreen={handleFullscreen}
      isFullscreen={isFullscreen}
    >
      <div className="w-full p-6 space-y-6 mt-5">
        {/* Main interface - responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-1">
            {/* Controls and settings */}
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1">
            {/* Main interaction area */}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 xl:col-span-1">
            {/* Output or visualization */}
          </div>
        </div>

        {/* Help section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 text-sm">
              {/* Detailed help content */}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
```

## Responsive Design Guidelines

### Breakpoint Strategy
- **Mobile (< 768px)**: Single column layout
- **Tablet (768px - 1023px)**: Two column layout where appropriate
- **Desktop (≥ 1024px)**: Multi-column layouts (2-3 columns)
- **Large Desktop (≥ 1280px)**: Full multi-column layouts

### Grid Patterns
```css
/* Standard responsive grid */
grid-cols-1 lg:grid-cols-2 xl:grid-cols-3

/* For complex tools */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6

/* For help sections */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

## Component Integration

### Tool-Specific Components
Individual tool components (Display, ButtonGrid, etc.) may use their own Card wrappers internally:

```typescript
// This is OK - internal component using Card
export function Display({ value, error }: DisplayProps) {
  return (
    <Card>
      <CardContent>
        <div className="font-mono text-2xl">{value}</div>
        {error && <div className="text-red-500">{error}</div>}
      </CardContent>
    </Card>
  );
}

// Main tool should NOT wrap these in additional Cards
export default function MyTool() {
  return (
    <ToolLayout>
      <div className="w-full p-6 space-y-6 mt-5">
        <div className="space-y-4">
          <Display value={value} error={error} /> {/* Already has Card */}
          <ButtonGrid onButtonClick={handleClick} /> {/* May have Card */}
        </div>
      </div>
    </ToolLayout>
  );
}
```

## Visual Hierarchy

### Spacing System
- **Major sections**: `space-y-6` (24px)
- **Related components**: `space-y-4` (16px)
- **Small elements**: `space-y-2` (8px)
- **Component gaps**: `gap-4` or `gap-6`

### Background Usage
- **Main content area**: No background (inherits from ToolLayout)
- **Output areas**: `bg-muted/30` for subtle distinction
- **Interactive areas**: Use hover states and transitions
- **Cards**: Default Card styling for secondary content

## Accessibility Considerations

### Focus Management
- Ensure proper tab order through main interface first
- Secondary content (help cards) should come after main interface
- Use semantic HTML structure within the layout

### Screen Reader Support
- Main content should be clearly structured
- Help sections should be properly labeled
- Use appropriate heading hierarchy

## Migration Guide

### From Old Layout (Card-wrapped)
```typescript
// OLD - Don't do this
<ToolLayout>
  <div className="p-6">
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Tool content */}
      </CardContent>
    </Card>
  </div>
</ToolLayout>

// NEW - Do this instead
<ToolLayout>
  <div className="w-full p-6 space-y-6 mt-5">
    <div className="space-y-6">
      {/* Tool content */}
    </div>
  </div>
</ToolLayout>
```

### Checklist for Tool Updates
- [ ] Remove main Card wrapper around tool interface
- [ ] Add `mt-5` to main container
- [ ] Use `w-full p-6 space-y-6` for main container
- [ ] Move keyboard shortcuts to separate Card at bottom
- [ ] Ensure responsive grid layouts work properly
- [ ] Test window controls positioning and visibility
- [ ] Verify proper spacing and visual hierarchy

## Best Practices

### Do's
✅ Use direct div containers for main tool interface  
✅ Add proper top margin (`mt-5`) for window controls  
✅ Use consistent padding and spacing  
✅ Put help/shortcuts in separate Card at bottom  
✅ Use responsive grid layouts  
✅ Maximize screen width usage  

### Don'ts
❌ Don't wrap main tool interface in Card  
❌ Don't forget top margin for window controls  
❌ Don't use inconsistent spacing  
❌ Don't mix help content with main interface  
❌ Don't use fixed widths that limit screen usage  
❌ Don't ignore responsive design  

## Testing Checklist

### Layout Testing
- [ ] Window controls are properly positioned and visible
- [ ] Content has appropriate spacing from top edge
- [ ] Responsive layouts work on all screen sizes
- [ ] No horizontal scrolling on mobile devices
- [ ] Cards are used only for secondary content

### Functionality Testing
- [ ] All tool functions work as expected
- [ ] Keyboard shortcuts are documented and functional
- [ ] Copy/paste operations work correctly
- [ ] Tool state is properly managed
- [ ] Navigation between tools works smoothly

---

**Note**: This layout standard is based on the programmer calculator implementation and should be applied to all existing and new tools for consistency.