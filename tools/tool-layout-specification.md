# Tool Layout Framework - Design Specification

## Overview

A standardized layout framework for all tool pages in the suite, providing consistent user experience, navigation, and window management controls. Based on the programmer calculator implementation with enhanced functionality.

## Core Components

### 1. Tool Layout Structure
- **Sidebar**: Consistent navigation with main interface logic
- **Header**: Tool identification and window controls
- **Content Area**: Tool-specific interface
- **Window Controls**: macOS-style minimize, close, and fullscreen buttons

### 2. Layout Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│ [Sidebar]  │ Header: Tool Name              [○ ○ ○]        │
│            ├─────────────────────────────────────────────────┤
│ Navigation │                                                │
│ & Search   │           Tool Content Area                    │
│            │                                                │
│            │                                                │
└────────────┴─────────────────────────────────────────────────┘
```

## Header Design

### Tool Name Display
- **Position**: Left side of header
- **Typography**: Large, bold font for tool name
- **Subtitle**: Optional tool description below name
- **Responsive**: Truncate on smaller screens

### Window Controls (macOS Style)
- **Position**: Top-right corner of tool content area
- **Layout**: Three circular buttons in horizontal row
- **Spacing**: 8px gap between buttons
- **Size**: 20px diameter (w-5 h-5)
- **Z-index**: High to ensure visibility over content

#### Button Specifications
```typescript
interface WindowControl {
  color: 'red' | 'yellow' | 'green';
  action: 'close' | 'minimize' | 'fullscreen';
  icon: string;
  hoverIcon: string;
  title: string;
}

const windowControls: WindowControl[] = [
  {
    color: 'red',
    action: 'close',
    icon: '', // Hidden by default
    hoverIcon: '×',
    title: 'Back to Home'
  },
  {
    color: 'yellow', 
    action: 'minimize',
    icon: '', // Hidden by default
    hoverIcon: '−',
    title: 'Minimize to Drawer'
  },
  {
    color: 'green',
    action: 'fullscreen',
    icon: '', // Hidden by default
    hoverIcon: '⌃', // Changes to '⌄' when fullscreen
    title: 'Enter Fullscreen' // Changes to 'Exit Fullscreen'
  }
];
```

## Sidebar Integration

### Consistency Requirements
- **Width**: Same as main interface (20rem/320px via CSS custom property)
- **Collapse Behavior**: Identical to homepage sidebar
- **Search Functionality**: Full search with same logic
- **Navigation**: All categories and tools accessible
- **State Persistence**: Remember collapse state across tools

### Sidebar Content
- **Search Bar**: Global tool search
- **Categories**: Same category structure as homepage
- **Tool List**: All tools with favorites support
- **Navigation**: Home and Favorites links
- **Theme Toggle**: Consistent theme switching

### Navigation Behavior
- **Tool Selection**: Navigate to homepage with tool parameter (`/?tool=toolId`)
- **Tool Details**: Show tool details page instead of direct tool navigation
- **Use Tool Button**: Navigate directly to tool page from details
- **URL Parameters**: Support deep linking to specific tool details

## Layout Implementation

### Content Layout Guidelines

#### Main Content Structure
- **Container**: Direct div wrapper with padding and spacing, no Card wrapper
- **Top Margin**: Add `mt-5` for proper spacing from window controls
- **Padding**: Use `p-6` for consistent content padding
- **Spacing**: Use `space-y-6` for vertical spacing between sections

#### Card Usage Policy
- **Main Tool UI**: Do NOT wrap in Card - use direct div containers
- **Secondary Content**: Use Card only for supplementary content (help, info, etc.)
- **Individual Components**: Tool-specific components may use their own Cards internally

#### Layout Pattern
```typescript
<ToolLayout>
  <div className="w-full p-6 space-y-6 mt-5">
    {/* Main tool interface - NO Card wrapper */}
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Tool-specific content */}
    </div>
    
    {/* Secondary content - CAN use Card */}
    <Card>
      <CardHeader>
        <CardTitle>Help or Additional Info</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Supplementary content */}
      </CardContent>
    </Card>
  </div>
</ToolLayout>
```

### Base Layout Component
```typescript
interface ToolLayoutProps {
  toolName: string;
  toolDescription?: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function ToolLayout({
  toolName,
  toolDescription,
  children,
  onClose,
  onMinimize, 
  onFullscreen,
  isFullscreen = false
}: ToolLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div 
        className="flex h-screen w-full"
        style={
          {
            "--sidebar-width": "20rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          onNavigateHome={handleNavigateHome}
          onNavigateToFavorites={handleNavigateToFavorites}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{toolName}</h2>
                {toolDescription && (
                  <p className="text-sm text-muted-foreground">
                    {toolDescription}
                  </p>
                )}
              </div>
              <ThemeToggle />
            </div>
          </header>
          
          {/* Content with Window Controls */}
          <div className="flex-1 overflow-auto bg-muted/30 relative">
            {/* macOS Window Controls */}
            <WindowControls
              onClose={onClose}
              onMinimize={onMinimize}
              onFullscreen={onFullscreen}
              isFullscreen={isFullscreen}
            />
            
            {/* Tool Content */}
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
```

### Window Controls Component
```typescript
interface WindowControlsProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

function WindowControls({
  onClose,
  onMinimize,
  onFullscreen,
  isFullscreen = false
}: WindowControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors group shadow-sm"
        title="Back to Home"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold leading-none flex items-center justify-center w-full h-full">
          ×
        </span>
      </button>
      
      {/* Minimize Button */}
      <button
        onClick={onMinimize}
        className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors group shadow-sm"
        title="Minimize to Drawer"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold leading-none flex items-center justify-center w-full h-full">
          −
        </span>
      </button>
      
      {/* Fullscreen Button */}
      <button
        onClick={onFullscreen}
        className="w-5 h-5 rounded-full bg-green-500 hover:bg-green-600 transition-colors group shadow-sm"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-bold leading-none flex items-center justify-center w-full h-full">
          {isFullscreen ? "⌄" : "⌃"}
        </span>
      </button>
    </div>
  );
}
```

### Navigation Handler Implementation
```typescript
// In ToolLayout component
const handleToolSelect = (toolId: string) => {
  setSelectedTool(toolId);
  // Navigate to homepage with tool selected (not directly to tool)
  navigate(`/?tool=${toolId}`);
};

// In Homepage component  
useEffect(() => {
  const toolParam = searchParams.get('tool');
  if (toolParam && tools.find(t => t.id === toolParam)) {
    setSelectedTool(toolParam);
  }
}, [searchParams]);

const handleToolSelect = (toolId: string) => {
  setSelectedTool(toolId);
  // Update URL parameters
  setSearchParams({ tool: toolId });
};
```

## Responsive Design

### Desktop Layout (≥1024px)
- Full sidebar with expanded width option (20rem)
- Complete header with tool name and description
- All window controls visible and functional

### Tablet Layout (768px-1023px)
- Collapsible sidebar (default collapsed)
- Compact header layout
- Touch-friendly window controls

### Mobile Layout (<768px)
- Hidden sidebar (accessible via trigger)
- Minimal header with tool name only
- Larger touch targets for controls

## Behavior Specifications

### Window Control Actions

#### Close Button (Red)
- **Default Action**: Navigate back to homepage
- **Implementation**: `navigate('/')`
- **Visual Feedback**: Hover shows × symbol
- **Keyboard**: Escape key (optional)

#### Minimize Button (Yellow)
- **Default Action**: Minimize tool to bottom drawer
- **Implementation**: Add to minimized tools context
- **Visual Feedback**: Hover shows − symbol
- **State**: Tool remains in minimized drawer until restored/closed

#### Fullscreen Button (Green)
- **Default Action**: Toggle fullscreen mode
- **Implementation**: Use Fullscreen API
- **Visual Feedback**: 
  - Normal: ⌃ symbol (expand)
  - Fullscreen: ⌄ symbol (contract)
- **State Management**: Track fullscreen state
- **Keyboard**: F11 key support (optional)

### Sidebar Behavior
- **Default State**: Collapsed on tool pages
- **Persistence**: Remember user's expand/collapse preference
- **Search**: Maintain search functionality across all tools
- **Navigation**: Seamless navigation between tools
- **Favorites**: Consistent favorites management
- **Width Consistency**: Same 20rem width as homepage

### Navigation Flow
1. **From Tool Page**: Click sidebar tool → Navigate to `/?tool=toolId`
2. **Homepage**: Show tool details page with "Use Tool" button
3. **Use Tool**: Navigate to actual tool page (`/tools/tool-name`)
4. **Deep Linking**: Support direct links to tool details via URL parameters

## Accessibility

### Keyboard Navigation
- **Tab Order**: Sidebar trigger → Tool content → Window controls
- **Shortcuts**: 
  - Escape: Close tool (return to home)
  - F11: Toggle fullscreen
  - Ctrl+M: Minimize to drawer

### Screen Reader Support
- **ARIA Labels**: All window controls properly labeled
- **Live Regions**: Tool name changes announced
- **Focus Management**: Proper focus handling on navigation

### Visual Accessibility
- **High Contrast**: Window controls work in high contrast mode
- **Focus Indicators**: Clear focus rings on all interactive elements
- **Color Independence**: Controls work without color (shape/text based)

## Implementation Guidelines

### Tool Integration
1. **Import ToolLayout**: Use the standardized layout component
2. **Provide Props**: Pass tool name, description, and handlers
3. **Wrap Content**: Place tool-specific UI inside ToolLayout
4. **Handle Actions**: Implement close, minimize, and fullscreen handlers

### Example Usage
```typescript
// tools/my-tool/ui.tsx
import { ToolLayout } from '@/components/layout/tool-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toolInfo } from './toolInfo';

export default function MyTool() {
  const navigate = useNavigate();
  const { minimizeTool } = useMinimizedTools();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => navigate('/');
  const handleMinimize = () => minimizeTool(toolInfo);
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

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
        {/* Main tool interface - NO Card wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tool controls */}
          <div className="space-y-4">
            {/* Your main tool UI components here */}
          </div>
          
          {/* Tool output */}
          <div className="space-y-4">
            {/* Your output components here */}
          </div>
        </div>
        
        {/* Optional: Help or additional info - CAN use Card */}
        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Help content */}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
```

## Styling Guidelines

### Sidebar Width Consistency
```typescript
// Both Homepage and ToolLayout must use the same CSS custom property
<div 
  className="flex h-screen w-full"
  style={
    {
      "--sidebar-width": "20rem",
    } as React.CSSProperties
  }
>
```

### Window Controls Styling
```css
/* Base button styles */
.window-control {
  @apply w-5 h-5 rounded-full transition-colors shadow-sm;
}

.window-control-close {
  @apply bg-red-500 hover:bg-red-600;
}

.window-control-minimize {
  @apply bg-yellow-500 hover:bg-yellow-600;
}

.window-control-fullscreen {
  @apply bg-green-500 hover:bg-green-600;
}

/* Icon styles */
.window-control-icon {
  @apply opacity-0 group-hover:opacity-100 transition-opacity;
  @apply text-xs text-white font-bold leading-none;
  @apply flex items-center justify-center w-full h-full;
}
```

### Header Styling
```css
.tool-header {
  @apply border-b bg-background/95 backdrop-blur;
  @apply supports-[backdrop-filter]:bg-background/60;
}

.tool-title {
  @apply text-lg font-semibold;
}

.tool-description {
  @apply text-sm text-muted-foreground;
}
```

## Testing Requirements

### Unit Tests
- Window control click handlers
- Fullscreen state management
- Sidebar integration
- Responsive layout behavior
- Navigation flow correctness

### Integration Tests
- Navigation between tools
- Minimize/restore workflow
- Fullscreen mode functionality
- Keyboard accessibility
- URL parameter handling

### Visual Tests
- Window control positioning
- Header layout consistency
- Sidebar behavior across tools
- Responsive breakpoints
- Sidebar width consistency

## Recent Fixes

### Issue 1: Sidebar Width Inconsistency
**Problem**: Tool pages had different sidebar width than homepage
**Solution**: Added `--sidebar-width: "20rem"` CSS custom property to ToolLayout
**Impact**: Consistent 320px sidebar width across all pages

### Issue 2: Navigation Behavior
**Problem**: Sidebar tool clicks navigated directly to tool pages instead of tool details
**Solution**: 
- Modified `handleToolSelect` to navigate to `/?tool=toolId`
- Updated Homepage to handle URL parameters
- Maintained tool details → "Use Tool" → tool page flow
**Impact**: Consistent navigation experience matching homepage behavior

---

**Implementation Priority**: This framework should be implemented first as it provides the foundation for all tool pages. It ensures consistency and proper integration with the existing navigation system. 