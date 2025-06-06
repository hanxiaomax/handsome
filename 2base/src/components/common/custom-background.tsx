import { useMemo } from "react";
import "./custom-background.css";

interface CustomBackgroundProps {
  seed?: string; // Optional seed value for reproducible random effects
  complexity?: "simple" | "medium" | "complex"; // Complexity control
  animated?: boolean; // Whether to enable animations
}

// Code snippets data for different programming languages
const codeStatements = [
  // JavaScript/TypeScript
  {
    code: "console.log('Hello World')",
    language: "javascript",
    chartColor: "chart-1",
  },
  {
    code: "const result = await fetch(url)",
    language: "javascript",
    chartColor: "chart-1",
  },
  {
    code: "array.map(x => x * 2)",
    language: "javascript",
    chartColor: "chart-1",
  },
  {
    code: "export default function Component()",
    language: "typescript",
    chartColor: "chart-2",
  },
  {
    code: "interface Props { name: string }",
    language: "typescript",
    chartColor: "chart-2",
  },

  // Python
  {
    code: "def fibonacci(n): return n",
    language: "python",
    chartColor: "chart-3",
  },
  { code: "import pandas as pd", language: "python", chartColor: "chart-3" },
  {
    code: "list(map(lambda x: x*2, arr))",
    language: "python",
    chartColor: "chart-3",
  },
  {
    code: "if __name__ == '__main__':",
    language: "python",
    chartColor: "chart-3",
  },

  // Java
  {
    code: "public static void main(String[] args)",
    language: "java",
    chartColor: "chart-4",
  },
  {
    code: "List<String> items = new ArrayList<>()",
    language: "java",
    chartColor: "chart-4",
  },
  {
    code: "try { execute(); } catch (Exception e)",
    language: "java",
    chartColor: "chart-4",
  },

  // Go
  {
    code: 'func main() { fmt.Println("Hello") }',
    language: "go",
    chartColor: "chart-5",
  },
  {
    code: "go func() { /* goroutine */ }()",
    language: "go",
    chartColor: "chart-5",
  },
  {
    code: "type User struct { Name string }",
    language: "go",
    chartColor: "chart-5",
  },

  // Rust
  {
    code: "fn main() -> Result<(), Error>",
    language: "rust",
    chartColor: "chart-1",
  },
  { code: "let mut vec = Vec::new()", language: "rust", chartColor: "chart-1" },
  {
    code: "match result { Ok(val) => val }",
    language: "rust",
    chartColor: "chart-1",
  },

  // C++
  { code: "#include <iostream>", language: "cpp", chartColor: "chart-2" },
  {
    code: "std::vector<int> nums{1, 2, 3}",
    language: "cpp",
    chartColor: "chart-2",
  },
  {
    code: "auto lambda = [](int x) { return x; }",
    language: "cpp",
    chartColor: "chart-2",
  },

  // PHP
  {
    code: "<?php echo 'Hello World'; ?>",
    language: "php",
    chartColor: "chart-3",
  },
  {
    code: "$users = array_map('trim', $data)",
    language: "php",
    chartColor: "chart-3",
  },

  // Swift
  {
    code: "func greet(name: String) -> String",
    language: "swift",
    chartColor: "chart-4",
  },
  {
    code: "let numbers = [1, 2, 3].map { $0 * 2 }",
    language: "swift",
    chartColor: "chart-4",
  },

  // Kotlin
  {
    code: 'fun main() = println("Hello")',
    language: "kotlin",
    chartColor: "chart-5",
  },
  {
    code: "data class User(val name: String)",
    language: "kotlin",
    chartColor: "chart-5",
  },
];

// Animation configuration parameters
const animationConfig = {
  // Floating text configuration
  floatingText: {
    // Position parameters
    position: {
      yRange: { min: 15, max: 90 }, // Vertical position range (%)
      startXRange: { min: -30, max: 50 }, // Start horizontal position range (vw)
      endXRange: { min: 50, max: 130 }, // End horizontal position range (vw)
      minDistance: 40, // Minimum movement distance (vw)
    },

    // Visual parameters
    visual: {
      fontSize: 1.2, // Font size (rem)
      opacityRange: {
        min: { min: 0.02, max: 0.08 }, // Minimum opacity range
        max: { min: 0.2, max: 0.3 }, // Maximum opacity range
      },
    },

    // Animation parameters
    animation: {
      durationRange: { min: 20, max: 80 }, // Animation duration range (seconds)
      delayRange: { min: 0, max: 0.5 }, // Animation delay range (seconds)
      directions: ["normal", "reverse"], // Animation direction options
      types: {
        normal: ["floatTextHorizontal", "floatAndFlicker"],
        reverse: ["floatTextHorizontalReverse", "floatAndFlickerReverse"],
      },
    },
  },

  // Polygon configuration
  polygons: {
    sizeRange: { min: 60, max: 150 }, // Size range
    sidesOptions: [3, 4, 5, 6], // Sides options
    opacityRange: {
      start: { min: 0.01, max: 0.06 }, // Start opacity
      end: { min: 0.01, max: 0.04 }, // End opacity
    },
    animationDurationRange: { min: 20, max: 40 }, // Animation duration
    pulseRateRange: { min: 10, max: 25 }, // Pulse rate
  },

  // Line configuration
  lines: {
    opacityRange: { min: 0.02, max: 0.1 }, // Opacity range
    animationDurationRange: { min: 30, max: 50 }, // Animation duration
    pulseRateRange: { min: 8, max: 16 }, // Pulse rate
  },

  // Particle configuration
  particles: {
    positionRange: { min: 10, max: 90 }, // Position range (%)
    sizeRange: { min: 0.5, max: 1.5 }, // Size range (rem)
    opacityRange: { min: 0.05, max: 0.2 }, // Opacity range
    animationDurationRange: { min: 8, max: 25 }, // Animation duration
  },
};

// Seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: string = Math.random().toString()) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

// Generate random polygon points
function generateRandomPolygon(
  rng: SeededRandom,
  centerX: number,
  centerY: number,
  size: number,
  sides: number = 4
): string {
  const points: string[] = [];
  const angleStep = (Math.PI * 2) / sides;

  for (let i = 0; i < sides; i++) {
    const angle = i * angleStep + rng.range(-0.3, 0.3); // Add random offset
    const radius = size * rng.range(0.7, 1.3); // Random radius variation
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(" ");
}

// Generate floating text data
function generateFloatingTexts(rng: SeededRandom, complexity: string) {
  const textCounts = {
    simple: 6,
    medium: 10,
    complex: 15,
  };

  const count = textCounts[complexity as keyof typeof textCounts];
  const config = animationConfig.floatingText;

  return Array.from({ length: count }, (_, i) => {
    const statement = rng.choice(codeStatements);
    const text = statement.code;
    const language = statement.language;
    const syntaxColor = statement.chartColor;

    // Generate random vertical position using config
    const y = rng.range(config.position.yRange.min, config.position.yRange.max);

    // Use configured font size
    const fontSize = config.visual.fontSize;
    const minOpacity = rng.range(
      config.visual.opacityRange.min.min,
      config.visual.opacityRange.min.max
    );
    const maxOpacity = rng.range(
      config.visual.opacityRange.max.min,
      config.visual.opacityRange.max.max
    );

    // Generate random animation parameters using config
    const duration = rng.range(
      config.animation.durationRange.min,
      config.animation.durationRange.max
    );
    const delay = rng.range(
      config.animation.delayRange.min,
      config.animation.delayRange.max
    );
    const direction = rng.choice(config.animation.directions);

    // Select animation type based on direction
    const animationType =
      direction === "reverse"
        ? rng.choice(config.animation.types.reverse)
        : rng.choice(config.animation.types.normal);

    // Generate random start and end positions using config
    const startX = rng.range(
      config.position.startXRange.min,
      config.position.startXRange.max
    );
    const endX = rng.range(
      config.position.endXRange.min,
      config.position.endXRange.max
    );

    // Ensure sufficient movement distance
    const minDistance = config.position.minDistance;
    const actualEndX =
      direction === "reverse"
        ? startX - Math.max(minDistance, startX - endX)
        : startX + Math.max(minDistance, endX - startX);

    return {
      id: `text-${i}`,
      text,
      language,
      syntaxColor,
      y,
      fontSize,
      minOpacity,
      maxOpacity,
      duration,
      delay,
      direction,
      animationType,
      startX:
        direction === "reverse"
          ? Math.max(startX, actualEndX)
          : Math.min(startX, actualEndX),
      endX:
        direction === "reverse"
          ? Math.min(startX, actualEndX)
          : Math.max(startX, actualEndX),
    };
  });
}

export function CustomBackground({
  seed,
  complexity = "medium",
  animated = true,
}: CustomBackgroundProps) {
  const backgroundData = useMemo(() => {
    const rng = new SeededRandom(seed || `${Date.now()}-${Math.random()}`);

    // Determine element counts based on complexity
    const elementCounts = {
      simple: { polygons: 3, lines: 2, particles: 2 }, // Reduce geometric elements to make way for text
      medium: { polygons: 4, lines: 3, particles: 3 },
      complex: { polygons: 6, lines: 4, particles: 4 },
    };

    const counts = elementCounts[complexity];

    // Generate random polygons (reduce opacity to make text stand out)
    const polygons = Array.from({ length: counts.polygons }, (_, i) => {
      const centerX = rng.range(0, 1200);
      const centerY = rng.range(0, 800);
      const size = rng.range(
        animationConfig.polygons.sizeRange.min,
        animationConfig.polygons.sizeRange.max
      );
      const sides = rng.choice(animationConfig.polygons.sidesOptions);
      const gradientId = `grad${i + 1}`;

      // Random gradient directions
      const directions = [
        { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        { x1: "100%", y1: "0%", x2: "0%", y2: "100%" },
        { x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
        { x1: "50%", y1: "0%", x2: "50%", y2: "100%" },
        { x1: "0%", y1: "50%", x2: "100%", y2: "50%" },
      ];

      const direction = rng.choice(directions);
      const opacity1 = rng.range(
        animationConfig.polygons.opacityRange.start.min,
        animationConfig.polygons.opacityRange.start.max
      );
      const opacity2 = rng.range(
        animationConfig.polygons.opacityRange.end.min,
        animationConfig.polygons.opacityRange.end.max
      );
      const animationDuration = rng.range(
        animationConfig.polygons.animationDurationRange.min,
        animationConfig.polygons.animationDurationRange.max
      );
      const pulseRate = rng.range(
        animationConfig.polygons.pulseRateRange.min,
        animationConfig.polygons.pulseRateRange.max
      );

      return {
        points: generateRandomPolygon(rng, centerX, centerY, size, sides),
        gradientId,
        direction,
        opacity1,
        opacity2,
        animationDuration,
        pulseRate,
        useReverse: rng.next() > 0.5,
      };
    });

    // Generate random connecting lines (also reduce opacity)
    const lines = Array.from({ length: counts.lines }, (_, i) => {
      const x1 = rng.range(0, 1200);
      const y1 = rng.range(0, 800);
      const x2 = rng.range(0, 1200);
      const y2 = rng.range(0, 800);
      const isVertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
      const gradientId = `lineGrad${i + 1}`;
      const opacity = rng.range(
        animationConfig.lines.opacityRange.min,
        animationConfig.lines.opacityRange.max
      );
      const animationDuration = rng.range(
        animationConfig.lines.animationDurationRange.min,
        animationConfig.lines.animationDurationRange.max
      );
      const pulseRate = rng.range(
        animationConfig.lines.pulseRateRange.min,
        animationConfig.lines.pulseRateRange.max
      );

      return {
        x1,
        y1,
        x2,
        y2,
        gradientId,
        isVertical,
        opacity,
        animationDuration,
        pulseRate,
      };
    });

    // Generate random particles (reduce count and opacity)
    const particles = Array.from({ length: counts.particles }, () => {
      const x = rng.range(
        animationConfig.particles.positionRange.min,
        animationConfig.particles.positionRange.max
      );
      const y = rng.range(
        animationConfig.particles.positionRange.min,
        animationConfig.particles.positionRange.max
      );
      const size = rng.range(
        animationConfig.particles.sizeRange.min,
        animationConfig.particles.sizeRange.max
      );
      const opacity = rng.range(
        animationConfig.particles.opacityRange.min,
        animationConfig.particles.opacityRange.max
      );
      const animationDuration = rng.range(
        animationConfig.particles.animationDurationRange.min,
        animationConfig.particles.animationDurationRange.max
      );

      return { x, y, size, opacity, animationDuration };
    });

    // Generate floating text
    const floatingTexts = generateFloatingTexts(rng, complexity);

    return { polygons, lines, particles, floatingTexts };
  }, [seed, complexity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main geometric shapes */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Dynamically generated gradients */}
          {backgroundData.polygons.map((polygon) => (
            <linearGradient
              key={polygon.gradientId}
              id={polygon.gradientId}
              x1={polygon.direction.x1}
              y1={polygon.direction.y1}
              x2={polygon.direction.x2}
              y2={polygon.direction.y2}
            >
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity={polygon.opacity1}
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity={polygon.opacity2}
              />
            </linearGradient>
          ))}

          {/* Line gradients */}
          {backgroundData.lines.map((line) => (
            <linearGradient
              key={line.gradientId}
              id={line.gradientId}
              x1={line.isVertical ? "0%" : "0%"}
              y1={line.isVertical ? "0%" : "50%"}
              x2={line.isVertical ? "0%" : "100%"}
              y2={line.isVertical ? "100%" : "50%"}
            >
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0"
              />
              <stop
                offset="50%"
                stopColor="hsl(var(--primary))"
                stopOpacity={line.opacity}
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0"
              />
            </linearGradient>
          ))}
        </defs>

        {/* Dynamically generated polygons */}
        {backgroundData.polygons.map((polygon, index) => (
          <g
            key={`polygon-${index}`}
            className={
              animated
                ? `animate-[float_${
                    polygon.animationDuration
                  }s_ease-in-out_infinite${
                    polygon.useReverse ? "_reverse" : ""
                  }]`
                : ""
            }
          >
            <polygon
              points={polygon.points}
              fill={`url(#${polygon.gradientId})`}
              className={
                animated
                  ? `animate-[pulse_${polygon.pulseRate}s_ease-in-out_infinite]`
                  : ""
              }
            />
          </g>
        ))}
      </svg>

      {/* Connecting lines layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dynamically generated connecting lines */}
        {backgroundData.lines.map((line, index) => (
          <g
            key={`line-${index}`}
            className={
              animated
                ? `animate-[float_${line.animationDuration}s_linear_infinite]`
                : ""
            }
          >
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={`url(#${line.gradientId})`}
              strokeWidth="1"
              className={
                animated
                  ? `animate-[pulse_${line.pulseRate}s_ease-in-out_infinite]`
                  : ""
              }
            />
          </g>
        ))}
      </svg>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {backgroundData.particles.map((particle, index) => (
          <div
            key={`particle-${index}`}
            className={`absolute rounded-full bg-primary ${
              animated
                ? `animate-[float_${particle.animationDuration}s_ease-in-out_infinite]`
                : ""
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * 0.25}rem`,
              height: `${particle.size * 0.25}rem`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Floating text layer - horizontal floating flicker effects with syntax highlighting */}
      <div className="absolute inset-0">
        {backgroundData.floatingTexts.map((textItem) => (
          <div
            key={textItem.id}
            className="absolute select-none pointer-events-none font-mono whitespace-nowrap"
            style={
              {
                top: `${textItem.y}%`,
                left: "0%",
                fontSize: `${textItem.fontSize}rem`,
                color: `hsl(var(--${textItem.syntaxColor}))`,
                opacity: 0,
                visibility: "hidden",
                "--min-opacity": textItem.minOpacity,
                "--max-opacity": textItem.maxOpacity,
                "--start-x": `${textItem.startX}vw`,
                "--end-x": `${textItem.endX}vw`,
                ...(animated && {
                  animation: `${textItem.animationType} ${textItem.duration}s linear infinite`,
                  animationDelay: `${textItem.delay}s`,
                }),
              } as React.CSSProperties
            }
          >
            {textItem.text}
          </div>
        ))}
      </div>
    </div>
  );
}
