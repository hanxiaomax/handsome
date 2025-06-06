import { useMemo } from "react";
import "./custom-background.css";

interface CustomBackgroundProps {
  seed?: string; // 可选的种子值，用于可重现的随机效果
  complexity?: "simple" | "medium" | "complex"; // 复杂度控制
  animated?: boolean; // 是否启用动画
}

// 不同编程语言的代码片段数据
const codeStatements = [
  // JavaScript/TypeScript
  {
    code: "console.log('Hello World')",
    language: "javascript",
    color: "#f7df1e",
  },
  {
    code: "const result = await fetch(url)",
    language: "javascript",
    color: "#f7df1e",
  },
  { code: "array.map(x => x * 2)", language: "javascript", color: "#f7df1e" },
  {
    code: "export default function Component()",
    language: "typescript",
    color: "#3178c6",
  },
  {
    code: "interface Props { name: string }",
    language: "typescript",
    color: "#3178c6",
  },

  // Python
  { code: "def fibonacci(n): return n", language: "python", color: "#3776ab" },
  { code: "import pandas as pd", language: "python", color: "#3776ab" },
  {
    code: "list(map(lambda x: x*2, arr))",
    language: "python",
    color: "#3776ab",
  },
  { code: "if __name__ == '__main__':", language: "python", color: "#3776ab" },

  // Java
  {
    code: "public static void main(String[] args)",
    language: "java",
    color: "#ed8b00",
  },
  {
    code: "List<String> items = new ArrayList<>()",
    language: "java",
    color: "#ed8b00",
  },
  {
    code: "try { execute(); } catch (Exception e)",
    language: "java",
    color: "#ed8b00",
  },

  // Go
  {
    code: 'func main() { fmt.Println("Hello") }',
    language: "go",
    color: "#00add8",
  },
  { code: "go func() { /* goroutine */ }()", language: "go", color: "#00add8" },
  {
    code: "type User struct { Name string }",
    language: "go",
    color: "#00add8",
  },

  // Rust
  {
    code: "fn main() -> Result<(), Error>",
    language: "rust",
    color: "#ce422b",
  },
  { code: "let mut vec = Vec::new()", language: "rust", color: "#ce422b" },
  {
    code: "match result { Ok(val) => val }",
    language: "rust",
    color: "#ce422b",
  },

  // C++
  { code: "#include <iostream>", language: "cpp", color: "#00599c" },
  { code: "std::vector<int> nums{1, 2, 3}", language: "cpp", color: "#00599c" },
  {
    code: "auto lambda = [](int x) { return x; }",
    language: "cpp",
    color: "#00599c",
  },

  // PHP
  { code: "<?php echo 'Hello World'; ?>", language: "php", color: "#777bb4" },
  {
    code: "$users = array_map('trim', $data)",
    language: "php",
    color: "#777bb4",
  },

  // Swift
  {
    code: "func greet(name: String) -> String",
    language: "swift",
    color: "#fa7343",
  },
  {
    code: "let numbers = [1, 2, 3].map { $0 * 2 }",
    language: "swift",
    color: "#fa7343",
  },

  // Kotlin
  {
    code: 'fun main() = println("Hello")',
    language: "kotlin",
    color: "#7f52ff",
  },
  {
    code: "data class User(val name: String)",
    language: "kotlin",
    color: "#7f52ff",
  },
];

// 随机数生成器（基于种子）
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

// 生成随机多边形点
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
    const angle = i * angleStep + rng.range(-0.3, 0.3); // 添加随机偏移
    const radius = size * rng.range(0.7, 1.3); // 随机半径变化
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(" ");
}

// 生成漂浮文字数据
function generateFloatingTexts(rng: SeededRandom, complexity: string) {
  const textCounts = {
    simple: 6,
    medium: 10,
    complex: 15,
  };

  const count = textCounts[complexity as keyof typeof textCounts];

  return Array.from({ length: count }, (_, i) => {
    const statement = rng.choice(codeStatements);
    const text = statement.code;
    const language = statement.language;
    const syntaxColor = statement.color;

    // 生成随机垂直位置，水平位置由动画控制
    const y = rng.range(15, 85); // 15%-85% 垂直位置

    // 统一字号为 1.2rem
    const fontSize = 1.2;
    const minOpacity = rng.range(0.08, 0.15); // 最小透明度
    const maxOpacity = rng.range(0.2, 0.4); // 最大透明度

    // 生成随机动画参数
    const duration = rng.range(20, 80); // 更长的动画持续时间，更缓慢
    const delay = rng.range(0, 1); // 极短延迟，让文字几乎立即显示
    const direction = rng.choice(["normal", "reverse"]); // 左到右 或 右到左

    // 根据方向选择动画类型
    const animationType =
      direction === "reverse"
        ? rng.choice(["floatTextHorizontalReverse", "floatAndFlickerReverse"])
        : rng.choice(["floatTextHorizontal", "floatAndFlicker"]);

    // 生成随机的起始和结束位置，让文字可以中途出现或消失
    const startX = rng.range(-30, 50); // 起始位置：-30vw 到 50vw
    const endX = rng.range(50, 130); // 结束位置：50vw 到 130vw

    // 确保有足够的运动距离
    const minDistance = 40; // 最小运动距离 40vw
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

    // 根据复杂度确定元素数量
    const elementCounts = {
      simple: { polygons: 3, lines: 2, particles: 2 }, // 减少几何元素，为文字让路
      medium: { polygons: 4, lines: 3, particles: 3 },
      complex: { polygons: 6, lines: 4, particles: 4 },
    };

    const counts = elementCounts[complexity];

    // 生成随机多边形 (减少透明度，让文字更突出)
    const polygons = Array.from({ length: counts.polygons }, (_, i) => {
      const centerX = rng.range(0, 1200);
      const centerY = rng.range(0, 800);
      const size = rng.range(60, 150); // 减小尺寸
      const sides = rng.choice([3, 4, 5, 6]);
      const gradientId = `grad${i + 1}`;

      // 随机渐变方向
      const directions = [
        { x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
        { x1: "100%", y1: "0%", x2: "0%", y2: "100%" },
        { x1: "0%", y1: "100%", x2: "100%", y2: "0%" },
        { x1: "50%", y1: "0%", x2: "50%", y2: "100%" },
        { x1: "0%", y1: "50%", x2: "100%", y2: "50%" },
      ];

      const direction = rng.choice(directions);
      const opacity1 = rng.range(0.01, 0.06); // 更低的透明度
      const opacity2 = rng.range(0.01, 0.04);
      const animationDuration = rng.range(20, 40);
      const pulseRate = rng.range(10, 25);

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

    // 生成随机连接线 (同样减少透明度)
    const lines = Array.from({ length: counts.lines }, (_, i) => {
      const x1 = rng.range(0, 1200);
      const y1 = rng.range(0, 800);
      const x2 = rng.range(0, 1200);
      const y2 = rng.range(0, 800);
      const isVertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
      const gradientId = `lineGrad${i + 1}`;
      const opacity = rng.range(0.02, 0.1); // 降低透明度
      const animationDuration = rng.range(30, 50);
      const pulseRate = rng.range(8, 16);

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

    // 生成随机粒子 (减少数量和透明度)
    const particles = Array.from({ length: counts.particles }, () => {
      const x = rng.range(10, 90); // 百分比位置
      const y = rng.range(10, 90);
      const size = rng.range(0.5, 1.5); // 减小尺寸
      const opacity = rng.range(0.05, 0.2);
      const animationDuration = rng.range(8, 25);

      return { x, y, size, opacity, animationDuration };
    });

    // 生成漂浮文字
    const floatingTexts = generateFloatingTexts(rng, complexity);

    return { polygons, lines, particles, floatingTexts };
  }, [seed, complexity]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 主要几何形状 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 动态生成的渐变 */}
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

          {/* 线条渐变 */}
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

        {/* 动态生成的多边形 */}
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

      {/* 连接线条层 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 动态生成的连接线 */}
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

      {/* 浮动粒子 */}
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

      {/* 漂浮文字层 - 横向漂浮闪烁效果与语法高亮 */}
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
                color: textItem.syntaxColor,
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
