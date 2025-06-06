import { useMemo } from "react";

interface LowPolyBackgroundProps {
  seed?: string; // 可选的种子值，用于可重现的随机效果
  complexity?: "simple" | "medium" | "complex"; // 复杂度控制
  animated?: boolean; // 是否启用动画
}

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

export function LowPolyBackground({
  seed,
  complexity = "medium",
  animated = true,
}: LowPolyBackgroundProps) {
  const backgroundData = useMemo(() => {
    const rng = new SeededRandom(seed || `${Date.now()}-${Math.random()}`);

    // 根据复杂度确定元素数量
    const elementCounts = {
      simple: { polygons: 4, lines: 3, particles: 3 },
      medium: { polygons: 7, lines: 6, particles: 5 },
      complex: { polygons: 12, lines: 10, particles: 8 },
    };

    const counts = elementCounts[complexity];

    // 生成随机多边形
    const polygons = Array.from({ length: counts.polygons }, (_, i) => {
      const centerX = rng.range(0, 1200);
      const centerY = rng.range(0, 800);
      const size = rng.range(80, 200);
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
      const opacity1 = rng.range(0.02, 0.12);
      const opacity2 = rng.range(0.02, 0.08);
      const animationDuration = rng.range(15, 35);
      const pulseRate = rng.range(8, 18);

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

    // 生成随机连接线
    const lines = Array.from({ length: counts.lines }, (_, i) => {
      const x1 = rng.range(0, 1200);
      const y1 = rng.range(0, 800);
      const x2 = rng.range(0, 1200);
      const y2 = rng.range(0, 800);
      const isVertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
      const gradientId = `lineGrad${i + 1}`;
      const opacity = rng.range(0.05, 0.25);
      const animationDuration = rng.range(25, 45);
      const pulseRate = rng.range(6, 14);

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

    // 生成随机粒子
    const particles = Array.from({ length: counts.particles }, () => {
      const x = rng.range(10, 90); // 百分比位置
      const y = rng.range(10, 90);
      const size = rng.range(1, 3);
      const opacity = rng.range(0.08, 0.3);
      const animationDuration = rng.range(6, 20);

      return { x, y, size, opacity, animationDuration };
    });

    return { polygons, lines, particles };
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
    </div>
  );
}
