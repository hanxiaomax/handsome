# LowPolyBackground Component

A modular, randomly generated Low Poly artistic background component for React applications.

## Features

- 🎲 **Random Generation**: Each load creates a unique background
- 🎨 **Artistic Design**: Low poly geometric shapes with gradients
- ⚡ **Performance Optimized**: SVG-based with hardware acceleration
- 🎛️ **Configurable**: Multiple complexity levels and customization options
- 🌙 **Theme Compatible**: Automatically adapts to light/dark themes
- 📱 **Responsive**: Scales perfectly on all screen sizes

## Installation

The component is located at `src/components/common/lowpoly-background.tsx` and can be imported directly:

```typescript
import { LowPolyBackground } from "@/components/common/lowpoly-background";
```

## Basic Usage

### Simple Random Background
```typescript
<LowPolyBackground />
```

### With Configuration
```typescript
<LowPolyBackground 
  complexity="medium"
  animated={true}
/>
```

### Full Configuration
```typescript
<LowPolyBackground 
  seed="my-custom-seed"
  complexity="complex"
  animated={true}
/>
```

## Props

### `seed?: string`
- **Default**: Random seed based on timestamp
- **Purpose**: Provides reproducible random generation
- **Usage**: Use the same seed to get identical backgrounds across renders

```typescript
// Random background (changes on each load)
<LowPolyBackground />

// Fixed background (same pattern every time)
<LowPolyBackground seed="project-homepage" />

// User-specific background
<LowPolyBackground seed={`user-${userId}`} />
```

### `complexity?: "simple" | "medium" | "complex"`
- **Default**: `"medium"`
- **Purpose**: Controls the number of geometric elements

| Complexity | Polygons | Lines | Particles | Use Case |
|------------|----------|-------|-----------|----------|
| `simple`   | 4        | 3     | 3         | Minimal, subtle backgrounds |
| `medium`   | 7        | 6     | 5         | Balanced visual impact |
| `complex`  | 12       | 10    | 8         | Rich, detailed backgrounds |

```typescript
// Subtle background for text-heavy pages
<LowPolyBackground complexity="simple" />

// Balanced background for landing pages
<LowPolyBackground complexity="medium" />

// Rich background for hero sections
<LowPolyBackground complexity="complex" />
```

### `animated?: boolean`
- **Default**: `true`
- **Purpose**: Enables/disables floating and pulsing animations

```typescript
// Animated background (default)
<LowPolyBackground animated={true} />

// Static background (better for performance)
<LowPolyBackground animated={false} />
```

## Layout Integration

### Full Screen Background
```typescript
<div className="min-h-screen relative">
  <LowPolyBackground />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

### Section Background
```typescript
<section className="relative py-20">
  <LowPolyBackground complexity="simple" />
  <div className="relative z-10 container mx-auto">
    {/* Section content */}
  </div>
</section>
```

### Card Background
```typescript
<div className="relative p-6 rounded-lg overflow-hidden">
  <LowPolyBackground complexity="simple" animated={false} />
  <div className="relative z-10">
    {/* Card content */}
  </div>
</div>
```

## Advanced Usage

### Theme-Specific Seeds
```typescript
const { theme } = useTheme();
const backgroundSeed = `theme-${theme}-${pageId}`;

<LowPolyBackground seed={backgroundSeed} />
```

### Performance Optimization
```typescript
// For mobile devices, use simpler backgrounds
const isMobile = useMediaQuery('(max-width: 768px)');

<LowPolyBackground 
  complexity={isMobile ? "simple" : "medium"}
  animated={!isMobile}
/>
```

### Seasonal Themes
```typescript
const season = getCurrentSeason();
const seasonalSeed = `season-${season}-2024`;

<LowPolyBackground seed={seasonalSeed} />
```

## Customization

### Custom CSS Variables
The component uses CSS variables for theming. Override them for custom colors:

```css
.custom-background {
  --primary: 220 100% 50%; /* Custom blue */
}
```

```typescript
<div className="custom-background">
  <LowPolyBackground />
</div>
```

### Animation Speed Control
Modify animation durations by overriding CSS:

```css
.slow-animation .animate-[float_*] {
  animation-duration: calc(var(--duration) * 2) !important;
}
```

## Performance Considerations

### Bundle Size
- Component adds ~3KB to bundle
- No external dependencies
- Tree-shakeable

### Runtime Performance
- SVG rendering is hardware-accelerated
- Animations use CSS transforms (GPU-optimized)
- Memory usage scales with complexity

### Best Practices
```typescript
// ✅ Good: Use appropriate complexity
<LowPolyBackground complexity="simple" />

// ✅ Good: Disable animations on mobile
<LowPolyBackground animated={!isMobile} />

// ❌ Avoid: Too complex for small screens
<LowPolyBackground complexity="complex" /> // on mobile

// ❌ Avoid: Multiple instances without seeds
<LowPolyBackground />
<LowPolyBackground /> // Different patterns, may be confusing
```

## Examples

### Landing Page
```typescript
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 relative">
      <LowPolyBackground complexity="medium" />
      
      <main className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8">Welcome</h1>
          <p className="text-xl text-muted-foreground">
            Beautiful backgrounds, generated randomly
          </p>
        </div>
      </main>
    </div>
  );
}
```

### Hero Section
```typescript
export function HeroSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <LowPolyBackground 
        seed="hero-2024"
        complexity="complex"
      />
      
      <div className="relative z-10 container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Our Product</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Consistent, beautiful design every time
        </p>
        <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg">
          Get Started
        </button>
      </div>
    </section>
  );
}
```

### Loading Screen
```typescript
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <LowPolyBackground 
        complexity="simple"
        animated={true}
      />
      
      <div className="relative z-10 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

## Technical Details

### Random Number Generation
- Uses seeded PRNG for reproducible results
- Linear congruential generator implementation
- Hash-based seed conversion

### SVG Structure
- Separate layers for polygons, lines, and gradients
- Optimized viewBox for consistent scaling
- Efficient gradient reuse

### Animation System
- CSS-only animations for best performance
- Staggered timing to prevent synchronization
- Transform-based movements for GPU acceleration

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Troubleshooting

### Background Not Showing
- Ensure parent container has `position: relative`
- Check z-index stacking order
- Verify CSS variables are available

### Poor Performance
- Reduce complexity on mobile devices
- Disable animations for better performance
- Consider using static backgrounds for heavy pages

### Inconsistent Appearance
- Use the same seed for consistent results
- Check theme compatibility
- Ensure proper CSS variable inheritance 