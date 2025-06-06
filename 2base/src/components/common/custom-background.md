# CustomBackground Component (自定义背景组件)

A modular, randomly generated artistic background component for React applications.

## Features

- 🎲 **Random Generation**: Each load creates a unique background
- 🎨 **Artistic Design**: Geometric shapes with gradients and animations
- ⚡ **Performance Optimized**: SVG-based with hardware acceleration
- 🎛️ **Configurable**: Multiple complexity levels and customization options
- 🌙 **Theme Compatible**: Automatically adapts to light/dark themes
- 📱 **Responsive**: Scales perfectly on all screen sizes
- 🔧 **Customizable Algorithm**: Designed for easy algorithm modifications

## Installation

The component is located at `src/components/common/custom-background.tsx` and can be imported directly:

```typescript
import { CustomBackground } from "@/components/common/custom-background";
```

## Basic Usage

### Simple Random Background
```typescript
<CustomBackground />
```

### With Configuration
```typescript
<CustomBackground 
  complexity="medium"
  animated={true}
/>
```

### Full Configuration
```typescript
<CustomBackground 
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
<CustomBackground />

// Fixed background (same pattern every time)
<CustomBackground seed="project-homepage" />

// User-specific background
<CustomBackground seed={`user-${userId}`} />
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
<CustomBackground complexity="simple" />

// Balanced background for landing pages
<CustomBackground complexity="medium" />

// Rich background for hero sections
<CustomBackground complexity="complex" />
```

### `animated?: boolean`
- **Default**: `true`
- **Purpose**: Enables/disables floating and pulsing animations

```typescript
// Animated background (default)
<CustomBackground animated={true} />

// Static background (better for performance)
<CustomBackground animated={false} />
```

## Layout Integration

### Full Screen Background
```typescript
<div className="min-h-screen relative">
  <CustomBackground />
  <div className="relative z-10">
    {/* Your content here */}
  </div>
</div>
```

### Section Background
```typescript
<section className="relative py-20">
  <CustomBackground complexity="simple" />
  <div className="relative z-10 container mx-auto">
    {/* Section content */}
  </div>
</section>
```

### Card Background
```typescript
<div className="relative p-6 rounded-lg overflow-hidden">
  <CustomBackground complexity="simple" animated={false} />
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

<CustomBackground seed={backgroundSeed} />
```

### Performance Optimization
```typescript
// For mobile devices, use simpler backgrounds
const isMobile = useMediaQuery('(max-width: 768px)');

<CustomBackground 
  complexity={isMobile ? "simple" : "medium"}
  animated={!isMobile}
/>
```

### Seasonal Themes
```typescript
const season = getCurrentSeason();
const seasonalSeed = `season-${season}-2024`;

<CustomBackground seed={seasonalSeed} />
```

## Algorithm Customization

The CustomBackground component is designed for easy algorithm modifications. The core generation logic is contained in these key functions:

### 1. Random Number Generator
```typescript
class SeededRandom {
  // Custom PRNG implementation
  // Modify for different random distributions
}
```

### 2. Shape Generation
```typescript
function generateRandomPolygon(
  rng: SeededRandom,
  centerX: number,
  centerY: number,
  size: number,
  sides: number = 4
): string {
  // Customize polygon generation algorithm
  // Add new shape types (circles, curves, etc.)
}
```

### 3. Layout Algorithm
```typescript
const backgroundData = useMemo(() => {
  // Main generation logic
  // Modify for different layouts, patterns, colors
}, [seed, complexity]);
```

## Extending the Algorithm

### Adding New Shape Types
```typescript
// Example: Add circle generation
function generateCircle(rng: SeededRandom, x: number, y: number, radius: number) {
  return {
    cx: x,
    cy: y,
    r: radius
  };
}
```

### Custom Color Schemes
```typescript
// Example: Multiple color variations
const colorSchemes = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))'
];

const color = rng.choice(colorSchemes);
```

### Pattern Algorithms
```typescript
// Example: Grid-based placement
function generateGridPattern(rng: SeededRandom, gridSize: number) {
  const elements = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      // Generate elements in grid positions
    }
  }
  return elements;
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
<CustomBackground complexity="simple" />

// ✅ Good: Disable animations on mobile
<CustomBackground animated={!isMobile} />

// ❌ Avoid: Too complex for small screens
<CustomBackground complexity="complex" /> // on mobile

// ❌ Avoid: Multiple instances without seeds
<CustomBackground />
<CustomBackground /> // Different patterns, may be confusing
```

## Examples

### Landing Page
```typescript
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 relative">
      <CustomBackground complexity="medium" />
      
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
      <CustomBackground 
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

## Future Development

The CustomBackground component is designed as a foundation for more advanced background generation algorithms. Planned improvements include:

- **Physical simulations**: Particle physics, fluid dynamics
- **Fractal patterns**: Mandelbrot sets, L-systems
- **Interactive elements**: Mouse-responsive animations
- **AI-generated patterns**: Machine learning-based designs
- **3D effects**: WebGL integration for 3D backgrounds

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