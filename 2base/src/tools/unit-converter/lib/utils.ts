/**
 * Utility function to debounce input
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate unique ID for custom conversions
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Format number with appropriate precision and locale
 */
export function formatNumber(
  value: number,
  precision: number = 6,
  useLocale: boolean = true
): string {
  const absValue = Math.abs(value);

  if (absValue >= 1000 && useLocale) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: precision,
    });
  }

  return value.toFixed(precision);
}

/**
 * Check if a value should use scientific notation
 */
export function shouldUseScientificNotation(value: number): boolean {
  const absValue = Math.abs(value);
  return absValue >= 1e6 || (absValue < 0.001 && absValue > 0);
}

/**
 * Convert to scientific notation
 */
export function toScientificNotation(
  value: number,
  precision: number = 2
): string {
  return value.toExponential(precision);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Download content as file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate numeric input
 */
export function validateNumericInput(value: string): {
  isValid: boolean;
  number: number;
} {
  const num = parseFloat(value);
  return {
    isValid: !isNaN(num) && isFinite(num),
    number: num,
  };
}

/**
 * Execute custom conversion formula safely
 */
export function executeCustomFormula(
  formula: string,
  value: number,
  isJavaScript: boolean = false
): { result: number | null; error: string | null } {
  try {
    if (isJavaScript) {
      // Execute JavaScript conversion
      const func = new Function("value", formula + "\nreturn convert(value);");
      const result = func(value);
      return {
        result: typeof result === "number" ? result : null,
        error: null,
      };
    } else {
      // Execute basic formula (replace x with value)
      const processedFormula = formula.replace(/x/g, value.toString());
      const result = eval(processedFormula);
      return {
        result: typeof result === "number" ? result : null,
        error: null,
      };
    }
  } catch (error) {
    return {
      result: null,
      error: error instanceof Error ? error.message : "Conversion error",
    };
  }
}

/**
 * Sort units by relevance (focused units first, then by base ratio)
 */
export function sortUnitsByRelevance<
  T extends { unit: { id: string; baseRatio: number } }
>(items: T[], focusedUnits: string[]): T[] {
  return items.sort((a, b) => {
    const aIsFocused = focusedUnits.includes(a.unit.id);
    const bIsFocused = focusedUnits.includes(b.unit.id);

    // Focused units come first
    if (aIsFocused && !bIsFocused) return -1;
    if (!aIsFocused && bIsFocused) return 1;

    // If both are focused or both are not focused, sort by base ratio
    return a.unit.baseRatio - b.unit.baseRatio;
  });
}

/**
 * Filter and highlight search results
 */
export function highlightSearchMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * Calculate conversion accuracy level
 */
export function getConversionAccuracy(
  fromUnitId: string,
  toUnitId: string
): "exact" | "approximate" | "estimated" {
  // Exact conversions (within same system or standardized ratios)
  const exactConversions = [
    ["meter", "centimeter", "millimeter", "kilometer"],
    ["gram", "kilogram", "milligram", "tonne"],
    ["celsius", "kelvin"], // Direct mathematical relationship
    ["second", "minute", "hour", "day"],
  ];

  // Approximate conversions (different systems)
  const approximateConversions = [
    ["meter", "inch", "foot", "yard", "mile"],
    ["kilogram", "pound", "ounce", "stone"],
    ["liter", "gallon", "cup", "fluid_ounce"],
  ];

  for (const group of exactConversions) {
    if (group.includes(fromUnitId) && group.includes(toUnitId)) {
      return "exact";
    }
  }

  for (const group of approximateConversions) {
    if (group.includes(fromUnitId) && group.includes(toUnitId)) {
      return "approximate";
    }
  }

  return "estimated";
}
