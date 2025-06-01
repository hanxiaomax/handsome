import type {
  ChartConfig,
  RadarChartConfig,
  SWOTConfig,
  PriorityMatrixConfig,
  KanoModelConfig,
} from "./types";

interface ChartCanvasProps {
  chart: ChartConfig | null;
}

export function ChartCanvas({ chart }: ChartCanvasProps) {
  if (!chart) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center">
            📊
          </div>
          <p className="text-sm text-muted-foreground">No chart selected</p>
        </div>
      </div>
    );
  }

  switch (chart.type) {
    case "radar":
      return <RadarChart chart={chart as RadarChartConfig} />;
    case "swot":
      return <SWOTChart chart={chart as SWOTConfig} />;
    case "priority-matrix":
      return <PriorityMatrixChart chart={chart as PriorityMatrixConfig} />;
    case "kano-model":
      return <KanoModelChart chart={chart as KanoModelConfig} />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted/10">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center">
              ⚠️
            </div>
            <p className="text-sm text-muted-foreground">
              Chart type "{chart.type}" not supported
            </p>
          </div>
        </div>
      );
  }
}

// Radar Chart Component
function RadarChart({ chart }: { chart: RadarChartConfig }) {
  if (!chart.data || chart.data.length === 0) {
    return <EmptyChart message="No radar data available" />;
  }

  const dataset = chart.data[0];
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const dimensions = dataset.data;

  // Calculate points for the polygon
  const points = dimensions.map((item, index) => {
    const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
    const normalizedValue =
      (item.value - chart.scale.min) / (chart.scale.max - chart.scale.min);
    const distance = normalizedValue * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return { x, y, angle, label: item.dimension, value: item.value };
  });

  // Grid points for background
  const gridPoints = dimensions.map((_, index) => {
    const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    return { x, y, angle };
  });

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Background grid */}
        <g stroke="#e5e7eb" strokeWidth="1" fill="none">
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
            <polygon
              key={scale}
              points={gridPoints
                .map((point) => {
                  const x = centerX + (point.x - centerX) * scale;
                  const y = centerY + (point.y - centerY) * scale;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          ))}
          {gridPoints.map((point, index) => (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
            />
          ))}
        </g>

        {/* Data polygon */}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill={chart.theme.colors.primary[0] + "40"}
          stroke={chart.theme.colors.primary[0]}
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={chart.theme.colors.primary[0]}
          />
        ))}

        {/* Labels */}
        {points.map((point, index) => {
          const labelX = centerX + Math.cos(point.angle) * (radius + 20);
          const labelY = centerY + Math.sin(point.angle) * (radius + 20);
          return (
            <g key={index}>
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#374151"
                fontWeight="medium"
              >
                {point.label}
              </text>
              <text
                x={labelX}
                y={labelY + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {point.value}
              </text>
            </g>
          );
        })}

        {/* Title */}
        <text
          x={centerX}
          y={30}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#1f2937"
        >
          {chart.title}
        </text>
      </svg>
    </div>
  );
}

// SWOT Chart Component
function SWOTChart({ chart }: { chart: SWOTConfig }) {
  const sections = [
    {
      key: "strengths",
      label: "Strengths",
      color: "#dcfce7",
      textColor: "#166534",
    },
    {
      key: "weaknesses",
      label: "Weaknesses",
      color: "#fee2e2",
      textColor: "#991b1b",
    },
    {
      key: "opportunities",
      label: "Opportunities",
      color: "#dbeafe",
      textColor: "#1e40af",
    },
    {
      key: "threats",
      label: "Threats",
      color: "#fef3c7",
      textColor: "#92400e",
    },
  ] as const;

  return (
    <div className="w-full h-full bg-white p-4">
      <div className="h-full grid grid-cols-2 gap-2">
        {sections.map((section) => (
          <div
            key={section.key}
            className="border-2 rounded-lg p-3 flex flex-col"
            style={{
              backgroundColor: section.color,
              borderColor: section.textColor + "40",
            }}
          >
            <h3
              className="font-bold text-sm mb-2 text-center"
              style={{ color: section.textColor }}
            >
              {section.label}
            </h3>
            <div className="flex-1 space-y-1">
              {chart.data[section.key].slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="text-xs p-1 bg-white/60 rounded text-gray-700"
                >
                  {item.text}
                </div>
              ))}
              {chart.data[section.key].length > 4 && (
                <div className="text-xs text-gray-500 text-center">
                  +{chart.data[section.key].length - 4} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-2">
        <h2 className="font-bold text-sm text-gray-800">{chart.title}</h2>
      </div>
    </div>
  );
}

// Priority Matrix Chart Component
function PriorityMatrixChart({ chart }: { chart: PriorityMatrixConfig }) {
  const maxX = chart.axes.x.max;
  const maxY = chart.axes.y.max;

  return (
    <div className="w-full h-full bg-white p-4">
      <div className="h-full flex flex-col">
        <h2 className="font-bold text-sm text-center mb-2 text-gray-800">
          {chart.title}
        </h2>

        <div className="flex-1 relative">
          {/* Background quadrants */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
            <div className="bg-yellow-100 rounded-tl border border-yellow-200 flex items-center justify-center">
              <span className="text-xs text-yellow-700 font-medium">
                Quick Wins
              </span>
            </div>
            <div className="bg-green-100 rounded-tr border border-green-200 flex items-center justify-center">
              <span className="text-xs text-green-700 font-medium">
                Big Bets
              </span>
            </div>
            <div className="bg-gray-100 rounded-bl border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-700 font-medium">
                Fill-ins
              </span>
            </div>
            <div className="bg-red-100 rounded-br border border-red-200 flex items-center justify-center">
              <span className="text-xs text-red-700 font-medium">Maybes</span>
            </div>
          </div>

          {/* Data points */}
          <div className="absolute inset-0">
            {chart.data.map((item) => {
              const x = (item.x / maxX) * 100;
              const y = ((maxY - item.y) / maxY) * 100; // Flip Y axis
              return (
                <div
                  key={item.id}
                  className="absolute w-3 h-3 bg-blue-600 rounded-full -translate-x-1.5 -translate-y-1.5"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${item.name}: Effort ${item.x}, Impact ${item.y}`}
                />
              );
            })}
          </div>
        </div>

        {/* Axis labels */}
        <div className="flex justify-between items-end mt-2">
          <div className="text-xs text-gray-600 transform -rotate-90 origin-center">
            Impact →
          </div>
          <div className="text-xs text-gray-600">← Effort →</div>
        </div>
      </div>
    </div>
  );
}

// Kano Model Chart Component
function KanoModelChart({ chart }: { chart: KanoModelConfig }) {
  const centerX = 150;
  const centerY = 150;
  const scale = 40;

  const categoryColors = {
    "must-be": "#ef4444",
    "one-dimensional": "#f59e0b",
    attractive: "#10b981",
    indifferent: "#6b7280",
    reverse: "#8b5cf6",
    questionable: "#ec4899",
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Background grid */}
        <g stroke="#e5e7eb" strokeWidth="1">
          {/* Vertical lines */}
          {[-2, -1, 0, 1, 2].map((val) => (
            <line
              key={`v${val}`}
              x1={centerX + val * scale}
              y1={50}
              x2={centerX + val * scale}
              y2={250}
              strokeDasharray={val === 0 ? "none" : "3,3"}
            />
          ))}
          {/* Horizontal lines */}
          {[-2, -1, 0, 1, 2].map((val) => (
            <line
              key={`h${val}`}
              x1={50}
              y1={centerY - val * scale}
              x2={250}
              y2={centerY - val * scale}
              strokeDasharray={val === 0 ? "none" : "3,3"}
            />
          ))}
        </g>

        {/* Axis lines */}
        <g stroke="#374151" strokeWidth="2">
          <line x1={centerX} y1={50} x2={centerX} y2={250} />
          <line x1={50} y1={centerY} x2={250} y2={centerY} />
        </g>

        {/* Data points */}
        {chart.data.map((feature) => {
          const x = centerX + (feature.functionality * scale) / 3;
          const y = centerY - (feature.dysfunctionality * scale) / 3;
          const color = categoryColors[feature.category];

          return (
            <circle
              key={feature.id}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis labels */}
        <text
          x={centerX + 120}
          y={centerY + 5}
          fontSize="12"
          fill="#6b7280"
          textAnchor="middle"
        >
          Functional →
        </text>
        <text
          x={centerX - 5}
          y={80}
          fontSize="12"
          fill="#6b7280"
          textAnchor="middle"
          transform={`rotate(-90, ${centerX - 5}, 80)`}
        >
          ← Dysfunctional
        </text>

        {/* Title */}
        <text
          x={centerX}
          y={30}
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#1f2937"
        >
          {chart.title}
        </text>
      </svg>
    </div>
  );
}

// Empty Chart Placeholder
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted/10">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center">
          📈
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
