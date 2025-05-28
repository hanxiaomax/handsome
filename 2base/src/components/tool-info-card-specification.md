# ToolInfoCard Component Specification

## Overview

The `ToolInfoCard` component is a reusable React component that displays tool information in a consistent, visually appealing card format. This component has been optimized for design consistency and minimal visual clutter.

## Design Principles

### Minimal Design Philosophy
- **Essential Information Only**: Focus on tool name, description, and core actions
- **Reduced Visual Noise**: Removed tag displays to maintain clean interface
- **Consistent Hierarchy**: Clear information prioritization and visual flow

### Layout Consistency
- **Uniform Height**: All cards maintain consistent minimum height regardless of content
- **Flexible Content**: Responsive layout adapts to different content lengths
- **Bottom Alignment**: Actions are consistently positioned at card bottom

## Component Structure

### Layout Hierarchy
```
┌─────────────────────────────────────┐
│ CardHeader                          │
│ ┌─────────────┬─────────────────────┐ │
│ │ Icon & Info │ Favorite Button     │ │
│ │ - Tool Icon │ - Heart Icon        │ │
│ │ - Tool Name │                     │ │
│ │ - Version   │                     │ │
│ │ - Badges    │                     │ │
│ └─────────────┴─────────────────────┘ │
├─────────────────────────────────────┤
│ CardContent (flex-1)                │
│ ┌─────────────────────────────────┐ │
│ │ Description (flex-1)            │ │
│ │ - Up to 3 lines                 │ │
│ │ - Auto-clamp overflow           │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Action Button (mt-auto)         │ │
│ │ - "Use Tool" primary button     │ │
│ │ - Full width                    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Technical Specifications

### Height Consistency
- **Standard Mode**: `min-h-[280px]` (280px minimum height)
- **Compact Mode**: `min-h-[200px]` (200px minimum height)
- **Flexbox Layout**: `flex flex-col` for vertical distribution

### Content Areas

#### Header Section
- **Icon Container**: Primary color background with rounded corners
- **Tool Information**: Name, version, and status badges
- **Favorite Action**: Heart icon toggle button positioned top-right

#### Content Section
- **Description**: Multi-line text with automatic truncation
- **Line Clamping**: Maximum 3 lines with `line-clamp-3`
- **Flexible Growth**: `flex-1` to occupy available space

#### Action Section
- **Use Tool Button**: Primary action pinned to bottom with `mt-auto`
- **Full Width**: Spans entire card width for easy interaction
- **Icon Integration**: External link icon with consistent spacing

## Props Interface

```typescript
interface ToolInfoCardProps {
  tool: ToolInfo;                    // Tool data object
  onSelect?: (toolId: string) => void;  // Optional selection handler
  onUseTool?: (toolId: string) => void; // Optional tool usage handler
  showFavoriteButton?: boolean;      // Toggle favorite button display
  compact?: boolean;                 // Enable compact mode layout
}
```

## State Management

### Favorite Integration
- **Context Usage**: Leverages `useFavorites` hook for state management
- **Toggle Action**: Click handler prevents event propagation
- **Visual Feedback**: Heart icon fills when tool is favorited

### Event Handling
- **Card Click**: Triggers tool selection (if onSelect provided)
- **Button Clicks**: Stop propagation to prevent card selection
- **Keyboard Support**: Native button accessibility features

## Responsive Behavior

### Compact Mode Optimizations
- **Reduced Padding**: Smaller spacing for denser layouts
- **Smaller Icons**: 16x16px icons vs 20x20px standard
- **Condensed Typography**: Smaller font sizes for mobile/tablet
- **Shorter Height**: 200px minimum vs 280px standard

### Breakpoint Adaptations
- **Grid Integration**: Works with responsive grid layouts
- **Touch Targets**: Maintains adequate touch target sizes
- **Text Scaling**: Responsive typography for different screen sizes

## Accessibility Features

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and button elements
- **ARIA Labels**: Descriptive labels for interactive elements
- **Focus Management**: Keyboard navigation support

### Visual Accessibility
- **Color Contrast**: Meets WCAG 2.1 AA standards
- **Focus Indicators**: Clear visual focus states
- **Text Scaling**: Supports browser text size preferences

## Design Improvements Summary

### Version 2.0 Changes
1. **Removed Tag Display**: Eliminated tag badges for cleaner appearance
2. **Height Uniformity**: Added consistent minimum heights across all cards
3. **Layout Optimization**: Improved flexbox structure for better content distribution
4. **Content Prioritization**: Enhanced focus on essential tool information

### Performance Benefits
- **Reduced DOM Complexity**: Fewer elements per card
- **Better Layout Stability**: Consistent heights prevent layout shifts
- **Improved Scanning**: Users can quickly identify tools without visual clutter

## Usage Examples

### Standard Implementation
```typescript
<ToolInfoCard
  tool={toolData}
  onUseTool={handleUseTool}
  showFavoriteButton={true}
  compact={false}
/>
```

### Compact Grid Layout
```typescript
<ToolInfoCard
  tool={toolData}
  onSelect={handleToolSelect}
  onUseTool={handleUseTool}
  compact={true}
/>
```

### Favorites Page Integration
```typescript
<ToolInfoCard
  tool={favoriteToolData}
  onSelect={handleToolSelect}
  onUseTool={handleUseTool}
  showFavoriteButton={true}
/>
```

## Future Considerations

### Potential Enhancements
- **Tool Status Indicators**: Online/offline capability display
- **Usage Statistics**: Show tool popularity or recent usage
- **Customization Options**: User-configurable card layouts
- **Animation Support**: Micro-interactions for better UX

### Maintenance Notes
- **Component Testing**: Ensure height consistency across different content lengths
- **Performance Monitoring**: Track render performance with large tool lists
- **Accessibility Audits**: Regular testing with screen readers and keyboard navigation 