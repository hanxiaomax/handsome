import { useMemo } from "react";
import "./custom-background.css";

interface CustomBackgroundProps {
  seed?: string; // 可选的种子值，用于可重现的随机效果
  complexity?: "simple" | "medium" | "complex"; // 复杂度控制
  animated?: boolean; // 是否启用动画
}

// 工具名称多语言数据
const toolNames = [
  { en: "Programmer Calculator", zh: "程序员计算器", ja: "プログラマー電卓" },
  { en: "UUID Generator", zh: "UUID生成器", ja: "UUID生成器" },
  { en: "World Clock", zh: "世界时钟", ja: "世界時計" },
  { en: "Unit Converter", zh: "单位转换器", ja: "単位変換器" },
  { en: "Unix Timestamp", zh: "Unix时间戳", ja: "Unixタイムスタンプ" },
  { en: "Markdown Editor", zh: "Markdown编辑器", ja: "Markdownエディタ" },
  { en: "Emoji Library", zh: "表情符号库", ja: "絵文字ライブラリ" },
  { en: "Color Palette", zh: "调色板", ja: "カラーパレット" },
  { en: "Chart Generator", zh: "图表生成器", ja: "チャート生成器" },
  { en: "XML Parser", zh: "XML解析器", ja: "XMLパーサー" },
  { en: "Text Formatter", zh: "文本格式化", ja: "テキストフォーマッタ" },
  { en: "Code Converter", zh: "代码转换器", ja: "コード変換器" },
  { en: "Hash Generator", zh: "哈希生成器", ja: "ハッシュ生成器" },
  { en: "QR Code", zh: "二维码", ja: "QRコード" },
  { en: "Image Optimizer", zh: "图片优化器", ja: "画像最適化" },
  { en: "JSON Validator", zh: "JSON验证器", ja: "JSONバリデータ" },
  { en: "CSS Generator", zh: "CSS生成器", ja: "CSS生成器" },
  { en: "Password Generator", zh: "密码生成器", ja: "パスワード生成器" },
  { en: "Base64 Encoder", zh: "Base64编码", ja: "Base64エンコーダ" },
  { en: "URL Shortener", zh: "链接缩短", ja: "URL短縮" },
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
  const languages: ("en" | "zh" | "ja")[] = ["en", "zh", "ja"];

  return Array.from({ length: count }, (_, i) => {
    const tool = rng.choice(toolNames);
    const lang = rng.choice(languages);
    const text = tool[lang];

    // 生成随机垂直位置，水平位置由动画控制
    const y = rng.range(15, 85); // 15%-85% 垂直位置

    // 生成随机样式
    const fontSize = rng.range(0.8, 2.2); // rem，稍微小一点
    const minOpacity = rng.range(0.02, 0.05); // 最小透明度
    const maxOpacity = rng.range(0.08, 0.15); // 最大透明度

    // 生成随机动画参数
    const duration = rng.range(30, 80); // 更长的动画持续时间，更缓慢
    const delay = rng.range(0, 3); // 极短延迟，让文字几乎立即显示
    const direction = rng.choice(["normal", "reverse"]); // 左到右 或 右到左

    // 根据方向选择动画类型
    const animationType =
      direction === "reverse"
        ? rng.choice(["floatTextHorizontalReverse", "floatAndFlickerReverse"])
        : rng.choice(["floatTextHorizontal", "floatAndFlicker"]);

    return {
      id: `text-${i}`,
      text,
      language: lang,
      y,
      fontSize,
      minOpacity,
      maxOpacity,
      duration,
      delay,
      direction,
      animationType,
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

      {/* 漂浮文字层 - 横向漂浮闪烁效果 */}
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
                color: "hsl(var(--foreground))",
                opacity: 0,
                visibility: "hidden",
                "--min-opacity": textItem.minOpacity,
                "--max-opacity": textItem.maxOpacity,
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
