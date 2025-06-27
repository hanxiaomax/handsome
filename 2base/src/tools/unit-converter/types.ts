// Core types for unit conversion
export interface UnitCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  groups: UnitGroup[];
}

export interface UnitGroup {
  id: string;
  name: string;
  units: Unit[];
  isCollapsed?: boolean;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  baseRatio: number; // Conversion ratio to base unit
  baseOffset?: number; // For temperature conversions
  isBaseUnit: boolean;
  precision: number; // Decimal places to show
  scientificNotation?: boolean; // Use sci notation for large/small numbers
  description: string;
  context: string; // When/why to use this unit
}

export interface ConversionResult {
  unit: Unit;
  value: number;
  formattedValue: string;
  scientificValue?: string;
  isApproximate: boolean;
}

export interface ConversionInfo {
  formula: string;
  explanation: string;
  precision: string;
  historicalNote?: string;
}

// UI State Types
export interface UnitConverterUIState {
  selectedCategory: string;
  inputValue: number;
  inputUnit: string;
  showAllUnits: boolean;
  compactMode: boolean;
  focusedUnits: string[]; // Units that user wants to highlight
  searchQuery: string;
}

// Business State Types
export interface UnitConverterBusinessState {
  isProcessing: boolean;
  results: ConversionResult[];
  conversionInfo: ConversionInfo;
  customConversions: CustomConversion[];
  error: string | null;
}

// Custom Conversion Types
export interface CustomConversion {
  id: string;
  name: string;
  symbol: string;
  description: string;
  formula: string; // JavaScript expression
  isJavaScript: boolean;
  createdAt: Date;
}

// Event Handler Types
export interface UnitConverterEventHandlers {
  onCategoryChange: (categoryId: string) => void;
  onInputValueChange: (value: number) => void;
  onInputUnitChange: (unitId: string) => void;
  onToggleFocus: (unitId: string) => void;
  onCopyValue: (value: string) => void;
  onSwapUnits: (targetUnit: ConversionResult) => void;
  onCalculatorValue: (value: number) => void;
  onCreateCustomConversion: () => void;
  onSaveCustomConversion: (conversion: CustomConversion) => void;
}

// Process Options
export interface ProcessOptions {
  format?: "standard" | "scientific";
  precision?: number;
  includeApproximate?: boolean;
}

// Component Props Types
export interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export interface InputPanelProps {
  value: number;
  unit: string;
  category: string;
  onValueChange: (value: number) => void;
  onUnitChange: (unitId: string) => void;
}

export interface OutputPanelProps {
  results: ConversionResult[];
  focusedUnits: string[];
  customConversions: CustomConversion[];
  inputValue: number;
  inputUnit: string;
  category: string;
  isProcessing: boolean;
  error: string | null;
  onToggleFocus: (unitId: string) => void;
  onCopyValue: (value: string) => void;
  onSwapUnits: (targetUnit: ConversionResult) => void;
  onCreateCustom: () => void;
  onInputValueChange: (value: number) => void;
  onInputUnitChange: (unitId: string) => void;
}

export interface ResultRowProps {
  result: ConversionResult;
  isFocused: boolean;
  onToggleFocus: () => void;
  onCopyValue: () => void;
  onSwapUnits: () => void;
}

export interface CustomConversionRowProps {
  conversion: CustomConversion;
  inputValue: number;
}

// New simplified state type for graph engine
export interface UnitConverterState {
  selectedCategory: string;
  inputValue: string;
  inputUnit: string;
  availableUnits: Array<{ id: string; name: string; symbol: string }>;
  results: ConversionResult[];
  isProcessing: boolean;
  error: string | null;
}

// Legacy compatibility type (will be removed after refactoring)
export interface ConverterState extends UnitConverterUIState {
  results: ConversionResult[];
  conversionInfo: ConversionInfo;
  favorites: string[]; // Deprecated: use focusedUnits instead
}
