import type {
  UnitCategory,
  Unit,
  ConversionResult,
  ConversionInfo,
  ProcessOptions,
} from "../types";

/**
 * Unit Converter Engine
 * Core processing engine for unit conversions
 */
export class UnitConverterEngine {
  private categories: Map<string, UnitCategory> = new Map();
  private units: Map<string, Unit> = new Map();

  constructor(categories: UnitCategory[]) {
    this.loadCategories(categories);
  }

  private loadCategories(categories: UnitCategory[]): void {
    for (const category of categories) {
      this.categories.set(category.id, category);
      for (const group of category.groups) {
        for (const unit of group.units) {
          this.units.set(unit.id, unit);
        }
      }
    }
  }

  /**
   * Convert between any two units in the same category
   */
  convert(value: number, fromUnitId: string, toUnitId: string): number {
    const fromUnit = this.units.get(fromUnitId);
    const toUnit = this.units.get(toUnitId);

    if (!fromUnit || !toUnit) {
      throw new Error("Invalid unit IDs");
    }

    // Special handling for temperature
    if (this.isTemperatureUnit(fromUnit)) {
      return this.convertTemperature(value, fromUnit, toUnit);
    }

    // Standard linear conversion
    const baseValue = value * fromUnit.baseRatio;
    return baseValue / toUnit.baseRatio;
  }

  private isTemperatureUnit(unit: Unit): boolean {
    return ["celsius", "fahrenheit", "kelvin", "rankine"].includes(unit.id);
  }

  /**
   * Convert temperature with offset handling
   */
  private convertTemperature(
    value: number,
    fromUnit: Unit,
    toUnit: Unit
  ): number {
    // Convert to Kelvin first (base unit)
    let kelvin: number;

    if (fromUnit.id === "celsius") {
      kelvin = value + 273.15;
    } else if (fromUnit.id === "fahrenheit") {
      kelvin = (value + 459.67) * (5 / 9);
    } else if (fromUnit.id === "kelvin") {
      kelvin = value;
    } else if (fromUnit.id === "rankine") {
      kelvin = value * (5 / 9);
    } else {
      throw new Error("Unsupported temperature unit");
    }

    // Convert from Kelvin to target unit
    if (toUnit.id === "celsius") {
      return kelvin - 273.15;
    } else if (toUnit.id === "fahrenheit") {
      return kelvin * (9 / 5) - 459.67;
    } else if (toUnit.id === "kelvin") {
      return kelvin;
    } else if (toUnit.id === "rankine") {
      return kelvin * (9 / 5);
    } else {
      throw new Error("Unsupported temperature unit");
    }
  }

  /**
   * Convert input to all units in category
   */
  convertToAll(
    value: number,
    inputUnitId: string,
    categoryId: string,
    options: ProcessOptions = {}
  ): ConversionResult[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];

    const results: ConversionResult[] = [];

    for (const group of category.groups) {
      for (const unit of group.units) {
        if (unit.id === inputUnitId) continue;

        try {
          const convertedValue = this.convert(value, inputUnitId, unit.id);
          const formattedValue = this.formatValue(
            convertedValue,
            unit,
            options
          );

          results.push({
            unit,
            value: convertedValue,
            formattedValue,
            scientificValue: unit.scientificNotation
              ? this.toScientificNotation(convertedValue)
              : undefined,
            isApproximate: this.isApproximateConversion(inputUnitId, unit.id),
          });
        } catch (error) {
          console.warn(`Conversion failed for ${unit.id}:`, error);
        }
      }
    }

    return results.sort((a, b) => this.sortUnits(a.unit, b.unit));
  }

  /**
   * Format value based on unit specifications and options
   */
  private formatValue(
    value: number,
    unit: Unit,
    options: ProcessOptions = {}
  ): string {
    const absValue = Math.abs(value);
    const precision = options.precision ?? unit.precision;
    const format = options.format ?? "standard";

    // Use scientific notation only when explicitly requested
    // formattedValue should always show regular format with locale formatting
    if (format === "scientific") {
      return value.toExponential(precision);
    }

    // Use regular formatting with appropriate precision and locale support
    if (absValue >= 1000) {
      return value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: precision,
      });
    }

    return value.toFixed(precision);
  }

  private toScientificNotation(value: number): string {
    return value.toExponential(2);
  }

  private isApproximateConversion(
    fromUnitId: string,
    toUnitId: string
  ): boolean {
    // Some conversions are approximate (e.g., metric to imperial)
    const approximateConversions = [
      ["meter", "inch"],
      ["meter", "foot"],
      ["meter", "yard"],
      ["kilogram", "pound"],
      ["liter", "gallon_us"],
      ["joule", "calorie"],
      ["joule", "btu"],
      ["watt_hour", "btu"],
      ["kilocalorie", "btu"],
      ["celsius", "fahrenheit"],
      ["kelvin", "rankine"],
    ];

    return approximateConversions.some(
      ([a, b]) =>
        (fromUnitId === a && toUnitId === b) ||
        (fromUnitId === b && toUnitId === a)
    );
  }

  private sortUnits(a: Unit, b: Unit): number {
    // Sort by base ratio (smaller units first)
    return a.baseRatio - b.baseRatio;
  }

  /**
   * Generate conversion information
   */
  getConversionInfo(inputUnitId: string, outputUnitId: string): ConversionInfo {
    const inputUnit = this.units.get(inputUnitId);
    const outputUnit = this.units.get(outputUnitId);

    if (!inputUnit || !outputUnit) {
      return {
        formula: "Invalid units",
        explanation: "Unable to generate conversion information",
        precision: "N/A",
      };
    }

    const ratio = outputUnit.baseRatio / inputUnit.baseRatio;

    return {
      formula: `1 ${inputUnit.symbol} = ${ratio.toLocaleString()} ${
        outputUnit.symbol
      }`,
      explanation: `${inputUnit.description} converted to ${outputUnit.description}`,
      precision: `Results shown to ${outputUnit.precision} decimal places`,
      historicalNote: this.getHistoricalNote(inputUnit, outputUnit),
    };
  }

  private getHistoricalNote(
    inputUnit: Unit,
    outputUnit: Unit
  ): string | undefined {
    // Add interesting historical context for certain conversions
    if (inputUnit.id === "meter" && outputUnit.id === "foot") {
      return "The meter was originally defined as 1/10,000,000 of the distance from the equator to the North Pole";
    }
    if (inputUnit.id === "celsius" && outputUnit.id === "fahrenheit") {
      return "Fahrenheit scale was developed by Daniel Gabriel Fahrenheit in 1724";
    }
    return undefined;
  }

  /**
   * Get category by ID
   */
  getCategory(categoryId: string): UnitCategory | undefined {
    return this.categories.get(categoryId);
  }

  /**
   * Get unit by ID
   */
  getUnit(unitId: string): Unit | undefined {
    return this.units.get(unitId);
  }

  /**
   * Get all available categories
   */
  getAllCategories(): UnitCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Search units by name or symbol
   */
  searchUnits(query: string, categoryId?: string): Unit[] {
    const searchTerms = query.toLowerCase().split(" ");
    const results: Unit[] = [];

    for (const unit of this.units.values()) {
      // If category filter is specified, only search within that category
      if (categoryId) {
        const category = this.categories.get(categoryId);
        if (!category) continue;

        const belongsToCategory = category.groups.some((group) =>
          group.units.some((u) => u.id === unit.id)
        );
        if (!belongsToCategory) continue;
      }

      // Search in name and symbol
      const unitSearchText = `${unit.name} ${unit.symbol}`.toLowerCase();
      const matches = searchTerms.every((term) =>
        unitSearchText.includes(term)
      );

      if (matches) {
        results.push(unit);
      }
    }

    return results;
  }
}
