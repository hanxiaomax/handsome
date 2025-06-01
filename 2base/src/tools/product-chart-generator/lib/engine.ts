import type {
  ChartConfig,
  ChartType,
  ChartTemplate,
  ChartTheme,
  RadarChartConfig,
  RadarDataSet,
  SWOTConfig,
  PriorityMatrixConfig,
  PriorityItem,
  KanoModelConfig,
  KanoFeature,
  CreateChartOptions,
  ValidationResult,
  ImportData,
} from "../types";

// Default themes
const defaultThemes: Record<string, ChartTheme> = {
  default: {
    name: "Default",
    colors: {
      primary: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
      ],
      secondary: [
        "#93C5FD",
        "#6EE7B7",
        "#FCD34D",
        "#FCA5A5",
        "#C4B5FD",
        "#67E8F9",
      ],
      background: "#FFFFFF",
      text: "#1F2937",
      grid: "#E5E7EB",
    },
    fonts: {
      title: "Inter",
      label: "Inter",
      data: "Inter",
    },
  },
  professional: {
    name: "Professional",
    colors: {
      primary: [
        "#1E40AF",
        "#059669",
        "#D97706",
        "#DC2626",
        "#7C3AED",
        "#0891B2",
      ],
      secondary: [
        "#DBEAFE",
        "#D1FAE5",
        "#FED7AA",
        "#FEE2E2",
        "#EDE9FE",
        "#E0F2FE",
      ],
      background: "#FFFFFF",
      text: "#374151",
      grid: "#D1D5DB",
    },
    fonts: {
      title: "Inter",
      label: "Inter",
      data: "Inter",
    },
  },
  dark: {
    name: "Dark",
    colors: {
      primary: [
        "#60A5FA",
        "#34D399",
        "#FBBF24",
        "#F87171",
        "#A78BFA",
        "#22D3EE",
      ],
      secondary: [
        "#1E3A8A",
        "#065F46",
        "#92400E",
        "#991B1B",
        "#5B21B6",
        "#164E63",
      ],
      background: "#111827",
      text: "#F9FAFB",
      grid: "#374151",
    },
    fonts: {
      title: "Inter",
      label: "Inter",
      data: "Inter",
    },
  },
};

// Storage keys
const STORAGE_KEYS = {
  CHARTS: "product-chart-generator-charts",
  TEMPLATES: "product-chart-generator-templates",
  SETTINGS: "product-chart-generator-settings",
} as const;

export class ProductChartEngine {
  private charts: ChartConfig[] = [];
  private templates: ChartTemplate[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultTemplates();
  }

  // Chart Management
  createChart(options: CreateChartOptions): ChartConfig {
    const id = this.generateId();
    const now = new Date();

    const baseConfig: ChartConfig = {
      id,
      type: options.type,
      title: options.title || this.getDefaultTitle(options.type),
      description: "",
      theme: defaultThemes.default,
      createdAt: now,
      updatedAt: now,
    };

    let chartConfig: ChartConfig;

    switch (options.type) {
      case "radar": {
        chartConfig = {
          ...baseConfig,
          type: "radar",
          data:
            (options.initialData as RadarDataSet[]) ||
            this.getDefaultRadarData(),
          scale: { min: 0, max: 10, step: 1 },
          showGrid: true,
          showLabels: true,
        } as RadarChartConfig;
        break;
      }
      case "swot": {
        chartConfig = {
          ...baseConfig,
          type: "swot",
          data:
            (options.initialData as SWOTConfig["data"]) ||
            this.getDefaultSWOTData(),
          layout: "grid",
        } as SWOTConfig;
        break;
      }
      case "priority-matrix": {
        chartConfig = {
          ...baseConfig,
          type: "priority-matrix",
          data:
            (options.initialData as PriorityItem[]) ||
            this.getDefaultPriorityData(),
          axes: {
            x: { label: "Effort", min: 0, max: 10 },
            y: { label: "Impact", min: 0, max: 10 },
          },
          quadrants: {
            topLeft: "Quick Wins",
            topRight: "Big Bets",
            bottomLeft: "Fill-ins",
            bottomRight: "Maybes",
          },
        } as PriorityMatrixConfig;
        break;
      }
      case "kano-model": {
        chartConfig = {
          ...baseConfig,
          type: "kano-model",
          data:
            (options.initialData as KanoFeature[]) || this.getDefaultKanoData(),
          axes: {
            x: { label: "Functional", min: -3, max: 3 },
            y: { label: "Dysfunctional", min: -3, max: 3 },
          },
          zones: {
            mustBe: "Must-be",
            oneDimensional: "One-dimensional",
            attractive: "Attractive",
            indifferent: "Indifferent",
            reverse: "Reverse",
          },
        } as KanoModelConfig;
        break;
      }
      default:
        throw new Error(`Unsupported chart type: ${options.type}`);
    }

    this.charts.push(chartConfig);
    this.saveToStorage();
    return chartConfig;
  }

  updateChart(id: string, updates: Partial<ChartConfig>): ChartConfig {
    const chartIndex = this.charts.findIndex((chart) => chart.id === id);
    if (chartIndex === -1) {
      throw new Error(`Chart with id ${id} not found`);
    }

    const updatedChart = {
      ...this.charts[chartIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.charts[chartIndex] = updatedChart;
    this.saveToStorage();
    return updatedChart;
  }

  deleteChart(id: string): boolean {
    const chartIndex = this.charts.findIndex((chart) => chart.id === id);
    if (chartIndex === -1) {
      return false;
    }

    this.charts.splice(chartIndex, 1);
    this.saveToStorage();
    return true;
  }

  getChart(id: string): ChartConfig | null {
    return this.charts.find((chart) => chart.id === id) || null;
  }

  getAllCharts(): ChartConfig[] {
    return [...this.charts];
  }

  // Template Management
  getTemplates(): ChartTemplate[] {
    return [...this.templates];
  }

  getTemplatesByType(type: ChartType): ChartTemplate[] {
    return this.templates.filter((template) => template.type === type);
  }

  createTemplate(
    chart: ChartConfig,
    name: string,
    description: string,
    category: string
  ): ChartTemplate {
    const template: ChartTemplate = {
      id: this.generateId(),
      name,
      description,
      type: chart.type,
      category: category as ChartTemplate["category"],
      config: chart,
      preview: "",
      tags: [],
    };

    this.templates.push(template);
    this.saveToStorage();
    return template;
  }

  // Data Validation
  validateChartData(
    type: ChartType,
    data: RadarDataSet[] | SWOTConfig["data"] | PriorityItem[] | KanoFeature[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (type) {
      case "radar": {
        const radarData = data as RadarDataSet[];
        if (!Array.isArray(radarData)) {
          errors.push("Radar chart data must be an array");
          break;
        }

        radarData.forEach((dataset, index) => {
          if (!dataset.name) {
            errors.push(`Dataset ${index + 1} is missing a name`);
          }
          if (!Array.isArray(dataset.data)) {
            errors.push(`Dataset ${index + 1} data must be an array`);
          }
          if (dataset.data.length === 0) {
            warnings.push(`Dataset ${index + 1} has no data points`);
          }
        });
        break;
      }
      case "swot": {
        const swotData = data as SWOTConfig["data"];
        if (!swotData || typeof swotData !== "object") {
          errors.push(
            "SWOT data must be an object with strengths, weaknesses, opportunities, and threats"
          );
          break;
        }

        const requiredKeys = [
          "strengths",
          "weaknesses",
          "opportunities",
          "threats",
        ];
        requiredKeys.forEach((key) => {
          if (!Array.isArray(swotData[key as keyof typeof swotData])) {
            errors.push(`SWOT ${key} must be an array`);
          }
        });
        break;
      }
      // Add validation for other chart types...
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Export Functions
  async exportChart(chart: ChartConfig): Promise<Blob> {
    // This would integrate with canvas/svg rendering
    // For now, return a placeholder
    const jsonData = JSON.stringify(chart, null, 2);
    return new Blob([jsonData], { type: "application/json" });
  }

  async exportToClipboard(chart: ChartConfig): Promise<boolean> {
    try {
      const jsonData = JSON.stringify(chart, null, 2);
      await navigator.clipboard.writeText(jsonData);
      return true;
    } catch {
      return false;
    }
  }

  // Data Import/Export
  importData(importData: ImportData): Record<string, string>[] | object {
    try {
      if (importData.format === "json") {
        return JSON.parse(importData.data);
      } else if (importData.format === "csv") {
        // Basic CSV parsing - would use papaparse in real implementation
        const lines = importData.data.split("\n");
        const headers = lines[0].split(",");
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || "";
          });
          return obj;
        });
        return data;
      }
      return [];
    } catch (error) {
      throw new Error(
        `Failed to import data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  exportData(chart: ChartConfig, format: "csv" | "json"): string {
    if (format === "json") {
      return JSON.stringify(chart, null, 2);
    } else {
      // Basic CSV export - would implement proper CSV generation
      return "CSV export not implemented yet";
    }
  }

  // Theme Management
  getThemes(): ChartTheme[] {
    return Object.values(defaultThemes);
  }

  getTheme(name: string): ChartTheme {
    return defaultThemes[name] || defaultThemes.default;
  }

  // Private Helper Methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDefaultTitle(type: ChartType): string {
    switch (type) {
      case "radar":
        return "Product Feature Comparison";
      case "swot":
        return "SWOT Analysis";
      case "priority-matrix":
        return "Feature Priority Matrix";
      case "kano-model":
        return "Kano Model Analysis";
      default:
        return "Chart";
    }
  }

  private getDefaultRadarData(): RadarDataSet[] {
    return [
      {
        id: "dataset-1",
        name: "Current Product",
        color: "#3B82F6",
        data: [
          { dimension: "Performance", value: 7 },
          { dimension: "Usability", value: 8 },
          { dimension: "Features", value: 6 },
          { dimension: "Reliability", value: 9 },
          { dimension: "Support", value: 7 },
        ],
      },
    ];
  }

  private getDefaultSWOTData(): SWOTConfig["data"] {
    return {
      strengths: [
        { id: "s1", text: "Strong brand recognition", priority: 1 },
        { id: "s2", text: "Experienced team", priority: 2 },
      ],
      weaknesses: [
        { id: "w1", text: "Limited market presence", priority: 1 },
        { id: "w2", text: "High operational costs", priority: 2 },
      ],
      opportunities: [
        { id: "o1", text: "Growing market demand", priority: 1 },
        { id: "o2", text: "New technology adoption", priority: 2 },
      ],
      threats: [
        { id: "t1", text: "Increasing competition", priority: 1 },
        { id: "t2", text: "Economic uncertainty", priority: 2 },
      ],
    };
  }

  private getDefaultPriorityData(): PriorityItem[] {
    return [
      {
        id: "p1",
        name: "User Authentication",
        x: 3,
        y: 9,
        description: "Basic login/register functionality",
      },
      {
        id: "p2",
        name: "Dashboard",
        x: 6,
        y: 8,
        description: "Main user dashboard",
      },
      {
        id: "p3",
        name: "Analytics",
        x: 8,
        y: 6,
        description: "Advanced analytics features",
      },
      {
        id: "p4",
        name: "Mobile App",
        x: 9,
        y: 7,
        description: "Native mobile application",
      },
    ];
  }

  private getDefaultKanoData(): KanoFeature[] {
    return [
      {
        id: "k1",
        name: "Basic Functionality",
        functionality: 1,
        dysfunctionality: -2,
        category: "must-be",
      },
      {
        id: "k2",
        name: "Fast Performance",
        functionality: 2,
        dysfunctionality: -1,
        category: "one-dimensional",
      },
      {
        id: "k3",
        name: "Surprise Feature",
        functionality: 2,
        dysfunctionality: 0,
        category: "attractive",
      },
    ];
  }

  private initializeDefaultTemplates(): void {
    // Initialize with some default templates if none exist
    if (this.templates.length === 0) {
      // Would load default templates here
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARTS, JSON.stringify(this.charts));
      localStorage.setItem(
        STORAGE_KEYS.TEMPLATES,
        JSON.stringify(this.templates)
      );
    } catch (error) {
      console.error("Failed to save to storage:", error);
    }
  }

  private loadFromStorage(): void {
    try {
      const chartsData = localStorage.getItem(STORAGE_KEYS.CHARTS);
      if (chartsData) {
        this.charts = JSON.parse(chartsData);
      }

      const templatesData = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (templatesData) {
        this.templates = JSON.parse(templatesData);
      }
    } catch (error) {
      console.error("Failed to load from storage:", error);
    }
  }
}
