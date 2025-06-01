// Chart Types
export type ChartType = "radar" | "swot" | "priority-matrix" | "kano-model";

// Base Chart Configuration
export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  theme: ChartTheme;
  createdAt: Date;
  updatedAt: Date;
}

// Chart Themes
export interface ChartTheme {
  name: string;
  colors: {
    primary: string[];
    secondary: string[];
    background: string;
    text: string;
    grid: string;
  };
  fonts: {
    title: string;
    label: string;
    data: string;
  };
}

// Radar Chart Specific
export interface RadarChartConfig extends ChartConfig {
  type: "radar";
  data: RadarDataSet[];
  scale: {
    min: number;
    max: number;
    step: number;
  };
  showGrid: boolean;
  showLabels: boolean;
}

export interface RadarDataSet {
  id: string;
  name: string;
  color: string;
  data: Array<{
    dimension: string;
    value: number;
  }>;
}

// SWOT Analysis Specific
export interface SWOTConfig extends ChartConfig {
  type: "swot";
  data: {
    strengths: SWOTItem[];
    weaknesses: SWOTItem[];
    opportunities: SWOTItem[];
    threats: SWOTItem[];
  };
  layout: "grid" | "circular" | "matrix";
}

export interface SWOTItem {
  id: string;
  text: string;
  priority: number;
  category?: string;
}

// Priority Matrix Specific
export interface PriorityMatrixConfig extends ChartConfig {
  type: "priority-matrix";
  data: PriorityItem[];
  axes: {
    x: { label: string; min: number; max: number };
    y: { label: string; min: number; max: number };
  };
  quadrants: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

export interface PriorityItem {
  id: string;
  name: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  description?: string;
}

// Kano Model Specific
export interface KanoModelConfig extends ChartConfig {
  type: "kano-model";
  data: KanoFeature[];
  axes: {
    x: { label: string; min: number; max: number };
    y: { label: string; min: number; max: number };
  };
  zones: {
    mustBe: string;
    oneDimensional: string;
    attractive: string;
    indifferent: string;
    reverse: string;
  };
}

export interface KanoFeature {
  id: string;
  name: string;
  functionality: number; // x-axis: functional question response
  dysfunctionality: number; // y-axis: dysfunctional question response
  category:
    | "must-be"
    | "one-dimensional"
    | "attractive"
    | "indifferent"
    | "reverse"
    | "questionable";
  description?: string;
}

// Chart Templates
export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  type: ChartType;
  category: TemplateCategory;
  config: Partial<ChartConfig>;
  preview: string; // Base64 preview image
  tags: string[];
}

export type TemplateCategory =
  | "competitive-analysis"
  | "product-strategy"
  | "team-assessment"
  | "feature-planning"
  | "market-analysis";

// Export Configuration
export interface ExportConfig {
  format: "png" | "svg" | "pdf" | "json";
  quality: "low" | "medium" | "high" | "print";
  dimensions: {
    width: number;
    height: number;
  };
  includeTitle: boolean;
  includeWatermark: boolean;
  backgroundColor: string;
}

// Application State
export interface ProductChartState {
  currentChart: ChartConfig | null;
  templates: ChartTemplate[];
  savedCharts: ChartConfig[];
  isEditing: boolean;
  isExporting: boolean;
  exportProgress: number;
  selectedTemplate: string | null;
  viewMode: "edit" | "preview" | "fullscreen";
  sidebarOpen: boolean;
  activeTab: "types" | "data" | "style" | "export";
}

// Chart Creation Options
export interface CreateChartOptions {
  type: ChartType;
  template?: ChartTemplate;
  title?: string;
  initialData?:
    | RadarDataSet[]
    | SWOTConfig["data"]
    | PriorityItem[]
    | KanoFeature[];
}

// Data Import/Export
export interface ImportData {
  format: "csv" | "json";
  data: string;
  mapping?: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Chart Rendering Props
export interface ChartRenderProps {
  width: number;
  height: number;
  interactive?: boolean;
  theme?: ChartTheme;
  onDataChange?: (
    data: RadarDataSet[] | SWOTConfig["data"] | PriorityItem[] | KanoFeature[]
  ) => void;
  onError?: (error: string) => void;
}
